describe("Auth unit tests", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
    send: jest.fn(),
  };
  
  const next = jest.fn();

  it("should return a success status when a session token is valid", async () => {
    jest.mock("firebase-admin", () => {
      const verifyIdToken = jest.fn((uid, claims) => {
        return Promise.resolve({uid: 'user123'});
      });

      return {
        auth: jest.fn(() => ({ verifyIdToken }))
      };
    });

    const request = {
      headers: {
        authorization: 'Bearer TOKEN123'
      },
    };

    const { verifyAuth } = require("../controller/auth");
    await verifyAuth(request, res, next);

    expect(next).toHaveBeenCalled();
  });
});
