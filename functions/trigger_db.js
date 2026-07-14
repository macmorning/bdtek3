const admin = require('firebase-admin');

// Use emulator host if specified
// e.g. set FIREBASE_DATABASE_EMULATOR_HOST=localhost:9000

if (process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
  console.log('Using RTDB emulator at', process.env.FIREBASE_DATABASE_EMULATOR_HOST);
}

admin.initializeApp({
  databaseURL: process.env.FIREBASE_DATABASE_EMULATOR_HOST ? `http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST}?ns=demo` : undefined
});

const isbn = process.argv[2] || '9782207142219';
const user = process.argv[3] || 'testuser';

async function run() {
  const ref = admin.database().ref(`/bd/${user}/${isbn}/needLookup`);
  await ref.set(1);
  console.log(`Wrote needLookup=1 to /bd/${user}/${isbn}/needLookup`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
