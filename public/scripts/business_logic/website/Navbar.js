window.onload = function(){
  return fetch('/navbar.html').then(res => {
    console.log(res);
    res.text().then(contents => {
      let html = new DOMParser().parseFromString(contents, 'text/html');
      html.querySelectorAll('body > div').forEach(child => {
        document.body.insertBefore(child, document.body.firstChild);
      });
    });
  })
}

document.addEventListener('profileCreate', () => focusModal('profile'))

function focusModal(mode){
  try{
    document.getElementById('modal_dismiss_button').dispatchEvent(new Event('click'))
  }catch{
  }
  document.getElementById('modal').style.display = 'table';
  document.getElementById(`${mode}_mode`).style.display = 'block';
  document.getElementById('modal_header_prompt').innerHTML = document.getElementById(`${mode}_mode`).getAttribute('prompt');
  document.getElementById('modal_dismiss_button').addEventListener('click', () => dismissModal(mode), {once: true})
}

function dismissModal(mode){
  document.getElementById(`${mode}_mode`).style.display = 'none';
  document.getElementById('modal').style.display = 'none';
}

function changeAuthenticationMode(new_mode_element, old_mode_element){
  new_mode_element.classList.add('selected');
  old_mode_element.classList.remove('selected');
  document.getElementById('auth_verify_wrapper').style.display = (new_mode_element.getAttribute('val') == 'signup') ? 'block' : 'none';
  new_mode_element.parentElement.setAttribute('val', new_mode_element.getAttribute('val'));
}

function handleAuthenticationError(error){
  let prime_error = (component_name, error_message = error.message) => {
    document.getElementById(`${component_name}_input`).classList.add('input_error');
    document.getElementById(`${component_name}_error`).innerHTML = error_message;            
    document.getElementById(`${component_name}_error`).style.opacity = 1;
    document.getElementById(`${component_name}_input`).addEventListener('click', () => {
      document.getElementById(`${component_name}_input`).classList.remove('input_error');
      document.getElementById(`${component_name}_error`).style.opacity = 0;

    }, {once:true});
  }
  switch (error.code) {
    case 'auth/email-already-in-use':
    case 'auth/invalid-email':
      prime_error('email');
      break;
  
    case 'auth/weak-password':
    case 'auth/password-mismatch':
      prime_error('password');
      prime_error('verify');
      break;

    case 'auth/wrong-password':
    case 'auth/user-not-found':
      //Firebase's default text for this is way too revealing
      let error_text_override = 'A combination of that email and password could not be found.';
      prime_error('email', error_text_override);
      prime_error('password', error_text_override);
      break;

    default:
      console.error(error);
      prime_error('email');
      prime_error('password');
      prime_error('verify');
      break;
  }
}

async function submitUserAutehentication(){
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