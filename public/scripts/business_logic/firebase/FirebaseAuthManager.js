firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user.uid);
      firebase.firestore().collection('user_profiles').doc(user.uid).get().then(doc => {
        if(doc.exists){
          console.log('EYYO');
          var loginEvent = new Event('authComplete');
          document.dispatchEvent(loginEvent);
        }else{
          console.log('Doesn\'t exist :(');
          var loginEvent = new Event('profileCreate');
          document.dispatchEvent(loginEvent);
        }
      });
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

function handleAuthenticationError(error){
  let parent_form = document.getElementById('auth_form')
  switch (error.code) {
    case 'auth/email-already-in-use':
    case 'auth/invalid-email':
      primeError(parent_form, 'email', error.message);
      break;
  
    case 'auth/weak-password':
    case 'auth/password-mismatch':
      primeError(parent_form, 'password', error.message);
      primeError(parent_form, 'verify', error.message);
      break;

    case 'auth/wrong-password':
    case 'auth/user-not-found':
      //Firebase's default text for this is way too revealing
      let error_text_override = 'A combination of that email and password could not be found.';
      primeError(parent_form, 'email', error_text_override);
      primeError(parent_form, 'password', error_text_override);
      break;

    default:
      console.error(error);
      primeError(parent_form, 'email', error.message);
      primeError(parent_form, 'password', error.message);
      primeError(parent_form, 'verify', error.message);
      break;
  }
}

function submitUserAutehentication(){
  let form = document.querySelector('#auth_form');
  let email_val = form.querySelector('#email_input').value;
  let pass_val = form.querySelector('#password_input').value;
  switch (document.querySelector('#auth_selector').getAttribute('val')) {
    case 'signup':
      if(pass_val == form.querySelector('#verify_input').value){
        createWithEmail(email_val, pass_val).then(() => {
        }).catch(error => {
          handleAuthenticationError(error);
        });

      }else{
        handleAuthenticationError({'code': 'auth/password-mismatch', 'message': 'Password does not match verification.'})
      }
      break;
    
    case 'login':
      loginWithEmail(email_val, pass_val).then(()=> {
        console.log('logged in!');
      }).catch(error => {
        handleAuthenticationError(error);
      })
    break;
  }
}

function submitProfileData(){
  console.log('SUBMITTING PROF DATA');
  let displayname_data = document.getElementById('dname_input').value;
  let beginner_data = document.getElementById('prof_beginner').checked;
  console.log({display_name : displayname_data, beginner : beginner_data});
  let prof_function = firebase.functions().httpsCallable('saveUserProfile');
  prof_function({display_name : displayname_data, beginner : beginner_data}).then(res => {
    switch (res.data.code) {
      case 'good':
        dismissModal('profile');
        break;
    
      default:
        alert(res.data.text);
        break;
    }
  }).catch(res => console.error(res))

  //NEVER PRIMES
}