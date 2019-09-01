const PushNotifications = require('node-pushnotifications');

const settings = {
    gcm: {
        id: 'AAAAgrBqiRk:APA91bGNjhCWlPpKqO2kqLVPcdL4UXg_2DIXPnHFROvEGD-67IiIIZEj26MS8oaIg_ZUd70H1CEVhZp_X9JcBWpSuctxlF2nH3hxO9b-qbyq_ljYXhmYzt1oyBv7ZkQlNH7a4JOn8dj3',
        phonegap: false, // phonegap compatibility mode, see below (defaults to false)
    },
    apn: {
        token: {
            key: '../certs/AuthKey_586R7SY5AG.p8', // optionally: fs.readFileSync('./certs/key.p8')
            keyId: '586R7SY5AG',
            teamId: 'YF6W7BV25R',
        },
        production: false // true for APN production environment, false for APN sandbox environment,
    },
};

const push = new PushNotifications(settings);

const registrationIds = 'cGGQiyP-I0s:APA91bEa8ObERjFT766YTHclF3snfdACKNiJ8_gyjitbyyhfQBf7Lr-iVSmy1aNm-2q85WmZOhD6Eg_B4wTRt-pXk2Gw0mVRNGZ1MMx40trynGpmPM2TPHiqS4_Z0KXxTph6f6M3PS1M';

const data = {
    title: 'Новая дуэль', // REQUIRED for Android
    body: 'Вы были вызваны на дуэль!',
    data:
    {
        title: 'Test',
        body: 'Fcm' 
    }, 
    click_action: 'OPEN_ACTIVITY_1',
    //topic: 'дуэль', // REQUIRED for iOS (apn and gcm)
    sound: 'ping.aiff',
    priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high' 
    // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands. 
    // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
    //expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // seconds
    //timeToLive: 28 * 86400, // if both expiry and timeToLive are given, expiry will take precedency
}; 

push.send(registrationIds, data)
    .then((results) => { console.log(results); console.log(results[0].message); })
    .catch((err) => { console.log(err); });