importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// This config should be populated with your values.
// Service Workers don't have access to import.meta.env directly in build step unless injected.
// For simplicity, we might need to hardcode or use a workaround.
// However, since this is a public file, it's often hardcoded in the SW or injected during build.
// For now, I will use placeholders and ask user to fill it or we can use a library to inject.
// Actually, better to fetch config from a URL or just assume standard keys if user builds it.

const firebaseConfig = {
    apiKey: "AIzaSyB0sW3PVtl3MndzdzOxF8sGbJ178wiBIZU",
    authDomain: "cropia-91322.firebaseapp.com",
    projectId: "cropia-91322",
    storageBucket: "cropia-91322.firebasestorage.app",
    messagingSenderId: "210729480804",
    appId: "1:210729480804:web:7ef2816ac82dd069416571",
    measurementId: "G-GGTLB9VGS3"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-192x192.png' // Ensure this icon exists
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
