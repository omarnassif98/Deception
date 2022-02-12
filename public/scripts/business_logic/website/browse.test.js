function createTestGame(){
    requestLobbyCreation('Obby', false, 'FRA').then(res => {
        console.log('Created test game');
        console.log(res.code);
    });
}