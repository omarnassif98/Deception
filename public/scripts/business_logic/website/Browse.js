function createGameLobby(){
    if(document.getElementById('name_input').value == ''){
        primeError(document.getElementById('game_create_form'), 'name', 'Innapropriate naming convention');
        return;
    }

    if(document.getElementById('private_game_checkbox').checked && document.getElementById('password_input').value == ''){
        primeError(document.getElementById('game_create_form'), 'password', 'Cannot be empty');
        return;
    }
    let form = document.getElementById('game_create_form');
    let lobby_info = {
        game_name : form.querySelector('#name_input').value,
        password : (form.querySelector('#private_game_checkbox').checked)?form.querySelector('#password_input').value:false,
        nation : form.querySelector('#nation_select').getAttribute('val')
    }

    
    let create_function = firebase.functions().httpsCallable('createGameListing');
    create_function(lobby_info).then(res => {
        console.log(res);
    }).catch(res => console.error(res));


}