const room_code = window.location.pathname.split('/').pop();
let game_metadata = {playing_as:null, queued_moves:{}};
var exposed_map_promise_resolver;
let map_promise = new Promise(res => {
    exposed_map_promise_resolver = res;
})

var exposed_game_load_promise_resolver;
var exposed_game_load_promise_rejector;
let firebase_promise = new Promise((res, rej) => {
    exposed_game_load_promise_resolver = res;
    exposed_game_load_promise_rejector = rej;
})
document.addEventListener('map_setup_complete', () => {
    exposed_map_promise_resolver();
    console.log('MAP SETUP PROMISE RESOLVED');
});

document.addEventListener('firebase_init', () => {
    firebase.database().ref(`/game_states/${room_code}/public`).get().then(data_snapshot => {
        if(data_snapshot.exists()){
            exposed_game_load_promise_resolver(data_snapshot.val());
        }else{
            exposed_game_load_promise_rejector();
        }
    })
})

async function initializeGame(){
    await map_promise;
    let init_data = await firebase_promise;
    console.log(init_data);
    if(init_data.begun){
        releaseCurtain('side_panel_curtain');
    }else{
        setCurtainMessage('side_panel_curtain', 'Game has not begun yet.\nWaiting for players')
    }
    //By rejecting, the firebase promise actually throws an error
    //thus interupting this function 
    firebase.firestore().collection('user_data').doc(firebase.auth().currentUser.uid).collection('current_games').doc(room_code).get().then((doc) => {
        if(doc.exists && init_data.begun){
            game_metadata.playing_as = doc.data().playing_as;
            changeMultipleProvinceStates(map_metadata.nation_info[game_metadata.playing_as].troops_deployed, 'enabled');
        }else{
            console.log('not in this game');
            setCurtainMessage('side_panel_curtain', 'You are not a player\nin this game')
        }
    })
}

initializeGame();