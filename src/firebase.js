import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Firebase 설정 정보
const firebaseConfig = {
    apiKey: "AIzaSyAmu9_vKvC1Ke5-1vRDPtL7WxYDbNnclX4",
    authDomain: "leita-dff10.firebaseapp.com",
    projectId: "leita-dff10",
    storageBucket: "leita-dff10.appspot.com",
    messagingSenderId: "459659692724",
    appId: "1:459659692724:web:9343d43a0a4d368894a5e1",
    measurementId: "G-8MJ96EZXB7"
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firebase 인증 설정
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
