firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if(user.displayName){
            var loginEvent = new Event('authComplete');
            document.dispatchEvent(loginEvent);
        }else{
          console.log('THIS IS WHERE PROFILE SETUP SHOULD BE');
        }
    }else{
      var noAuth = new Event('noAuth');
      document.dispatchEvent(noAuth);
    }
  }
);

function create_email(email, password){
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    var user = userCredential.user;
    console.log('Created account for', user);
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error(errorMessage);
  });
}

function login_email(email, password){
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    var user = userCredential.user;
    console.log('Logged in as', user);
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error(errorMessage);
  });
}