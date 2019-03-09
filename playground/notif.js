const PushNotifications = require('node-pushnotifications');
 
const settings = {
    gcm: {
        id: 'AAAAgrBqiRk:APA91bGNjhCWlPpKqO2kqLVPcdL4UXg_2DIXPnHFROvEGD-67IiIIZEj26MS8oaIg_ZUd70H1CEVhZp_X9JcBWpSuctxlF2nH3hxO9b-qbyq_ljYXhmYzt1oyBv7ZkQlNH7a4JOn8dj3',
        phonegap: false, // phonegap compatibility mode, see below (defaults to false)
    },
    // apn: {
    //     token: {
    //         key: './certs/key.p8', // optionally: fs.readFileSync('./certs/key.p8')
    //         keyId: 'ABCD',
    //         teamId: 'EFGH',
    //     },
    //     production: false // true for APN production environment, false for APN sandbox environment,
    // },
};
 
const push = new PushNotifications(settings);

const registrationIds = 'dgUKzZDqfro:APA91bEDj4MUsM_v5gn5YwWraQfakVjOOXLrZEIJ5mw9i-DLS2zuaHXnzQ_5CZUoehJkkXsbRrDlwu8vxag_xr5fO1Qv8xHo4qzYpN6ewbQDnyUyTvo8A957n0CxyyknuBzYVo-fBluU';

const data = {
    title: 'Новая дуэль', // REQUIRED for Android
    body: 'Вы были вызваны на дуэль!',
    topic: 'дуэль', // REQUIRED for iOS (apn and gcm)
    /* The topic of the notification. When using token-based authentication, specify the bundle ID of the app. 
     * When using certificate-based authentication, the topic is usually your app's bundle ID.
     * More details can be found under https://developer.apple.com/documentation/usernotifications/setting_up_a_remote_notification_server/sending_notification_requests_to_apns
     */
    priority: 'high', // gcm, apn. Supported values are 'high' or 'normal' (gcm). Will be translated to 10 and 5 for apn. Defaults to 'high' 
    // mdm: '', // apn and gcm for ios. Use this to send Mobile Device Management commands. 
    // https://developer.apple.com/library/content/documentation/Miscellaneous/Reference/MobileDeviceManagementProtocolRef/3-MDM_Protocol/MDM_Protocol.html
    expiry: Math.floor(Date.now() / 1000) + 28 * 86400, // seconds
    timeToLive: 28 * 86400, // if both expiry and timeToLive are given, expiry will take precedency
};

push.send(registrationIds, data)
    .then((results) => { console.log(results); console.log(results[0].message); })
    .catch((err) => { console.log(err); });