const https = require('https');

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function formatDate(date) {
  if (!date) return '';
  if (!isNaN(Date.parse(date))) return date;
  if (date.indexOf('/') > -1) {
    const d = date.split('/');
    return `${d[2]}-${d[1]}-${d[0]}`;
  }
  return date;
}

function parseOpenLibrary(ol, isbn) {
  const key = `ISBN:${isbn}`;
  if (!ol || !ol[key]) return null;
  const book = ol[key];
  const info = {};
  if (book.title) info.title = book.title;
  if (book.authors && Array.isArray(book.authors)) info.author = book.authors.map(a => a.name).join(',');
  if (book.publishers && Array.isArray(book.publishers)) info.publisher = book.publishers.map(p => p.name).join(',');
  if (book.publish_date) info.published = formatDate(book.publish_date);
  if (book.cover) info.imageURL = book.cover.large || book.cover.medium || book.cover.small;
  if (book.url) info.detailsURL = `https://openlibrary.org${book.url}`;
  return info;
}

function parseGoogleBooks(gb) {
  if (!gb || !gb.totalItems || gb.totalItems === 0) return null;
  const item = gb.items[0];
  const vi = item.volumeInfo || {};
  const info = {};
  if (vi.title) info.title = vi.title;
  if (vi.authors) info.author = vi.authors.join(',');
  if (vi.publisher) info.publisher = vi.publisher;
  if (vi.publishedDate) info.published = formatDate(vi.publishedDate);
  if (vi.imageLinks) info.imageURL = vi.imageLinks.thumbnail || vi.imageLinks.smallThumbnail;
  if (vi.infoLink) info.detailsURL = vi.infoLink;
  return info;
}

async function run(isbn) {
  const openLibraryUrl = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;

  try {
    const ol = await getJson(openLibraryUrl);
    const info = parseOpenLibrary(ol, isbn);
    if (info) {
      console.log('OpenLibrary result:');
      console.log(info);
      return;
    }
  } catch (e) {
    console.error('OpenLibrary request/parse error:', e.message || e);
  }

  try {
    const gb = await getJson(googleBooksUrl);
    const info = parseGoogleBooks(gb);
    if (info) {
      console.log('GoogleBooks result:');
      console.log(info);
      return;
    }
  } catch (e) {
    console.error('GoogleBooks request/parse error:', e.message || e);
  }

  console.log('No result from OpenLibrary or GoogleBooks');
}

const isbn = process.argv[2] || '9782207142219';
run(isbn).catch(err => console.error(err));
