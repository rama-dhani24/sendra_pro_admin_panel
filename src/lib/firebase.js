import { initializeApp } from 'firebase/app'
import { getFirestore }  from 'firebase/firestore'
import { getAuth }       from 'firebase/auth'

// ── Admin Auth — uses the sendra-pro-admin project for login ──────────────
// This keeps admin authentication separate from app users
const adminAuthConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// ── App Data — uses the main sendra-pro project where all users/txs live ──
const appDataConfig = {
  apiKey:            import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_APP_FIREBASE_APP_ID,
}

// Two separate Firebase app instances
const adminApp = initializeApp(adminAuthConfig, 'admin')
const dataApp  = initializeApp(appDataConfig,   'data')

// Auth comes from the admin project (login/logout)
export const auth = getAuth(adminApp)

// Firestore comes from the main app project (real user data)
export const db   = getFirestore(dataApp)