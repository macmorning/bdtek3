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
    let url = lookupConfig.leslibraires_baseurl.replace("@@isbn@@",isbn);

    return rp({ url: url, followRedirect: true, simple: false }).then(function(resp) {
        let informations = {};
        let handler = new htmlparser.DomHandler((error, dom) => {
            if (error)
                console.error(error);
            else {

                let sel = select(dom,"dd");
                sel.forEach(item => {
                    if (item.attribs && item.attribs.itemprop) {
                        if (item.attribs.itemprop == "publisher") {
                            informations["publisher"] = getText(item);
                        } else if (item.attribs.itemprop == "datePublished") {
                            informations["published"] = formatDate(getText(item));
                        }
                    }
                });

                sel = select(dom, 'dl.dl-horizontal');
                let currentFieldName;
                sel[0].children.forEach((elem) => {
                        if (elem.next === undefined || !elem.next) return;
                        if (elem.next.name == "dt") {
                            if (fieldNames[getText(elem.next)]) {
                                currentFieldName = getText(elem.next);
                            } else { 
                                currentFieldName = "";
                            }
                        }
                        if (elem.next.name == "dd") {
                            if (currentFieldName) {
                                let text = getText(elem.next);
                                // cas particulier de "Collection" ou "Série" qui inclut le numéro du volume entre parenthèses
                                if (text && (currentFieldName === "Collection" || currentFieldName === "Séries")) {
                                    const regex = /(\d{1,4})/gm;
                                    let m = regex.exec(text);
                                    informations["volume"] = parseInt(m[0]);
                                    text = text.replace(/\n.*/gm,"");
                                }
                                if (text) {
                                    informations[fieldNames[currentFieldName]] = text;
                                }
                            }
                        }
                });

                sel = select(dom,".main-infos h1 span");
                if (sel[0] !== undefined) {
                    informations["title"] = getText(sel[0]);
                } 

                sel = select(dom, 'div.main-infos h2');
                if (sel[0] !== undefined && getText(sel[0])) {
                    informations["title"] = getText(sel[0]);
                }

                sel = select(dom,"a");
                let authors = "";
                sel.forEach(item => {
                    if (item.attribs && item.attribs.itemprop == "author") {
                        if (authors) {
                            authors += ",";
                        }
                        authors += getText(item);
                    } 
                });
                informations["author"] = authors;

                informations["detailsURL"] = url;
                sel = select(dom,"div.image a div img");
                if(sel[0] !== undefined && sel[0].attribs !== undefined && sel[0].attribs["src"]) {
                    informations["imageURL"] = sel[0].attribs["src"];
                }
            }
        });
        let parser = new htmlparser.Parser(handler);
        parser.parseComplete(resp);
        if(informations !== {} ) {
            console.info(informations);
            var dataRef = snapshot.after.ref.parent;
            return dataRef.update({
                title: (informations.title !== undefined ? informations.title : "untitled?"),
                author: (informations.author !== undefined ? informations.author : ""),
                imageURL: (informations.imageURL !== undefined ? informations.imageURL : ""),
                detailsURL: (informations.detailsURL !== undefined ? informations.detailsURL : ""),
                published: (informations.published !== undefined ? formatDate(informations.published) : ""),
                publisher: (informations.publisher !== undefined ? informations.publisher : ""),
                series: (informations.series !== undefined ? informations.series : ""),
                volume: (informations.volume !== undefined ? informations.volume : ""),
                needLookup: 0
            });
        } else {
            console.info("lookup err > not found!");
            return dataRef.update({
                title: "not found!",
                needLookup: 0
            });
        }

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
    }).catch(function(error) {
        console.error(new Error("request err > " + error.message));
    });
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
    return admin.database().ref(`/users/${userRecord.uid}`).set({
        email: userRecord.email,
        displayName: displayName
    });
});

exports.deleteUserNode = functions.auth.user().onDelete((userRecord) => {
    if (userRecord.uid === undefined || !userRecord) {
        console.warn ('Empty user record or uid unspecified!')
    }
    console.info(userRecord);
    return admin.database().ref(`/users/${userRecord.uid}`).remove().then(() => {admin.database().ref(`/bd/${userRecord.uid}`).remove()});
});