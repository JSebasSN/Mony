import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAsDjxmtOSs0CJS3M01zs92qXXFDvbTDKc",
  authDomain: "controlingresos-45ec9.firebaseapp.com",
  projectId: "controlingresos-45ec9",
  storageBucket: "controlingresos-45ec9.firebasestorage.app",
  messagingSenderId: "53358424613",
  appId: "1:53358424613:web:a9a6f4dcac1aa332f705cc",
  measurementId: "G-LYDER4TR26"
};

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('[Firebase] Firebase initialized successfully');
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    console.log('[Firebase] Firebase app already initialized');
  } else {
    console.error('[Firebase] Firebase initialization error:', error);
  }
}

const auth = getAuth(app);

if (Platform.OS === 'web') {
  console.log('[Firebase] Running on web platform');
} else {
  console.log('[Firebase] Running on native platform');
}

export { auth };
