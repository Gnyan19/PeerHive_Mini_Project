// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const localFirebaseConfig = {
  apiKey: "AIzaSyBjraqavw4R88V-6qhA2_sAKF7N0k9bIyw",
  authDomain: "unihive-4988.firebaseapp.com",
  projectId: "unihive-4988",
  storageBucket: "unihive-4988.firebasestorage.app",
  messagingSenderId: "507091247808",
  appId: "1:507091247808:web:c06346d8da6f098c630325",
  measurementId: "G-Y94FQ4RWPG"
};
export default localFirebaseConfig
// Initialize Firebase
const app = initializeApp(localFirebaseConfig);
const analytics = getAnalytics(app);