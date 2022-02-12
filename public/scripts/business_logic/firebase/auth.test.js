
let test_accounts = [{address: 'test1@email.com', profile_name:'Test 1'}, {address: 'test2@email.com', profile_name:'Test 2'}, {address: 'test3@email.com', profile_name:'Test 3'}];

function setupTestAccounts(accounts){
    return new Promise((res) => {
        if(accounts.length == 0){
            res();
        }
        account = accounts.pop();
        createWithEmail(account.address, 'password').then(user => {
            writeProfileData(account.profile_name, true).then(result => firebase.auth().signOut().then(() => {
                console.log('now doing ' + account.profile_name);
                res(setupTestAccounts(accounts));
            }));
        });
    });
}

function testProfileCreation(){

    let testUserName = (user_name, expected_code) => {
        return new Promise(resolve => {
            return writeProfileData(user_name, true).then(result => {
                console.assert(result.data.code == expected_code, `Expected code ${expected_code}, got ${result.data.code} instead`);
                console.log(`Tested ${user_name}`);
                resolve();
            })
        });
    }
    loginWithEmail('test1@email.com', 'password').then(() => {
        testUserName('TestNAME1', 'good').then(() => testUserName('!mProper Name', 'good')).then(() => testUserName('Obnox!ioUs_name', 'forbidden-characters')).then(() => testUserName('    ', 'forbidden-characters'));
    })
}