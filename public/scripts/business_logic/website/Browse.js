function createGameLobby(){
    if(document.getElementById('game_name_input').value == ''){
        primeError(document.getElementById('game_create_form'), 'game_name', 'Innapropriate naming convention')
    }
}