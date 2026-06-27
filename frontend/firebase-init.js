// import.meta.env only exists in Vite; Node / test environments fall back to an empty object.
const env = import.meta.env ?? {};
const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
};

const isFireBaseSet = !!firebaseConfig.apiKey && !!firebaseConfig.authDomain && !!firebaseConfig.projectId;
let authPromise;

async function getFirebaseAuth() {
    if (!isFireBaseSet) return null;
    if (!authPromise) {
        authPromise = Promise.all([
            import('firebase/app'),
            import('firebase/auth'),
        ]).then(([{ initializeApp, getApps }, { getAuth }]) => {
            const app = getApps()[0] || initializeApp(firebaseConfig);
            return getAuth(app);
        });
    }
    return authPromise;
}

export { getFirebaseAuth, isFireBaseSet };
