describe("Product unit tests", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
    send: jest.fn(),
  };

  it("should return a success status when created a new product", async () => {
    jest.doMock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(() => ({})),
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const newProduct = {
      body: {
        name: "Mock Product",
        code: "SKUCODEMOCK",
        price: 200,
        count: 20,
        uid: "OVsvF4i2PSw2GAzAlb5iUXNmKEwa",
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    const { addProduct } = require("../controller/product");
    await addProduct(newProduct, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, info: {} });
  });

  it("should return an error status when params are missing", async () => {
    jest.doMock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(() => ({})),
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const newProduct = {
      body: {
        code: "SKUCODEMOCK",
        count: 20,
        price: 220,
        uid: "OVsvF4i2PSw2GAzAlb5iUXNmKEwa",
      },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    const { addProduct } = require("../controller/product");
    await addProduct(newProduct, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Parámetros inválidos",
      errors: [
        {
          error: "must have required property 'name'",
          field: "",
        },
      ],
    });
  });

  it("should return a list of products for clients", async () => {
    jest.doMock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [
              {
                id: "CODE01",
                data: () => ({ name: "Product 1", price: 350 }),
              },
              {
                id: "CODE02",
                data: () => ({ name: "Product 2", price: 250 }),
              },
            ],
            empty: false,
          })),
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const { getAllProducts } = require("../controller/product");
    await getAllProducts({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      info: [
        { sku: "CODE01", name: "Product 1", price: 350 },
        { sku: "CODE02", name: "Product 2", price: 250 },
      ],
    });
  });

  it("should return an empty list of products", async () => {
    jest.doMock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [],
          })),
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const { getAllProducts } = require("../controller/product");
    await getAllProducts({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send.length).toBe(0);
  });

  it("should return a list of seller products", async () => {
    jest.doMock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [
              {
                id: "CODE02",
                data: () => ({ name: "Product 1", price: 350, uid: "user123" }),
              },
            ],
          })),
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const { getSellerProducts } = require("../controller/product");
    await getSellerProducts({ body: { uid: "user123" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      info: [{ code: "CODE02", name: "Product 1", price: 350, uid: "user123" }],
    });
  });

  it("should return a list products for administrator", async () => {
    jest.mock("firebase-admin", () => {
      const collectionProducts = jest.fn(() => ({
        get: jest.fn(() => ({
          docs: [
            {
              id: "CODE01",
              data: () => ({
                name: "Product 1",
                price: 350,
                count: 20,
                sku: "CODE01",
                uid: "user123",
              }),
            },
            {
              id: "CODE02",
              data: () => ({
                name: "Product 2",
                price: 250,
                count: 50,
                sku: "CODE02",
                uid: "user321",
              }),
            },
          ],
        })),
      }));

      const docUser123 = jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          id: "user123",
          data: () => ({
            name: "John Doe",
          }),
        }),
      }));

      const docUser321 = jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          id: "user321",
          data: () => ({
            name: "Jane Smith",
          }),
        }),
      }));

      const collectionUsers = jest.fn((collectionName) => {
        if (collectionName === "users") {
          console.log("retornando");
          return {
            doc: (userId) => {
              if (userId === "user123") {
                console.log("user123: ", docUser123());
                return docUser123();
              } else if (userId === "user321") {
                console.log("user321: ", docUser321());
                return docUser321();
              }
            },
          };
        } else if (collectionName === "products") {
          console.log("retornando products");
          return collectionProducts();
        }
      });

      return {
        firestore: jest.fn(() => ({ collection: collectionUsers })),
      };
    });

    const { getProducts } = require("../controller/product");
    await getProducts({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({
      success: true,
      info: [
        {
          code: "CODE01",
          count: 20,
          name: "Product 1",
          price: 350,
          user: "John Doe",
        },
        {
          code: "CODE02",
          name: "Product 2",
          price: 250,
          count: 50,
          user: "Jane Smith",
        },
      ],
    });
  });

  it("should return an empty array when no products are found", async () => {
    jest.mock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        get: jest.fn(() => ({
          docs: [],
          empty: true,
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const { getProducts } = require("../controller/product");
    await getProducts({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true, info: [] });
  });

  it("should return an error to get a list products for administrator", async () => {
    jest.doMock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [
              {
                id: "CODE01",
                data: () => ({
                  name: "Product 1",
                  price: 350,
                  user: "Vendedor 1",
                }),
              },
            ],
          })),
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const { getProducts } = require("../controller/product");
    await getProducts({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith({ success: true, info: [] });
  });

  it("should return an empty array when no products are found for clients", async () => {
    jest.mock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [],
            empty: true,
          })),
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const { getAllProducts } = require("../controller/product");
    await getAllProducts({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, info: [] });
  });

  it("should return an empty list of seller products", async () => {
    jest.doMock("firebase-admin", () => {
      const collection = jest.fn(() => ({
        where: jest.fn(() => ({
          get: jest.fn(() => ({
            docs: [],
            empty: true,
          })),
        })),
      }));

      return {
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const { getSellerProducts } = require("../controller/product");
    await getSellerProducts({ body: { uid: "user123" } }, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      info: [],
    });
  });
});
