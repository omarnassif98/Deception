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
function primeError(parent_form, component_name, error_message){
    parent_form.querySelector(`#${component_name}_input`).classList.add('input_error');
    parent_form.querySelector(`#${component_name}_error`).innerHTML = error_message;            
    parent_form.querySelector(`#${component_name}_error`).style.opacity = 1;
    parent_form.querySelector(`#${component_name}_input`).addEventListener('click', () => {
      parent_form.querySelector(`#${component_name}_input`).classList.remove('input_error');
      parent_form.querySelector(`#${component_name}_error`).style.opacity = 0;  
    }, {once:true});
}

