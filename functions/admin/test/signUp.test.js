describe("Sign up unit tests", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
    send: jest.fn(),
  };

  it("should return a success status when created a new user", async () => {
    jest.mock("firebase-admin", () => {
      const createUser = jest.fn(async (userProperties) => {
        return { uid: "newuseruid", ...userProperties };
      });
      
      const setCustomUserClaims = jest.fn((uid, claims) => {
        return Promise.resolve();
      });

      const collection = jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(() => ({})),
        })),
      }));

      return {
        auth: jest.fn(() => ({ createUser, setCustomUserClaims })),
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const newUser = {
      body: {
        "name": "Admin name",
        "email": "admin@gmail.com",
        "password": "Test$2024",
        "confirmPassword": "Test$2024",
        "rol": "Administrador"
    },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    const { signUp } = require("../controller/signUp");
    await signUp(newUser, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, info: {} });
  });

  it("should return an error status when exists a user", async () => {
    jest.mock("firebase-admin", () => {
      const createUser = jest.fn(async (userProperties) => {
        return { ...userProperties };
      });
      
      const collection = jest.fn(() => ({
        doc: jest.fn(() => ({
          set: jest.fn(() => ({})),
        })),
      }));

      return {
        auth: jest.fn(() => ({ createUser })),
        firestore: jest.fn(() => ({ collection })),
      };
    });

    const newUser = {
      body: {
        "name": "Admin name",
        "email": "admin@gmail.com",
        "password": "Test$2024",
        "confirmPassword": "Test$2024",
        "rol": "Administrador"
    },
    };

    const res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };

    const { signUp } = require("../controller/signUp");
    await signUp(newUser, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: {msg: "El usuario ya existe."} });
  });
});
