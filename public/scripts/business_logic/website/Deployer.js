window.onload = function(){
  return fetch(`navbar.html`).then(res => {
    console.log(res);
    res.text().then(contents => {
      let dom_to_deploy = new DOMParser().parseFromString(contents, 'text/html');
      dom_to_deploy.head.getAttribute('scripts_to_deploy').split(' ').forEach(script_src => {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = script_src;
        script.async = false;
        document.head.insertBefore(script, document.head.firstChild);
      });

      dom_to_deploy.querySelectorAll('head > *').forEach(child => document.head.insertBefore(child, document.head.firstChild));
      dom_to_deploy.querySelectorAll('body > *').forEach(child => document.body.insertBefore(child, document.body.firstChild));
      if (document.body.getAttribute('wait_for_nav')) {
        document.body.getAttribute('wait_for_nav').split(' ').forEach(element_id => {
          console.log('Servicing ' + element_id);
          document.getElementById(element_id).style.display = 'block';
        });

      }
      if(document.getElementById('extra_modals')){
        Array.from(document.getElementById('extra_modals').children).forEach(sub_modal => document.getElementById('modal_container').appendChild(sub_modal));
        document.getElementById('extra_modals').remove();
      }
    });
  })
}

document.addEventListener('profileCreate', () => focusModal('profile'))



function dismissModal(mode){
  document.getElementById(`${mode}_mode`).style.display = 'none';
  document.getElementById('modal').style.display = 'none';
}

function changeSideSelectorValue(new_mode_element){
  new_mode_element.classList.add('selected');
  let old_mode_element = new_mode_element.parentElement.querySelector(`#${new_mode_element.parentElement.getAttribute('val')}`)
  old_mode_element.classList.remove('selected');
  new_mode_element.parentElement.setAttribute('val', new_mode_element.id);
}

