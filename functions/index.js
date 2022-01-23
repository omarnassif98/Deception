const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { error } = require("firebase-functions/logger");
const { ref } = require("firebase-functions/v1/database");
admin.initializeApp();
exports.saveUserProfile = functions.https.onCall((data, context) => {    
    if(!context.auth){
        return {text:'Not logged in', code:'not-authenticated'}
    }

    if(/^[a-zA-Z0-9 ]+$/.test(data.display_name) && !/^\s+$/.test(data.display_name)){
        console.log(`name ${data.display_name} is ok`);
        return admin.firestore().collection('users').doc(context.auth.uid).set({ display_name: data.display_name, beginner: data.beginner}).then(() => {return {text:data.display_name, code:'good'}}).catch(() => {return {text:'Display name is ok but write failed', code:'firestore-write'}});
    }else{
        console.log(`name ${data.display_name} fails`);
        return {text:'display name has forbidden characters', code:'forbidden-characters'};
    }
});

exports.createGameListing = functions.https.onCall((data, context) => {
    if(!context.auth){
        return {text:'Not logged in', code:'not-authenticated'}
    }

    if(/^[a-zA-Z0-9 ]+$/.test(data.game_name) && !/^\s+$/.test(data.game_name)){
        let listing = {name : data.game_name, password : data.password, host : context.auth.uid, players : {FRA : null, ENG : null, TUR : null, RUS : null, AUS : null, GER : null}};
        listing.players[data.nation] = context.auth.uid;
        return admin.database().ref('pre_game_listings').push(listing).then(ref => {
            return admin.database().ref(`user_games/${context.auth.uid}/${ref.key}`).set(data.game_name).then(() => {return {text:ref.key, code:'good'}}).catch(() => {return {text:ref.key, code:'user-game-error'}});
        }).catch(() => {return {text:data.game_name, code:'game-listing-error'}});
    }else{
        return {text:'Lobby name has forbidden characters', code:'forbidden-characters'};
    }
})