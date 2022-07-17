
import { initializeApp, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
    apiKey: process.env.VUE_APP_API_KEY,
    authDomain: process.env.VUE_APP_AUTH_DOMAIN,
    databaseURL: process.env.VUE_APP_DATABASE_URL,
    projectId: process.env.VUE_APP_PROJECT_ID,
    storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.VUE_APP_MESSAGING_SENDER_ID,
    appId: process.env.VUE_APP_ID
  }
  
  function createFirebaseApp(config) {
    try {
      return getApp();
    } catch {
      return initializeApp(config);
    }
  }
  const firebaseApp = createFirebaseApp(firebaseConfig);
  const firebaseAuth = getAuth(firebaseApp);
  const firebaseDatabase = getDatabase(firebaseApp);
  export default {
    "app" : firebaseApp,
    "auth" : firebaseAuth,
    "database" : firebaseDatabase
  };
  