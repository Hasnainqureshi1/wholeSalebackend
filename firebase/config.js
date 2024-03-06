const admin = require('firebase-admin');
const serviceAccount = require('../service.json'); // Replace with actual path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
console.log(admin.auth())
