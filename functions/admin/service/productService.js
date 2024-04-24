const admin = require("firebase-admin");
const logger = require("firebase-functions").logger;
const { getCurrentDate } = require("../../utils/commons");
const db = admin.firestore();

async function create(productInfo) {
  try {
    logger.info("creando producto con admin");
    const product = {
      code: productInfo.code,
      product: {
        name: productInfo.name,
        price: productInfo.price ? productInfo.price : 0,
        count: productInfo.count ? productInfo.count : 0,
        creation: getCurrentDate(),
        status: "Activo",
        uid: productInfo.uid
      },
    };
    await saveProductInfo(product);
    return true;
  } catch (error) {
    logger.error("Error al crear un nuevo producto: ", error);
    return false;
  }
}

async function saveProductInfo(data) {
  try {
    await db.collection("products").doc(data.code).set(data.product);
    return true;
  } catch (error) {
    logger.error(error);
    return false;
  }
}

async function getProducts() {
  try {
    const productRef = await db.collection("products").get();
    const products = [];
    console.log('product ref: ', productRef);
    if (productRef != null && productRef.docs.length > 0) {
      for (const doc of productRef.docs) {
        const productData = {
          code: doc.id,
          name: doc.data().name,
          price: doc.data().price,
          count: doc.data().count,
        };
        console.log('obteniendo nombre del usuario: ', doc.data().uid);
        const userDoc = await db.collection("users").doc(doc.data().uid).get();
        productData['user'] = userDoc.data().name;

        products.push(productData);
      }
    }

    return products;
  } catch (error) {
    logger.error("Error al obtener productos:", error);
    return [];
  }
}

async function getAllProducts() {
  try {
    const prodRef = db.collection("products")
        .where("status", "in", ["Activo"]);

    const productsSnapshot = await prodRef.get();

    if (productsSnapshot.empty) {
      logger.error("No se encontraron registros de productos.");
      return {docs: []};
    }
    return productsSnapshot;
  } catch (error) {
    logger.error("Error al obtener productos:", error);
    throw new Error("Error: ", error);
  }
}

async function getSellerProducts(uid) {
  try {
    const productsRef = db.collection("products")
      .where("uid", "in", [uid]);

    const productsSnapshot = await productsRef.get();

    if (productsSnapshot.empty) {
      logger.error("No se encontraron registros de productos.");
      return null;
    }

    return productsSnapshot;
  } catch (error) {
    logger.error("Error al obtener productos:", error);
    return null;
  }
}

module.exports = {
  create,
  getProducts,
  getAllProducts,
  getSellerProducts,
};
