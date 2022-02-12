firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      console.log(user.uid);
      firebase.firestore().collection('user_data').doc(user.uid).get().then(doc => {
        if(doc.exists){
          var loginEvent = new Event('authComplete');
          document.dispatchEvent(loginEvent);
        }else{
          var loginEvent = new Event('profileCreate');
          document.dispatchEvent(loginEvent);
        }
      });
    }else{
      signIn();
    }
  }
);

function signIn(){
  firebase.auth().signInAnonymously()
  .catch((error) => {
    console.error(error);
  });
}

function submitProfileData(){
  let parent_form = document.getElementById('prof_form');
  let displayname_data = document.getElementById('dname_input').value;
  let beginner_data = document.getElementById('prof_beginner').checked;
  writeProfileData(displayname_data, beginner_data).then(result => {
    switch (result.data.code) {
      case 'good':
        dismissModal('profile');
        break;
    
      default:
        primeError(parent_form, 'dname', result.data.text);
        break;
    }
  })
}

function writeProfileData(display_name, beginner){
  let prof_function = firebase.functions().httpsCallable('saveUserProfile');
  return prof_function({display_name, beginner});
}