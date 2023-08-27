const admin = require('firebase-admin');
const serviceAccount = require('../android/app/google-services.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
