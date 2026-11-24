# SehatSetu

## CARTO map configuration

Copy `map-config.example.js` to `map-config.js` and set your CARTO basemaps API key in the copy. The local `map-config.js` is ignored by Git and should not be committed. Restrict browser keys to your site's allowed referrers.

Run the static site from this folder with:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Emergency Help Network setup

The Help Network uses Firebase Authentication (Google sign-in) and Cloud Firestore for shared, live requests.

1. Create a Firebase project and register a web app. Paste its `apiKey`, `authDomain`, `projectId`, and `appId` into `firebase-config.js`. This browser configuration is public; do not rely on it for access control.
2. In Firebase Authentication, enable Google as a sign-in provider and add `localhost` and your deployed site's domain to the authorized domains.
3. Create a Cloud Firestore database and publish the rules from `firestore.rules` (or run `firebase deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID` with the Firebase CLI).
4. Approve a hospital account only after its staff member has signed in once. In Firestore, create `hospitalAccounts/{Google-auth-UID}` with `approved: true`, `name: "Facility name"`, and `contactPhone: "Facility phone"`. Only a trusted administrator should create these documents; client-side users cannot grant themselves hospital access.

Firebase Hosting is configured to serve the project root and exclude local CARTO config and development files. Deploy hosting with `firebase deploy --only hosting --project YOUR_FIREBASE_PROJECT_ID`.

Patients can submit and track a request after Google sign-in. Their name, phone, location, and request details are visible to approved hospitals while a request is open and to the hospital that accepts it. The page is not an emergency dispatch service; call local emergency services for immediate danger.
