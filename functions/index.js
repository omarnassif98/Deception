const functions = require("firebase-functions");
exports.saveUserProfile = functions.https.onCall((data, context) => {
    if(!context.auth){
        throw new functions.https.HttpsError('failed-precondition', 'Not authenticated');
    }

    let {display_name, beginner} = JSON.parse(data.text);
    if(/[a-zA-Z0-9 ]+$/.test(display_name) && !/.*[ ].*/.test(display_name)){
        console.log(`name ${display_name} is ok`);
    }else{
        console.log(`name ${display_name} fails`);
    }
})