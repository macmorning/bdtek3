const functions = require("firebase-functions");
const admin = require("firebase-admin");
const rp = require("request-promise");
const htmlparser = require("htmlparser2");
const select = require("soupselect").select;

admin.initializeApp();

const lookupConfig = {
  leslibraires_baseurl: "https://www.leslibraires.fr/recherche/?q=@@isbn@@"
};
const fieldNames = {
    "Collection": "series",
    "Séries" : "series",
    "EAN13": "uid",
    "Éditeur": "publisher",
    "Date de publication": "published"
};
const getText = (node) => {
    if(node.type === "text") {
        return node.text.trim();
    }
    if (node.children.length > 0) {
        let text = "";
        node.children.forEach((item) => {
            if (item.type === "text") {
                text += item.data;
            } else if (item.type === "tag" && item.name === "a") {
                text += item.children[0].data;
            }
        });
        return (text ? text.trim() : false);
    }
};

const formatDate = (date) => {
    if (Date.parse(date) > 0) { return date; }
    else if (date.indexOf("/") > -1) {
        let d = date.split("/");
        let newDate = d[2] + "-" + d[1] + "-" + d[0];
        console.info("formatDate > converting " + date + " to " + newDate);
        return (newDate);
    }
};

exports.fetchBookInformations = functions.database.ref('/bd/{user}/{ref}/needLookup').onWrite((snapshot, context) => { 
    // Grab the current value of what was written to the Realtime Database.
    let isbn = context.params.ref;
    if (!snapshot.after.exists() || snapshot.after.val() !== 1) {
        return null;
    }
    console.info("lookup for > " + isbn);
    // Prefer API-based lookup: Open Library, then Google Books as fallback
    const openLibraryUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

    const dataRef = snapshot.after.ref.parent;

    const parseOpenLibrary = (ol) => {
        const key = `ISBN:${isbn}`;
        if (!ol || !ol[key]) return null;
        const book = ol[key];
        const info = {};
        if (book.title) info.title = book.title;
        if (book.authors && Array.isArray(book.authors)) info.author = book.authors.map(a => a.name).join(",");
        if (book.publishers && Array.isArray(book.publishers)) info.publisher = book.publishers.map(p => p.name).join(",");
        if (book.publish_date) info.published = formatDate(book.publish_date);
        if (book.cover) info.imageURL = book.cover.large || book.cover.medium || book.cover.small;
        if (book.url) {
            const url = book.url.toString();
            if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
                info.detailsURL = url;
            } else {
                info.detailsURL = `https://openlibrary.org${url}`;
            }
        }
        return info;
    };

    const parseGoogleBooks = (gb) => {
        if (!gb || !gb.totalItems || gb.totalItems === 0) return null;
        const item = gb.items[0];
        const vi = item.volumeInfo || {};
        const info = {};
        if (vi.title) info.title = vi.title;
        if (vi.authors) info.author = vi.authors.join(",");
        if (vi.publisher) info.publisher = vi.publisher;
        if (vi.publishedDate) info.published = formatDate(vi.publishedDate);
        if (vi.imageLinks) info.imageURL = vi.imageLinks.thumbnail || vi.imageLinks.smallThumbnail;
        if (vi.infoLink) info.detailsURL = vi.infoLink;
        return info;
    };

    // Try Open Library first
    return rp({ url: openLibraryUrl, json: true, simple: false, resolveWithFullResponse: false }).then(function(olResp) {
        try {
            const info = parseOpenLibrary(olResp);
            if (info) {
                console.info('OpenLibrary result', info);
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
        } catch (err) {
            console.error('OpenLibrary parse error', err);
        }
        // Fallback to Google Books
        return rp({ url: googleBooksUrl, json: true, simple: false, resolveWithFullResponse: false }).then(function(gbResp) {
            try {
                const info = parseGoogleBooks(gbResp);
                if (info) {
                    console.info('GoogleBooks result', info);
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
                } else {
                    console.info('lookup err > not found!');
                    return dataRef.update({ title: 'not found!', needLookup: 0 });
                }
            } catch (err) {
                console.error('GoogleBooks parse error', err);
                return dataRef.update({ title: 'not found!', needLookup: 0 });
            }
        }).catch(function(error) {
            console.error(new Error('googlebooks request err > ' + (error && error.message)));
            return dataRef.update({ title: 'not found!', needLookup: 0 });
        });
    }).catch(function(error) {
        console.error(new Error('openlibrary request err > ' + (error && error.message)));
        // try google as last resort
        return rp({ url: googleBooksUrl, json: true, simple: false, resolveWithFullResponse: false }).then(function(gbResp) {
            try {
                const info = parseGoogleBooks(gbResp);
                if (info) {
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
                } else {
                    return dataRef.update({ title: 'not found!', needLookup: 0 });
                }
            } catch (err) {
                console.error('GoogleBooks parse error after OL fail', err);
                return dataRef.update({ title: 'not found!', needLookup: 0 });
            }
        }).catch(function(error) {
            console.error(new Error('googlebooks request err after OL fail > ' + (error && error.message)));
            return dataRef.update({ title: 'not found!', needLookup: 0 });
        });
    });

            /*parseString(resp, function(err, result){
                if (err) { 
                    console.error(new Error("parseString error > " + err));
                }
                var dataRef = snapshot.after.ref.parent;
                if (result.response.ltml !== undefined && result.response.ltml[0] !== undefined && result.response.ltml[0].item[0] !== undefined) {
                    let book = result.response.ltml[0].item[0];
                    return dataRef.update({
                        title: (book.title.length > 0 ? book.title[0]:"?"),
                        author: (book.author.length > 0 ? book.author[0]["_"]:""),
                        imageURL: "",
                        detailsURL: (book.url.length > 0 ? book.url[0]:""),
                        published: "",
                        publisher: "",
                        needLookup: 0
                    });
                } else {
                    console.info("lookup err > not found!");
                    return dataRef.update({
                        title: "not found!",
                        needLookup: 0
                    });
                }
            });*/
});

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