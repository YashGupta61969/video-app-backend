// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");
const { getStorage } = require("firebase/storage");
const { getFirestore } = require("firebase/firestore");
// TODO: Add SDKs for Firebase products that you want to use
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

const database = getFirestore(app)

const storage = getStorage(app)

module.exports={
    database,storage
}
