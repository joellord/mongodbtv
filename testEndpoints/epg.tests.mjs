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

const INITIAL_DATE = new Date(1678471200000);
const FILTER_DATA_NUM_DAYS = 15;

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

const generateNewDoc = () => {
  let document = {
    title: NEW_DOC_TITLE,
    testData: true,
    since: new Date(),
    till: new Date()
  }
  return document;
}

beforeAll(async () => {
  // Cache all tokens
  await getAdminToken();
  await getUserToken();
  await getAnonymousToken();
});

afterAll(async () => {
  // Delete test data
  let token = await getAdminToken();
  let response = await axios.get(`${BASE_URL}/api/epg/testcleanup`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  expect(response.status).toBe(204);
});

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
      const response = await axios.get(`${BASE_URL}/api/epg?id=${EXISTING_ID}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      expect(response.status).toBe(200);
      expect(response.data.title).toBe("Document 7");
    });

    test("Admin can get single EPG details", async () => {
      const token = await getUserToken();
      const response = await axios.get(`${BASE_URL}/api/epg?id=${EXISTING_ID}`, {
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
        const response = await axios.post(`${BASE_URL}/api/epg`, generateNewDoc(), {
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
        const response = await axios.post(`${BASE_URL}/api/epg`, generateNewDoc(), {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(403);
      }

      token = await getAnonymousToken();
      try {
        const response = await axios.post(`${BASE_URL}/api/epg`, generateNewDoc(), {
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
        let response = await axios.post(`${BASE_URL}/api/epg`, generateNewDoc(), {
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
        expect(newDocument.title).toBe(UPDATED_DOC_TITLE)

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
        expect(err.response.status).toBe(400);
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
        expect(err.response.status).toBe(400);
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

      let response = await axios.post(`${BASE_URL}/api/epg`, generateNewDoc(), {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      expect(response.status).toBe(200);
      let newId = response?.data?.insertedId;

      try {
        response = await axios.delete(`${BASE_URL}/api/epg?id=${newId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err).toBeFalsy();
      }

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
      const adminToken = await getAdminToken();

      let response = await axios.post(`${BASE_URL}/api/epg`, generateNewDoc(), {
        headers: {
          "Authorization": `Bearer ${adminToken}`
        }
      });
      expect(response.status).toBe(200);
      let newId = response?.data?.insertedId;

      let token = await getUserToken();
      try {
        await axios.delete(`${BASE_URL}/api/epg?id=${newId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      } catch (err) {
        expect(err.response.status).toBe(403);
      }

      token = await getAnonymousToken();
      try {
        await axios.delete(`${BASE_URL}/api/epg?id=${newId}`, {
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

  describe("Filtered Results", () => {
    let totalLength;

    beforeAll(async () => {
      let token = await getAdminToken();
      // Insert documents with different dates and times
      // Using Fri Mar 10, 2023 - 13:00 GMT -5 as arbitraty base date
      // For the following 8 days, insert 3 documents for hourly long streams
      let firstDate = INITIAL_DATE;
      let documents = [];
      for (let i = 0; i < FILTER_DATA_NUM_DAYS; i++) {
        let currentDate = new Date(firstDate.getTime());
        currentDate.setDate(currentDate.getDate() + i);
        for (let j = 0; j < 3; j++) {
          let currentTime = new Date(currentDate.getTime());
          currentTime.setHours(currentTime.getHours() + j);
          let endTime = new Date(currentTime.getTime());
          endTime.setHours(endTime.getHours() + 1);
          let document = {
            title: `Document ${i}-${j}`,
            testData: true,
            since: currentTime.toISOString(),
            till: endTime.toISOString()
          }
          documents.push(document);
        }
      }

      await Promise.all(documents.map(async doc => {
        let response = await axios.post(`${BASE_URL}/api/epg`, doc, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
      }));

      let response = await axios.get(`${BASE_URL}/api/epg`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      totalLength = response.data.length;
      expect(response.status).toBe(200);
    });

    describe("Anyone can access the filtered streams", () => {
      test("Admins can access the filtered streams", async () => {
        let token = await getAdminToken();
        let response = await axios.get(`${BASE_URL}/api/epg/filter`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(response.status).toBe(200);
      });
      test("Users can access the filtered streams", async () => {
        let token = await getUserToken();
        let response = await axios.get(`${BASE_URL}/api/epg/filter`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(response.status).toBe(200);
      });
      test("Anonymous users can access the filtered streams", async () => {
        let token = await getAnonymousToken();
        let response = await axios.get(`${BASE_URL}/api/epg/filter`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(response.status).toBe(200);
      });
    });

    test("Filter without dates return all documents", async () => {
      let token = await getAnonymousToken();
      let response = await axios.get(`${BASE_URL}/api/epg/filter`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      expect(response.status).toBe(200);
      expect(response.data.length).toBe(totalLength);
    });

    test("Filter with no end date returns all documents from that date forward", async () => {
      let token = await getAnonymousToken();
      let startDate = new Date(INITIAL_DATE.getTime());
      startDate.setDate(startDate.getDate() + 3);
      try {
        let response = await axios.get(`${BASE_URL}/api/epg/filter?start_date=${startDate.getTime()}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(response.status).toBe(200);
        expect(response.data.length).toBe((FILTER_DATA_NUM_DAYS+1) * 3 - 12);
      } catch (err) {
        expect(err).toBeFalsy();
      }
    });

    test("Filter with no start date returns all documents until end date", async () => {
      let token = await getAnonymousToken();
      let endDate = new Date(INITIAL_DATE.getTime());
      endDate.setDate(endDate.getDate() + 3);
      try {
        let response = await axios.get(`${BASE_URL}/api/epg/filter?end_date=${endDate.getTime()}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        expect(response.status).toBe(200);
        expect(response.data.length).toBe(totalLength - ((FILTER_DATA_NUM_DAYS + 1) * 3 - 12));
      } catch (err) {
        expect(err).toBeFalsy();
      }
    });

    test("Filter with start and end dates return expected documents", async () => {
      let token = await getAnonymousToken();
      let startDate = new Date(INITIAL_DATE.getTime());
      let endDate = new Date(INITIAL_DATE.getTime());
      endDate.setDate(endDate.getDate() + 3);
      let response = await axios.get(`${BASE_URL}/api/epg/filter?start_date=${startDate.getTime()}&end_date=${endDate.getTime()}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      expect(response.status).toBe(200);
      expect(response.data.length).toBe(9);
    });

    test("Weekly returns a week's worth of content, starting on the Monday", async () => {
      let token = await getAnonymousToken();

      let nextWednesday = new Date(INITIAL_DATE.getTime());
      nextWednesday.setDate(nextWednesday.getDate() + (7 + 3 - nextWednesday.getDay()) % 7);

      let response = await axios.get(`${BASE_URL}/api/epg/weekly?start_date=${nextWednesday.getTime()}}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      expect(response.status).toBe(200);
      let firstDate = new Date(response.data[0].since);
      expect(firstDate.getDay()).toBe(1);
      expect(response.data.length).toBe(7 * 3);
    });

    test("Daily returns one day's worth of content", async () => {
      let token = await getAnonymousToken();
      let startDate = new Date(INITIAL_DATE.getTime());
      startDate.setDate(startDate.getDate() + 1);
      let response = await axios.get(`${BASE_URL}/api/epg/daily?start_date=${startDate.getTime()}}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      expect(response.status).toBe(200);
      expect(response.data.length).toBe(3);
    });

  });

});
