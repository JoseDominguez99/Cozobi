import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBHD2gFjSs7NQMdyvea08bJAM7a30yhifU",
  authDomain: "cozobi-46acc.firebaseapp.com",
  projectId: "cozobi-46acc",
  storageBucket: "cozobi-46acc.firebasestorage.app",
  messagingSenderId: "276043701692",
  appId: "1:276043701692:web:a312b9dc56c29a293d9fb9",
  measurementId: "G-Y247THK57R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), 
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()),
    
  ]
};
