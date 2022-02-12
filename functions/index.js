const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp();

function getUserDisplayName(uid){
    return admin.firestore().collection('user_data').doc(uid).get().then(snap => {
        return snap.get('display_name');
    })
}


exports.saveUserProfile = functions.https.onCall((data, context) => {    
    if(!context.auth){
        return {text:'Not logged in', code:'not-authenticated'}
    }
    if(/^[a-zA-Z0-9 ]+$/.test(data.display_name) && !/^\s+$/.test(data.display_name)){
        console.log(`name ${data.display_name} is ok`);  
        return admin.firestore().collection('user_data').doc(context.auth.uid).set({ display_name: data.display_name, beginner: data.beginner}).then(() => {return {text:data.display_name, code:'good'}}).catch(() => {return {text:'Display name is ok but write failed', code:'firestore-write'}});
    }else{
        console.log(`name ${data.display_name} fails`);
        return {text:'display name has forbidden characters', code:'forbidden-characters'};
    }    
});

exports.createGameListing = functions.https.onCall((data, context) => {
    if(!context.auth){
        return {text:'Not logged in', code:'not-authenticated'};
    }
    if(/^[a-zA-Z0-9 _]+$/.test(data.lobby_name) && !/^\s+$/.test(data.lobby_name)){
        let sanitized_name = data.lobby_name.replaceAll(/ /g, '_').toLowerCase();
        console.log(sanitized_name);
        return getUserDisplayName(context.auth.uid).then(display_name => {
            let listing = {private : {players:{}, password : data.password}, public : {game_metadata : {begun:false, players : {}}}};
            listing.public.game_metadata.players[data.nation] = display_name;
            listing.private.players[data.nation] = context.auth.uid;
            return admin.database().ref(`pre_game_listings/${sanitized_name}`).get().then(existing_snapshot => {
                console.log(`pre_game_listings/${sanitized_name} exists? ${existing_snapshot.exists()}`);
                if(existing_snapshot.exists()){
                    return {text:'Name is in use by another lobby', code:'name-taken'};
                }else{
                    return admin.database().ref(`game_states/${sanitized_name}`).set(listing).then(() => {
                        return admin.firestore().collection('pre_game_listings').doc(sanitized_name).set({lobby_name : data.lobby_name, creation_date : admin.firestore.FieldValue.serverTimestamp(), has_password : (data.password)?true:false}).then(() => {
                            return admin.firestore().collection('user_data').doc(context.auth.uid).collection('current_games').doc(sanitized_name).set({
                                display_name : data.lobby_name,
                                playing_as : data.nation
                            })
                            .then(() => {return {text:sanitized_name, code:'good'}});
                        })
                    })
                }
            });
        });
    }else{
        return {text:'Lobby name has forbidden characters', code:'forbidden-characters'};
    }
})

exports.userJoinGame = functions.https.onCall((data, context) => {
    if(!context.auth){
        return {text:'Not logged in', code:'not-authenticated'};
    }
    let lobby_ref = admin.database().ref(`game_states/${data.lobby_name}`);
    return getUserDisplayName(context.auth.uid).then(display_name => {
        return lobby_ref.child('public/game_metadata').get().then(snapshot => {
            if(!snapshot.get('begun') && snapshot.child('players').hasChild(data.nation)){
                return lobby_ref.child(`public/game_metadata/players/${data.nation}`).set(display_name).then(() => {
                    return lobby_ref.child(`private/players/${data.nation}`).set(context.auth.uid);
                });
            }
        })
    })
})