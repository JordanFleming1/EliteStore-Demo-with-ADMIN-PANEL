const functions = require('firebase-functions');
const { resetDemoData } = require('./resetDemoData');

exports.resetDemoData = functions.https.onRequest(resetDemoData);
