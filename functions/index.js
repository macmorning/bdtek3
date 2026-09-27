const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

const formatDate = (date) => {
    if (Date.parse(date) > 0) { return date; }
    else if (date.indexOf("/") > -1) {
        let d = date.split("/");
        let newDate = d[2] + "-" + d[1] + "-" + d[0];
        console.info("formatDate > converting " + date + " to " + newDate);
        return (newDate);
    }
};

// ---------------------------------------------------------------------------
// Recherche bibliographique partagee — utilisee par le trigger d'ajout
// (fetchBookInformations) ET par l'endpoint HTTP du scan (getBookInfo).
//
// Strategie : interroge Open Library (endpoint /isbn/) ET Google Books en
// parallele, puis fusionne pour prendre le meilleur champ disponible de chaque
// source. Garantit un resultat coherent quel que soit le point d'entree.
// ---------------------------------------------------------------------------

/**
 * Recupere les infos d'un livre depuis Open Library via l'endpoint /isbn/.
 * Retourne un objet partiel ou null.
 */
async function lookupOpenLibrary(isbn) {
    try {
        const resp = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
            headers: { "User-Agent": "bdtek/1.0 (+https://bdtek.macmorning.ovh)" }
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        if (!data || !data.title) return null;

        // Auteur : appel secondaire si necessaire
        let author = "";
        if (data.authors && data.authors.length > 0 && data.authors[0].key) {
            try {
                const aResp = await fetch(`https://openlibrary.org${data.authors[0].key}.json`);
                if (aResp.ok) {
                    const aData = await aResp.json();
                    author = aData.name || aData.personal_name || "";
                }
            } catch (_) { /* silencieux */ }
        }

        let imageURL = "";
        if (data.covers && data.covers.length > 0) {
            imageURL = `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg`;
        }

        return {
            title: data.title || "",
            author,
            imageURL,
            publisher: (data.publishers && data.publishers[0]) ? data.publishers[0] : "",
            published: data.publish_date ? (formatDate(data.publish_date) || data.publish_date) : "",
            series: (data.series && data.series[0]) ? data.series[0] : "",
            volume: "",
            detailsURL: `https://openlibrary.org/isbn/${isbn}`
        };
    } catch (err) {
        console.error("lookupOpenLibrary error", err && err.message);
        return null;
    }
}

/**
 * Recupere les infos d'un livre depuis Google Books.
 * Retourne un objet partiel ou null.
 */
async function lookupGoogleBooks(isbn) {
    try {
        const resp = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        if (!resp.ok) return null;
        const data = await resp.json();
        if (!data.totalItems || data.totalItems === 0 || !data.items) return null;
        const vi = data.items[0].volumeInfo || {};
        return {
            title: vi.title || "",
            author: vi.authors ? vi.authors.join(", ") : "",
            imageURL: vi.imageLinks ? (vi.imageLinks.thumbnail || vi.imageLinks.smallThumbnail || "") : "",
            publisher: vi.publisher || "",
            published: vi.publishedDate ? (formatDate(vi.publishedDate) || vi.publishedDate) : "",
            series: "",
            volume: "",
            detailsURL: vi.infoLink || ""
        };
    } catch (err) {
        console.error("lookupGoogleBooks error", err && err.message);
        return null;
    }
}

/**
 * Recupere les infos d'un livre depuis leslibraires.fr par scraping HTML.
 *
 * Etape 1 : page de recherche par ISBN -> premier lien /livre/.
 * Etape 2 : fiche produit -> extraction des microdonnees schema.org (itemprop)
 *           via des expressions regulieres (robuste, sans dependance externe).
 *
 * Source importante pour les references francophones (BD, editeurs FR).
 * Retourne un objet partiel ou null.
 *
 * @param {string} isbn
 * @returns {Promise<object|null>}
 */
async function lookupLesLibraires(isbn) {
    const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    const headers = {
        "User-Agent": UA,
        "Accept-Language": "fr-FR,fr;q=0.9",
        "Accept": "text/html,application/xhtml+xml"
    };

    // --- Etape 1 : recherche -> lien fiche ---------------------------------
    let bookUrl;
    try {
        const searchResp = await fetch(
            `https://www.leslibraires.fr/recherche/?q=${encodeURIComponent(isbn)}`,
            { headers }
        );
        if (!searchResp.ok) return null;
        const searchHtml = await searchResp.text();
        // Premier lien vers une fiche livre (URL absolue, hors liens /auth/login)
        const linkMatch = searchHtml.match(/href="(https:\/\/www\.leslibraires\.fr\/livre\/[^"]+)"/);
        if (!linkMatch) return null;
        bookUrl = linkMatch[1];
    } catch (err) {
        console.error("lookupLesLibraires search error", err && err.message);
        return null;
    }

    // --- Etape 2 : fiche produit -> microdonnees ---------------------------
    try {
        const bookResp = await fetch(bookUrl, { headers });
        if (!bookResp.ok) return null;
        const html = await bookResp.text();

        // Helper : extrait la valeur d'un itemprop.
        // Gere 3 cas : content="...", texte direct du noeud, ou texte d'un
        // enfant <a> (cas de l'editeur : itemprop="publisher"><a>Nom</a>).
        const prop = (name) => {
            // 1) content="..."
            let m = html.match(new RegExp('itemprop="' + name + '"[^>]*content="([^"]*)"'));
            if (m && m[1].trim()) return m[1].trim();
            // 2) texte direct ou dans un enfant <a>...</a>
            m = html.match(new RegExp('itemprop="' + name + '"[^>]*>\\s*(?:<a[^>]*>)?\\s*([^<]{1,150})'));
            if (m && m[1].trim()) return m[1].trim();
            return "";
        };

        const rawTitle = prop("name");
        if (!rawTitle) return null;

        // Le titre leslibraires inclut souvent " - Tome N - <sous-titre>".
        // On extrait le volume s'il est present et on nettoie le titre.
        let title = rawTitle;
        let volume = "";
        const tomeMatch = rawTitle.match(/-\s*Tome\s*(\d+)\s*-\s*(.+)$/i);
        if (tomeMatch) {
            volume = tomeMatch[1];
            title = tomeMatch[2].trim();
        }

        // Image : itemprop="image" src="..." (URL souvent protocol-relative //)
        let imageURL = "";
        const imgMatch = html.match(/itemprop="image"[^>]*\ssrc="([^"]+)"/);
        if (imgMatch) {
            imageURL = imgMatch[1];
            if (imageURL.startsWith("//")) imageURL = "https:" + imageURL;
        }

        const datePublished = prop("datePublished");

        return {
            title,
            author: prop("author"),
            imageURL,
            publisher: prop("publisher"),
            published: datePublished ? (formatDate(datePublished) || datePublished) : "",
            series: "",
            volume,
            detailsURL: bookUrl
        };
    } catch (err) {
        console.error("lookupLesLibraires book page error", err && err.message);
        return null;
    }
}

/**
 * Considere un resultat comme "complet" si les champs essentiels sont presents
 * (titre + auteur + editeur). Permet de court-circuiter les sources suivantes.
 */
function isComplete(info) {
    return !!(info && info.title && info.author && info.publisher);
}

/**
 * Fusionne src dans acc en ne remplissant que les champs encore vides de acc.
 */
function mergeInto(acc, src) {
    if (!src) return acc;
    const keys = ["title", "author", "publisher", "published", "series", "volume", "imageURL", "detailsURL"];
    for (const k of keys) {
        if ((!acc[k] || !String(acc[k]).trim()) && src[k] && String(src[k]).trim()) {
            acc[k] = src[k];
        }
    }
    return acc;
}

/**
 * Recherche bibliographique unifiee SEQUENTIELLE avec court-circuit.
 *
 * Ordre : leslibraires.fr (references FR) -> Google Books -> Open Library.
 * Des qu'une source fournit un resultat complet (titre + auteur + editeur),
 * on arrete la recherche. Sinon on complete les champs manquants avec la
 * source suivante.
 *
 * @param {string} isbn
 * @returns {Promise<object|null>}  BookInfo consolide ou null si aucune source.
 */
async function lookupBookInfo(isbn) {
    const sources = [
        { name: "leslibraires", fn: lookupLesLibraires },
        { name: "googlebooks", fn: lookupGoogleBooks },
        { name: "openlibrary", fn: lookupOpenLibrary }
    ];

    let acc = null;
    let firstSource = null;

    for (const source of sources) {
        let info = null;
        try {
            info = await source.fn(isbn);
        } catch (err) {
            console.error(`lookupBookInfo ${source.name} error`, err && err.message);
        }
        if (!info) continue;

        if (!acc) {
            acc = { title: "", author: "", publisher: "", published: "", series: "", volume: "", imageURL: "", detailsURL: "" };
            firstSource = source.name;
        }
        mergeInto(acc, info);

        // Court-circuit : si on a deja tout l'essentiel, inutile d'appeler les suivantes
        if (isComplete(acc)) break;
    }

    if (!acc || !acc.title) return null;
    acc.source = firstSource;
    return acc;
}
exports.lookupBookInfo = lookupBookInfo;
exports.lookupLesLibraires = lookupLesLibraires;

// ---------------------------------------------------------------------------
// Trigger d'ajout — utilise la recherche unifiee
// ---------------------------------------------------------------------------

exports.fetchBookInformations = functions.database.ref('/bd/{user}/{ref}/needLookup').onWrite(async (snapshot, context) => {
    const isbn = context.params.ref;
    if (!snapshot.after.exists() || snapshot.after.val() !== 1) {
        return null;
    }
    console.info("lookup for > " + isbn);
    const dataRef = snapshot.after.ref.parent;

    try {
        const info = await lookupBookInfo(isbn);
        if (info) {
            console.info('lookup result', info);
            return dataRef.update({
                title: info.title || 'untitled?',
                author: info.author || '',
                imageURL: info.imageURL || '',
                detailsURL: info.detailsURL || '',
                published: info.published || '',
                publisher: info.publisher || '',
                series: info.series || '',
                volume: info.volume || '',
                needLookup: 0
            });
        }
        console.info('lookup err > not found!');
        return dataRef.update({ title: 'not found!', needLookup: 0 });
    } catch (err) {
        console.error('lookupBookInfo unexpected error', err);
        return dataRef.update({ title: 'not found!', needLookup: 0 });
    }
});

// ---------------------------------------------------------------------------
// Endpoint HTTP — getBookInfo (utilise par le scan cote client)
// Meme logique de recherche que le trigger d'ajout : coherence garantie.
// ---------------------------------------------------------------------------

exports.getBookInfo = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
    }

    // Authentification requise (le preflight OPTIONS est deja traite ci-dessus)
    if (!(await requireAuth(req, res))) {
        return;
    }

    const rawIsbn = req.query.isbn || (req.body && req.body.isbn);
    if (!rawIsbn || !isValidIsbn(rawIsbn)) {
        res.status(400).json({ error: "ISBN invalide. Format attendu : 8, 10 ou 13 chiffres numériques." });
        return;
    }
    const isbn = String(rawIsbn).replace(/[-\s]/g, "");

    try {
        const info = await lookupBookInfo(isbn);
        if (!info) {
            res.status(404).json({ error: "Œuvre non trouvée.", isbn });
            return;
        }
        res.status(200).json({ isbn, ...info });
    } catch (err) {
        console.error("getBookInfo unexpected error", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
});

// ---------------------------------------------------------------------------
// Helper — verification du token Firebase Auth
// ---------------------------------------------------------------------------

/**
 * Verifie le jeton d'identite Firebase passe dans l'en-tete Authorization.
 * Repond directement 401 si absent/invalide et retourne false.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns {Promise<boolean>}  true si authentifie, false sinon (reponse deja envoyee).
 */
async function requireAuth(req, res) {
    const header = req.headers.authorization || "";
    const match = header.match(/^Bearer (.+)$/);
    if (!match) {
        res.status(401).json({ error: "Authentification requise." });
        return false;
    }
    try {
        await admin.auth().verifyIdToken(match[1]);
        return true;
    } catch (err) {
        console.warn("requireAuth: token invalide", err && err.message);
        res.status(401).json({ error: "Jeton d'authentification invalide." });
        return false;
    }
}

// ---------------------------------------------------------------------------
// Helpers — ISBN validation
// ---------------------------------------------------------------------------

/**
 * Validate an ISBN string.
 *
 * Strips hyphens and spaces first so that formatted ISBNs (e.g. "978-2-07-036024-5")
 * are accepted.  After cleaning, the value must be composed exclusively of digits
 * and have a length of exactly 8 (EAN-8), 10 (ISBN-10) or 13 (EAN-13/ISBN-13).
 *
 * @param {string|*} isbn  The raw value to validate.
 * @returns {boolean}
 */
function isValidIsbn(isbn) {
    const cleaned = String(isbn).replace(/[-\s]/g, "");
    return /^\d{8}$|^\d{10}$|^\d{13}$/.test(cleaned);
}
exports.isValidIsbn = isValidIsbn;

// ---------------------------------------------------------------------------
// Fonctions d'avis retirees : les sources francaises (Babelio 403, Sens
// Critique GraphQL non fonctionnel) ne sont pas fiables cote serveur.
// Les avis sont desormais des liens de recherche directs cote client
// (voir BookLookup.vue -> reviewSites).
// ---------------------------------------------------------------------------

exports.createUserNode = functions.auth.user().onCreate((userRecord) => {
    if (userRecord.uid === undefined || !userRecord) {
        console.warn ('Empty user record or uid unspecified!')
    }
    console.info(userRecord);
    
    let displayName = "";
    if (userRecord.displayName) {
        displayName = userRecord.displayName;
    } else if (userRecord.email) {
        displayName = userRecord.email.substring(0, userRecord.email.indexOf("@"));
    } else {
        displayName = userRecord.uid;
    }
    const updates = {};
    updates[`/users/${userRecord.uid}`] = {
        email: userRecord.email || "",
        displayName: displayName,
        visibleToAll: true
    };
    updates[`/usersPublic/${userRecord.uid}`] = {
        displayName: displayName
    };
    return admin.database().ref().update(updates);
});

exports.deleteUserNode = functions.auth.user().onDelete((userRecord) => {
    if (userRecord.uid === undefined || !userRecord) {
        console.warn ('Empty user record or uid unspecified!')
    }
    console.info(userRecord);
    const updates = {};
    updates[`/users/${userRecord.uid}`] = null;
    updates[`/usersPublic/${userRecord.uid}`] = null;
    updates[`/bd/${userRecord.uid}`] = null;
    return admin.database().ref().update(updates);
});
