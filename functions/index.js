const cors = require("cors");
const express = require("express");
const fadmin = require("firebase-admin");
const functions = require("firebase-functions");
const authAdmin = require("./admin/controller/auth");
const serviceAccount = require("./serviceAccountKey.json");

const admin = express();

fadmin.initializeApp({
    credential: fadmin.credential.cert(serviceAccount)
});

admin.use(cors());
admin.use(authAdmin.verifyAuth);
admin.use(require("./router/adminRoute"));

exports.admin = functions.https.onRequest(admin);
