const admin = require("firebase-admin");
const logger = require("firebase-functions").logger;
const { getCurrentDate } = require("../../utils/commons");
const db = admin.firestore();

async function create(userInfo) {
  try {
    logger.info("creando usuario con admin");
    const userProperties = {
      email: userInfo.email,
      password: userInfo.password,
    };

    const newUser = await admin.auth().createUser(userProperties);
    logger.info("Usuario guardado: ", newUser.uid);
    const validClaims = { role: userInfo.rol };
    await admin.auth().setCustomUserClaims(newUser.uid, validClaims);
    await saveUserInfo(userInfo, newUser.uid);
    return true;
  } catch (error) {
    logger.error("Error al crear un nuevo usuario: ", error);
    return false;
  }
}

async function saveUserInfo(data, uid) {
  try {
    data["creation"] = getCurrentDate();
    data["status"] = "Activo";
    delete data.password;
    delete data.confirmPassword;
    await db.collection("users").doc(uid).set(data);
    logger.info("Información guardada en db: ", data);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

module.exports = {
  create
};
