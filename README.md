# Sendra Pro — Admin Panel

React + Vite web app for managing the Sendra remittance platform.

## Pages

| Page | Path | What it does |
|------|------|-------------|
| Dashboard | `/` | Live stats, volume chart, recent transactions |
| Users | `/users` | Search, view, suspend/unsuspend accounts |
| Transactions | `/transactions` | Full history, filters, detail view, CSV export |
| Analytics | `/analytics` | 30-day charts: volume, users, fees, currency mix |
| Exchange Rates | `/rates` | Manually override live rates in Firestore |
| Notifications | `/notifications` | Broadcast or direct in-app messages to users |

## Setup

### 1. Create a separate Firebase project for admin

Go to [Firebase Console](https://console.firebase.google.com) → New Project → name it `sendra-pro-admin`

Enable:
- **Firestore Database** (same rules as main app but read-only for admin)
- **Authentication** → Email/Password

### 2. Add admin user in Firebase Auth

Firebase Console → Authentication → Add user:
- Email: `admin@sendra.app`
- Password: (strong password)

### 3. Configure Firestore to point at the SAME database as your app

In `src/lib/firebase.js`, use the **same `projectId`** as your Sendra app (`sendra-pro`) but keep the admin panel's own `apiKey` and `authDomain`.

Alternatively, keep them fully separate and use Firestore's [Data Import/Export](https://firebase.google.com/docs/firestore/manage-data/export-import) to sync.

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in your Firebase config:

```bash
cp .env.example .env.local
```

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=sendra-pro.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sendra-pro
VITE_FIREBASE_STORAGE_BUCKET=sendra-pro.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=305657236990
VITE_FIREBASE_APP_ID=1:305...
```

### 5. Add admin email to `useAuth.js`

Open `src/hooks/useAuth.js` and add your email to the `ADMIN_EMAILS` array:

```js
const ADMIN_EMAILS = ['admin@sendra.app', 'your@email.com']
```

### 6. Install and run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Deploy (Firebase Hosting)

```bash
npm run build
firebase init hosting     # select dist/ as public dir, SPA rewrite
firebase deploy
```

## Firestore Security Rules (Admin project)

If using the SAME Firebase project as the app, add this rule to allow admin reads:

```javascript
// In Firestore rules, add admin service account or use admin SDK
// For simplicity, the admin panel uses client SDK with admin email auth
match /{document=**} {
  allow read: if request.auth != null && request.auth.token.email in [
    'admin@sendra.app'
  ];
}
```
