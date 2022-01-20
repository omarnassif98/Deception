firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        if(user.displayName){
          var loginEvent = new Event('authComplete');
          document.dispatchEvent(loginEvent);
        }else{
          var loginEvent = new Event('profileCreate');
          document.dispatchEvent(loginEvent);
        }
    }else{
      var noAuth = new Event('noAuth');
      document.dispatchEvent(noAuth);
    }
  }
);

function createWithEmail(email, password){
  return new Promise((res,rej) => {
    console.log('GETTING IN');
    firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((userCredential) => res(userCredential))
    .catch((error) => rej(error));
  });
}

function loginWithEmail(email, password){
  return new Promise((res, rej) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => res(userCredential))
    .catch((error) => rej(error));
  }); 
}