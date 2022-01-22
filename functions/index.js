const functions = require("firebase-functions");
const admin = require('firebase-admin');
const { error } = require("firebase-functions/logger");
admin.initializeApp();
exports.saveUserProfile = functions.https.onCall((data, context) => {    
    if(!context.auth){
        rej('Not authenticated')
    }
    console.log(`request from user: ${context.auth.uid}`);
    console.log(`data RAW: {${data.display_name}, ${data.beginner}}`);
    if(/^[a-zA-Z0-9 ]+$/.test(data.display_name) && !/^\s+$/.test(data.display_name)){
        console.log(`name ${data.display_name} is ok`);
        return admin.firestore().collection('user_profiles').doc(context.auth.uid).set({ display_name: data.display_name, beginner: data.beginner}).then(() => {return {text:data.display_name, code:'good'}}).catch(() => {return {text:'Display name is ok but write failed', code:'firestore-write'}});
    }else{
        console.log(`name ${data.display_name} fails`);
        return {text:'display name has forbidden characters', code:'forbidden-characters'};
    }
});