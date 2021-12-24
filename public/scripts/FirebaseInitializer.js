if (!firebase.apps.length){
  console.log('INITIALIZED');
  const firebaseConfig = {
    apiKey: "AIzaSyAQolrrIy6sUCsJB7YoPzQ6o41Q45b7FEk",
    authDomain: "deception-336009.firebaseapp.com",
    databaseURL: "https://deception-336009-default-rtdb.firebaseio.com",
    projectId: "deception-336009",
    storageBucket: "deception-336009.appspot.com",
    messagingSenderId: "318225171017",
    appId: "1:318225171017:web:68ad0d6251d173d9f77598"
  };
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
auth.useEmulator('http://localhost:5555');
auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
const database = firebase.database();
database.useEmulator('http://localhost:5553');