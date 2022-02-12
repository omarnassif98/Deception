document.addEventListener('authComplete',getUserGames)

function userCreateGameLobby(){
    if(document.getElementById('name_input').value == ''){
        primeError(document.getElementById('game_create_form'), 'name', 'Innapropriate naming convention');
        return;
    }

    if(document.getElementById('private_game_checkbox').checked && document.getElementById('password_input').value == ''){
        primeError(document.getElementById('game_create_form'), 'password', 'Cannot be empty');
        return;
    }
    let form = document.getElementById('game_create_form');
    requestLobbyCreation(form.querySelector('#name_input').value, (form.querySelector('#private_game_checkbox').checked)?form.querySelector('#password_input').value:false, form.querySelector('#nation_select').getAttribute('val')).then(result => console.log(result)).catch(rejection => console.error(rejection))

}

function requestLobbyCreation(lobby_name, password, nation){
    let create_function = firebase.functions().httpsCallable('createGameListing');
    return create_function({lobby_name, password, nation}).then((response) => {
        window.location.href = `/game/${response.data.text}`;
        return true;
    });
}

function getUserGames(){
    firebase.firestore().collection('user_data').doc(firebase.auth().currentUser.uid).collection('current_games').get().then(collection => {
        console.log(collection);
        if(collection.empty)
            return
        console.log('NOT EMPTY');
        document.getElementById('user_games').style.display = 'block';
        for(const game_doc of collection.docs){
            let game_data = game_doc.data();
            let listing_object = document.createElement('div');
            listing_object.classList.add('game_listing');
            let listing_title = document.createElement('span');
            listing_title.classList.add('listing_title');
            listing_title.innerHTML = game_data.display_name;
            listing_object.appendChild(listing_title);
            document.getElementById('user_games_carousel').appendChild(listing_object);
            let listing_join = document.createElement('a');
            listing_join.classList.add('game_join_link')
            listing_join.href = `/game/${game_doc.id}`;
            listing_join.innerHTML = 'JOIN GAME';
            listing_object.appendChild(listing_join);
            document.getElementById('user_games_carousel').appendChild(listing_object);
        }
    })
}