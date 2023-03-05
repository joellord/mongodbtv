const axios = require("axios");

const BASE_URL = "https://data.mongodb-api.com/app/mongodb-tv-app-bsvzg/endpoint";
const APP_ID = "mongodb-tv-app-bsvzg";
const JWT_PROVIDER = "custom-token";
const ANON_PROVIDER = "anon-user";
const LOGIN_BASE_URL = `https://realm.mongodb.com/api/client/v2.0/app/${APP_ID}`;
const JWT_LOGIN_URL = `${LOGIN_BASE_URL}/auth/providers/${JWT_PROVIDER}/login`;
const ANON_LOGIN_URL = `${LOGIN_BASE_URL}/auth/providers/${ANON_PROVIDER}/login`;

const ADMIN_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwibmFtZSI6IkFkbWluIElzdHJhdG9yIiwiZW1haWwiOiJhZG1pbkBtb25nb2RidHYuY29tIiwicm9sZSI6ImFkbWluIiwiYXVkIjoibW9uZ29kYi10di1hcHAtYnN2emciLCJpYXQiOjE2Nzc5MzcwNzgsImV4cCI6MTY4NzkzNjgxNn0.Yx9f1xp1CiJidcbPa7QiNUTHdN7o--CuEhU3IxKrVZk";
const USER_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwibmFtZSI6IlUuIFNlciIsImVtYWlsIjoidXNlckBtb25nb2RidHYuY29tIiwiYXVkIjoibW9uZ29kYi10di1hcHAtYnN2emciLCJpYXQiOjE2Nzc5MzcwNzgsImV4cCI6MTY4NzkzNjgxNn0.SCa0IzEpPdngHRImqB7YPaXNR7BdUTfAV3LbfAHDTNM";
const INVALID_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJlbWFpbCI6InVzZXJAbW9uZ29kYnR2LmNvbSIsImF1ZCI6Im1vbmdvZGItdHYtYXBwLWJzdnpnIiwiaWF0IjoxNjc3OTM3MDc4LCJleHAiOjE2ODc5MzY4MTZ9.JAaaaxUi7U2-niyjyKZjD1Sch5K7do44Q2BjFQGgPo28"

const NEW_DOC_TITLE = "This is a new stream from the testing suite";
const UPDATED_DOC_TITLE = "This is an updated document";

const EXISTING_ID = "64028a3a8b3f64ccf12c0011";
const NON_EXISTING_ID = "54028a3a8b3f64ccf12c0011";
const INVALID_ID = "123";

const getToken = async (jwt) => {
  let response = await axios.post(jwt ? JWT_LOGIN_URL : ANON_LOGIN_URL, {
    "token": jwt
  }, {
    headers: {
      "Content-Type": "application/json"
    }
  });
  const token = response?.data?.access_token;
  return token
}

let userToken;
const getUserToken = async () => {
  if (!userToken) {
    let token = await getToken(USER_JWT);
    userToken = token;
  }
  return userToken;
}
let adminToken;
const getAdminToken = async () => {
  if (!adminToken) {
    let token = await getToken(ADMIN_JWT);
    adminToken = token;
  }
  return adminToken;
}
let anonymousToken;
const getAnonymousToken = async () => {
  if (!anonymousToken) {
    let token = await getToken(false);
    anonymousToken = token;
  }
  return anonymousToken;
}

describe("EPG Routes", () => {

  describe("Authentication", () => {
    test("Unauthenticated users can't get EPGs", async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/epg`);
      } catch (error) {
        expect(error.response.status).toBe(400);
      }
    });

    test("Invalid JWT will fail", async () => {
      try {
        let token = await getToken(INVALID_JWT);
      } catch (error) {
        expect(error.response.status).toBe(401);
      }
    });
  });

  describe("Get All", () => {
    test("User can get all EPGs", async () => {
      const token = await getUserToken();
      const response = await axios.get(`${BASE_URL}/api/epg`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
    });

    test("Anonymous user can get all EPGs", async () => {
      const token = await getAnonymousToken();
      const response = await axios.get(`${BASE_URL}/api/epg`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
    });

    test("Admin can get all EPGs", async () => {
      const token = await getAdminToken();
      const response = await axios.get(`${BASE_URL}/api/epg`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
    });
  });

  describe("Get Single", () => {
    test("User can get single EPG details", async () => {
      const token = await getUserToken();
      const response = await axios.get(`${BASE_URL}/api/epg?id=${EXISTING_ID}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.title).toBe("Document 7");
    });

    test("Fetching an invalid EPG id returns an error", async () => {
      const token = await getAnonymousToken();
      try {
        const response = await axios.get(`${BASE_URL}/api/epg?id=${INVALID_ID}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(400);
      }
    });

    test("Fetching an unexisting EPG returns an error", async () => {
      const token = await getAnonymousToken();
      try {
        const response = await axios.get(`${BASE_URL}/api/epg?id=${NON_EXISTING_ID}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(404);
      }
    });

    test("Anonymous user can get single EPG details", async () => {
      const token = await getAnonymousToken();
      const response = await axios.get(`${BASE_URL}/api/epg?id=${VALID_ID}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.title).toBe("Document 7");
    });

    test("Admin can get single EPG details", async () => {
      const token = await getUserToken();
      const response = await axios.get(`${BASE_URL}/api/epg?id=${VALID_ID}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.title).toBe("Document 7");
    });
  });

  describe("Adding", () => {
    test("Admin can add a new EPG", async () => {
      const token = await getAdminToken();
      try {
        const response = await axios.post(`${BASE_URL}/api/epg`, {
          "title": NEW_DOC_TITLE,
          "testData": true
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(response.status).toBe(200);
        let newId = response?.data?.insertedId;
        expect(newId).toBeTruthy();
        const newDocumentResponse = await axios.get(`${BASE_URL}/api/epg?id=${newId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(newDocumentResponse.status).toBe(200);
        const newDocument = newDocumentResponse.data;
        expect(newDocument.title).toBe(NEW_DOC_TITLE);
      } catch (err) {
        expect(err).toBe(false);
      }
    });

    test("Other users can't add new EPGs", async () => {
      let token = await getUserToken();
      try {
        const response = await axios.post(`${BASE_URL}/api/epg`, {
          "title": NEW_DOC_TITLE,
          "testData": true
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(403);
      }

      token = await getAnonymousToken();
      try {
        const response = await axios.post(`${BASE_URL}/api/epg`, {
          "title": NEW_DOC_TITLE,
          "testData": true
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(403);
      }
    });
  });

  describe("Updates", () => {
    test("Admin can update an EPG", async () => {
      const token = await getAdminToken();

      try {
        let response = await axios.post(`${BASE_URL}/api/epg`, {
          "title": NEW_DOC_TITLE,
          "testData": true
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(response.status).toBe(200);
        let newId = response?.data?.insertedId;

        response = await axios.put(`${BASE_URL}/api/epg?id=${newId}`, {
          "title": UPDATED_DOC_TITLE
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        expect(response.status).toBe(200);

        const newDocumentResponse = await axios.get(`${BASE_URL}/api/epg?id=${newId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const newDocument = newDocumentResponse.data;
        expect(newDocumentResponse.status).toBe(200);
        expect(newDocument.title).toBe(NEW_DOC_TITLE)

      } catch (err) {
        expect(err).toBe(false);
      }
    });

    test("Other users can't update EPGs", async () => {
      let token = await getUserToken();
      try {
        const response = await axios.put(`${BASE_URL}/api/epg?id=${INVALID_ID}`, {
          "title": "TEST"
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(403);
      }

      token = await getAnonymousToken();
      try {
        const response = await axios.put(`${BASE_URL}/api/epg?id=${INVALID_ID}`, {
          "title": "TEST"
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(403);
      }
    });

    test("Updating a document that doesn't exist fails", async () => {
      let token = await getAdminToken();
      try {
        response = await axios.put(`${BASE_URL}/api/epg?id=${NON_EXISTING_ID}`, {
          "title": UPDATED_DOC_TITLE
        }, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(404);
      }
    });
  });

  describe("Deletes", () => {
    test("Admin can delete an EPG", async () => {
      const token = await getAdminToken();

      let response = await axios.post(`${BASE_URL}/api/epg`, {
        "title": NEW_DOC_TITLE,
        "testData": true
      }, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      expect(response.status).toBe(200);
      let newId = response?.data?.insertedId;

      response = await axios.delete(`${BASE_URL}/api/epg?id=${newId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);

      try {
        const newDocumentResponse = await axios.get(`${BASE_URL}/api/epg?id=${newId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(404);
      }
    });

    test("Other users can't delete EPGs", async () => {
      let token = await getUserToken();
      try {
        const response = await axios.delete(`${BASE_URL}/api/epg?id=${NON_EXISTING_ID}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(403);
      }

      token = await getAnonymousToken();
      try {
        const response = await axios.delete(`${BASE_URL}/api/epg?id=${NON_EXISTING_ID}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(403);
      }
    });

    test("Deleting a non existing id returns an error", async () => {
      let token = await getAdminToken();

      try {
        const response = await axios.delete(`${BASE_URL}/api/epg?id=${NON_EXISTING_ID}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(404);
      }
    });

    test("Deleting an invalid EPG id returns an error", async () => {
      let token = await getAdminToken();

      try {
        const response = await axios.delete(`${BASE_URL}/api/epg?id=${INVALID_ID}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(400);
      }
    });
  });

});
