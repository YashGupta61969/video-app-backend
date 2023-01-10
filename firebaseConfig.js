// Import the functions you need from the SDKs you need
const {initializeApp} = require('firebase/app')
const {getFirestore} = require('firebase/firestore') 
const {getStorage} = require('firebase/storage')
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCoy6zrMw3fi1bqO0d6Hep3OTzAS7QDZ4",
  authDomain: "video-app-17ecd.firebaseapp.com",
  projectId: "video-app-17ecd",
  storageBucket: "video-app-17ecd.appspot.com",
  messagingSenderId: "571937486550",
  appId: "1:571937486550:web:f7cf8ac7abc68fad987b77"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)
const storage = getStorage(app)

module.exports = {
db, storage
}
