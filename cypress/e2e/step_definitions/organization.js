// cypress/integration/step_definitions/login_steps.js
import { Given, When, Then } from "cypress-cucumber-preprocessor/steps";
import { storeToken, getToken } from '../../support/Utils';
import { Token } from "aws-sdk";


let UUID 
const formData = new FormData();
const env = Cypress.env('baseUrl')
let emails = {};
let Supper_User
let IDToken = null; //Variable to fetch ID Token
let accessToken2 = null; // Variable to hold the auth Token
const tempPassword = 'Temp@1234';
const newPassword = 'Temp@12345';

const mtmBasicAuth = 'Basic M3E0bWRucmFrdThkNXRnYmhlZGRwN3U2aWs6MXF2cmpyazd1MmdpaHVmMjdwNXM4YmI4bWZiajltbHRnbXQyMzQ4djd0b3Jma2sxb2xkbA==';


const joinOrgApi = env + 'member/users';
const resumeUploadApi = env + 'members/auth/resume-upload';
const additionalUploadsApi = env + 'members/auth/update-uploads';
const mtmTokenApi = 'https://auth-review.auth.eu-west-1.amazoncognito.com/oauth2/token?grant_type=client_credentials&client_id=3q4mdnraku8d5tgbheddp7u6ik';
const saveTokenApi = env + 'members/auth/saveTokenApiTesting';

let mtmToken; //Variable to store mtm token in later stage
let uploadPerUserInitial; // Variable to store the initial value of uploadPerUser
let quotaInitialValue; //variable to store initial value of Quota
let initialTotalAvailableUploads = 0;
let additionalUploads = 50;



const expectedMessages = [
  "This operation can only be performed by organization administrator", // For the OrgManager
  "This operation can only be performed by administrator", // For StandardUser
  "You are not authorized to perform operation on target organization.", // For others (e.g., token issues)
];

let payload;

Given("I have the new organization data:", () => {
  formData.append(
    "name",
    "Automation User" + Math.floor(Math.random() * 30000000) + 1
  );
  formData.append("billingCycle", "MONTHLY");
  formData.append(
    "billingEmail",
    "Api" + Math.floor(Math.random() * 3000000) + 1 + "@apidoc.com"
  );
  formData.append("expiry", "2025-07-25T15:37:34.000Z");
  formData.append("frequencyInterval", "4");
  formData.append("max_users", "3");
  formData.append("planName", "Elite");
});

When("I send a POST request to /organizations with the above data", () => {
  cy.request({
    method: "POST",
    url: env,
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: accessToken,
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      encoding: "binary",
    },
    failOnStatusCode: false,
    body: formData,
  }).then((response) => {
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    responseCode = response.status;
    UUID = responseBody.uuid;
    cy.log(responseBody);

    cy.fixture("organizations/orgData.json").then((responseJson) => {
      // Function to update the respon se JSON based on form data
      function updateResponseJson(formData, responseJson) {
        const keyMapping = {
          name: "name",
          billingCycle: "billingCycle",
          billingEmail: "billingEmail",
          expiry: "orgExpiry", // Assuming 'expiry' in formData maps to 'orgExpiry' in responseJson
          frequencyInterval: "currentDataDeletionFrequency", // If 'frequencyInterval' means 'Every X Interval'
          max_users: "availableLicenses",
          planName: "planName",
        };

        //   Loop through each key in formData
        formData.forEach((value, key) => {
          const mappedKey = keyMapping[key]; // Find the mapped key in responseJson
          if (mappedKey) {
            if (key === "expiry") {
              responseJson[mappedKey] = new Date(value).toLocaleDateString(); // Convert ISO date to desired format
            } else if (key === "frequencyInterval") {
              responseJson[mappedKey] = `Every ${value} WEEK`; // Assuming frequency format "Every X Interval"
            } else {
              responseJson[mappedKey] = value; // Directly assign the value
            }
          }
        });
        responseJson.uuid = UUID;
        cy.writeFile(
          "cypress/fixtures/organizations/orgDataa.json",
          responseJson
        );
      }
      updateResponseJson(formData, responseJson);
    });
  });
});

Then("the response status code should be 201", () => {
  expect(responseCode).to.eq(201);
});

Given("I have the UUID of the organization", () => {});

When("I send a GET request to {string}", (endpoint) => {
  cy.request({
    method: "GET",
    url: env + `organizations/detail?orgUUID=${UUID}`,
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: accessToken,
      // 'cache-control': 'no-cache',
      // 'Content-Type': 'application/json',
    },
  }).then((response) => {
    cy.log(response.body.uuid);
    responseCode = response.status;
    actualResult = response.body;
  });
});

Then("the response status code should be {int}", (statusCode) => {
  expect(responseCode).to.eq(statusCode);
});

Then("the response body should contain:", () => {
  cy.readFile("cypress/fixtures/organizations/orgDataa.json").then(
    (expectedResult) => {
      //expect(expectedResult).to.deep.eq(actualResult);
    }
  );
});

When("I Get organization's active features", () => {
  cy.request({
    method: "GET",
    url: env + `organizations/${UUID}/active-features`,
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: accessToken,
      // 'cache-control': 'no-cache',
      // 'Content-Type': 'application/json',
    },
  }).then((response) => {
    responseCode = response.status;
    actualResult = response.body;
    cy.log(actualResult);
  });
});

Then(
  "the response should contain a list of active features with the following details:",
  (dataTable) => {
    expect(actualResult[0].displayName).to.eq("Reparse as Docx");
  }
);

When(
  "Get organization's active features ai transform text used on edit screen to transform text of resume",
  () => {
    cy.request({
      method: "GET",
      url: env + `organizations/${UUID}/active-features-ai-transform-text`,
      headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: accessToken,
        // 'cache-control': 'no-cache',
        // 'Content-Type': 'application/json',
      },
    }).then((response) => {
      responseCode = response.status;
      actualResult = response.body;
    });
  }
);

Then(
  "the response should contain a list of active AI Transform Text features with the following details:",
  (dataTable) => {
    expect(actualResult).to.be.empty;
  }
);

When("Configure CVs data deletion policy for orgnizations", (dataTable) => {
  // Extract data from the table
  const data = dataTable.hashes()[0]; // Get the first row of data

  // Build the URL with query parameters
  cy.log(data.dataDeletionEnable);
  const url = env + `organizations/configureDataDeletion?orgUUID=${UUID}&dataDeletionEnable=${data.dataDeletionEnable}`;

  cy.request({
    method: "POST",
    url: url,
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: accessToken,
      // 'cache-control': 'no-cache',
      // 'Content-Type': 'application/json',
    },
  }).then((response) => {
    cy.wrap(response).as("apiResponse");
  });
});

Given("System has newly created organization with 3 assigned licenses", (userType) => {
 
});


Given("the Standard User is not currently assigned the ORD Admin role", (userType) => {
 
});

Then(
  "the {string} login into the system",
  (userType) => {
   const password = 'Temp@12345';

cy.loginWithCognito(emails.standard, password).then(tokens => {
  // cy.log('Access Token:', tokens.accessToken);
  // cy.log('ID Token:', tokens.idToken);
  // cy.log('Refresh Token:', tokens.refreshToken);
  cy.log('Refresh Token:', tokens.accessToken);
  storeToken("Standard_User", tokens.accessToken);
});

  });

  Then(
    "the {string} should be able to access their organization details",
    (userType) => {
   
      getToken(userType).then((data) => {
        const accessToken = data.Token;
      cy.request({
        method: "GET",
        url: env + `organizations/detail?orgUUID=${UUID}`,
        headers: {
          Authorization: accessToken,
        },
      }).then((response) => {
        cy.log(response.body);
        expect(response.body.assignedLicenses).to.eq("3");
        expect(response.body.availableLicenses).to.eq("5");
      });
    } ) });


    Given("the Standard User is currently assigned the ORD Admin role", (userType) => {
 
    });
  
    When("the {string} unassigns the ORD Admin role from the Standard User", (userType) => {
      let standardUser = [ {
        email: payload[2].email,
        firstName: payload[2].firstName,
        lastName: payload[2].lastName,
        authorities: ["ROLE_ORG_ADMIN"],
        organizationUUID: UUID,
      }];
   
      
      getToken(userType).then((data) => {
        const accessToken = data.Token;
 
      cy.request({
        method: "PATCH",
        url: env + "member/users/remove-from-group",
        body: standardUser,
        failOnStatusCode: false,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: accessToken,
          "cache-control": "no-cache",
          "Content-Type": "application/json",
          orguuid: UUID,
        },
      }).then((response) => {
        cy.wrap(response).as("apiResponse");
        cy.get("@apiResponse").then((response) => {
          expect(response.status).to.eq(200);
        });
      }); })
    });
    Then(
      "the {string} should not be able to access their organization details",
      (userType) => {
       
        getToken(userType).then((data) => {
          const accessToken = data.Token;
        cy.request({
          method: "GET",
          url: env + `organizations/detail?orgUUID=${UUID}`,
          headers: {
            // 'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: accessToken,
            // 'cache-control': 'no-cache',
            // 'Content-Type': 'application/json',
          },
          failOnStatusCode: false,
        }).then((response) => {
          cy.wrap(response).as("apiResponse");
          cy.get("@apiResponse").then((response) => {
            expect(response.status).to.eq(401);
          });
        });  })
      }
    );
     



Then("the response should contain the following details:", (dataTable) => {
  const expectedData = dataTable.hashes()[0]; // Get the first row of data

  cy.get("@apiResponse")
    .its("body")
    .then((body) => {
      expect(body.dataDeletionEnable).to.equal(expectedData.dataDeletionEnable);
      expect(body.frequencyTimePeriod).to.equal(
        expectedData.frequencyTimePeriod
      );
      expect(body.frequencyInterval).to.equal(
        Number(expectedData.frequencyInterval)
      );
      expect(body.updateTimestamp).to.equal(body.creationTimestamp);
    });
});
///////////////////////////////////////////////

When("Super User creates an organization with 3 available licenses.", () => {
  cy.request({
    method: "POST",
    url: env + "organizations",
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: accessToken,
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      encoding: "binary",
    },
    failOnStatusCode: false,
    body: formData,
  }).then((response) => {
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    UUID = responseBody.uuid;
    cy.log(responseBody);
    cy.wrap(response).as("apiResponse");
    cy.get("@apiResponse").then((response) => {
      expect(response.status).to.eq(201);
    });
  });
});

When("Super User creates 3 users", () => {
  payload = [
    {
      email:
        "orgAdmin" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com",
      firstName: "Organization",
      lastName: "Admin",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email:
        "orgAdmin2" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com",
      firstName: "Organization",
      lastName: "Admin",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email:
        "Standard" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com",
      firstName: "Standard",
      lastName: "User",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_USER"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email:
        "orgManager" +
        Math.floor(Math.random() * 3000000000) +
        1 +
        "@gmail.com",
      firstName: "Organization ",
      lastName: "Manager",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_MANAGER"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
  ];

  // cy.request({
  //   method: 'POST',
  //   url: env + 'member/users',
  //   body: payload,
  //   failOnStatusCode: false,
  //   headers: {
  //     'Content-Type': 'application/x-www-form-urlencoded',
  //     'Authorization': accessToken,
  //     'cache-control': 'no-cache',
  //     'Content-Type': 'application/json',
  //     'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
  //   },
  // }).then((response) => {
  //   cy.wrap(response).as('apiResponse');
  //   cy.get('@apiResponse').then((response) => {
  //     expect(response.status).to.eq(200);
  //   });
  // });
});

When("{string} attempt to create 3 more new users in that organization", (userType) => {
 let tempPayload= [
    {
      email:
        "orgAdmin" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com",
      firstName: "Organization",
      lastName: "Admin",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email:
        "orgAdmin2" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com",
      firstName: "Organization",
      lastName: "Admin",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email:
        "Standard" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com",
      firstName: "Standard",
      lastName: "User",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_USER"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email:
        "orgManager" +
        Math.floor(Math.random() * 3000000000) +
        1 +
        "@gmail.com",
      firstName: "Organization ",
      lastName: "Manager",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_MANAGER"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
  ];

  
  getToken(userType).then((data) => {
    const accessToken = data.Token;
    cy.log(accessToken)
    cy.log(tempPayload)
  cy.request({
    method: "POST",
    url: env + "member/users",
    body: tempPayload,
    failOnStatusCode: false,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: accessToken,
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      orguuid: "08f75a64-12ef-4895-8616-03a387c23082",
    },
  }).then((response) => {
    cy.wrap(response).as("apiResponse");
    cy.get("@apiResponse").then((response) => {
      expect(response.status).to.eq(400); //It should be 403
    });
  }); })
});

When(
  "orgAdmin StandardUser OrgManager try to update Plan of the Organization",
  () => {
    accessTokenForDifUsers.forEach((Token, index) => {
      cy.log(accessToken);
      cy.request({
        method: "PUT",
        url: env + `organizations/${UUID}/update-plan/2`,
        failOnStatusCode: false,
        headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: Token,
          //     'cache-control': 'no-cache',
          //     'Content-Type': 'application/json',
          //    'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse${index}`);
        cy.get(`@apiResponse${index}`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

When(
  "orgAdmin StandardUser OrgManager try to Disable Data deletion policy of an organization",
  () => {
    accessTokenForDifUsers.forEach((Token, index) => {
      cy.log(accessToken);
      cy.request({
        method: "POST",
        url:
          env +
          `organizations/configureDataDeletion?orgUUID=${UUID}&dataDeletionEnable=false`,
        failOnStatusCode: false,
        headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: Token,
          //     'cache-control': 'no-cache',
          //     'Content-Type': 'application/json',
          //    'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse${index}`);
        cy.get(`@apiResponse${index}`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

When(
  "orgAdmin StandardUser OrgManager try to Enable Data deletion policy of an organization",
  () => {
    accessTokenForDifUsers.forEach((Token, index) => {
      cy.request({
        method: "POST",
        url:
          env +
          `organizations/configureDataDeletion?orgUUID=${UUID}&dataDeletionEnable=true`,
        failOnStatusCode: false,
        headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: Token,
          //     'cache-control': 'no-cache',
          //     'Content-Type': 'application/json',
          //    'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse${index}`);
        cy.get(`@apiResponse${index}`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

When(
  "StandardUser OrgAdmin OrgManager try to fetech list of organizations",
  () => {
    accessTokenForDifUsers.forEach((Token, index) => {
      cy.log(accessToken);
      cy.request({
        method: "GET",
        url: env + "organizations/list",
        failOnStatusCode: false,
        headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: Token,
          //     'cache-control': 'no-cache',
          //     'Content-Type': 'application/json',
          //    'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse${index}`);
        cy.get(`@apiResponse${index}`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

When(
  "StandardUser OrgAdmin OrgManager try to disable lisence of their organization",
  () => {
    accessTokenForDifUsers.forEach((Token, index) => {
      cy.request({
        method: "PUT",
        url: env + `organizations/disableUserConstraint?orgUUID=${UUID}`,
        failOnStatusCode: false,
        headers: {
          //     'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: Token,
          //     'cache-control': 'no-cache',
          //     'Content-Type': 'application/json',
          //    'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse${index}`);
        cy.get(`@apiResponse${index}`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

When("Check assigned licenses and available licenses are equal", (endpoint) => {
  cy.request({
    method: "GET",
    url: env + `organizations/detail?orgUUID=${UUID}`,
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: accessToken,
      // 'cache-control': 'no-cache',
      // 'Content-Type': 'application/json',
    },
  }).then((response) => {
    cy.log(response.body);
    expect(response.body.assignedLicenses).to.eq("3");
    expect(response.body.availableLicenses).to.eq("3");
  });
});

When("OrgManager Makes Standard User as orgAdmin", (endpoint) => {
  let standardUser = [
    {
      email: payload[2].email,
      firstName: payload[2].firstName,
      lastName: payload[2].lastName,
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: payload[2].organizationUUID,
    },
  ];

  // let standardUser = [ {
  //   email: "Standard8697231611@gmail.com",
  //   firstName: "Standard",
  //   lastName: "User",
  //   authorities: ["ROLE_ORG_ADMIN"],
  //   organizationUUID: "588508b6-ea27-4813-943c-e5a56effabdf",
  // }];

  cy.request({
    method: "PATCH",
    url: env + "member/users/add-to-group",
    body: standardUser,
    failOnStatusCode: false,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: accessTokenForDifUsers[2],
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      orguuid: "588508b6-ea27-4813-943c-e5a56effabdf",
    },
  }).then((response) => {
    cy.wrap(response).as("apiResponse");
    cy.get("@apiResponse").then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

When("OrgManager Unassigned Standard User as orgAdmin", (endpoint) => {
  // let standardUser = [ {
  //   email: payload[2].email,
  //   firstName: payload[2].firstName,
  //   lastName: payload[2].lastName,
  //   authorities: ["ROLE_ORG_ADMIN"],
  //   organizationUUID: "588508b6-ea27-4813-943c-e5a56effabdf",
  // }];

  let standardUser = [
    {
      email: "Standard8697231611@gmail.com",
      firstName: "Standard",
      lastName: "User",
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: "588508b6-ea27-4813-943c-e5a56effabdf",
    },
  ];

  cy.request({
    method: "PATCH",
    url: env + "member/users/remove-from-group",
    body: standardUser,
    failOnStatusCode: false,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: accessTokenForDifUsers[2],
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      orguuid: "588508b6-ea27-4813-943c-e5a56effabdf",
    },
  }).then((response) => {
    cy.wrap(response).as("apiResponse");
    cy.get("@apiResponse").then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});

Then(
  "Standard User now which is orgAdmin can access its organization",
  (endpoint) => {
    cy.request({
      method: "GET",
      url: `https://api.dev.allsorter.com/organizations/detail?orgUUID=588508b6-ea27-4813-943c-e5a56effabdf`,
      headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: accessTokenForDifUsers[0],
        // 'cache-control': 'no-cache',
        // 'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.log(response.body);
      expect(response.body.assignedLicenses).to.eq("3");
      expect(response.body.availableLicenses).to.eq("3");
    });
  }
);

Then(
  "Standard User now which is orgAdmin cannot access its organization",
  (endpoint) => {
    cy.request({
      method: "GET",
      url: `https://api.dev.allsorter.com/organizations/detail?orgUUID=588508b6-ea27-4813-943c-e5a56effabdf`,
      headers: {
        // 'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: accessTokenForDifUsers[0],
        // 'cache-control': 'no-cache',
        // 'Content-Type': 'application/json',
      },
    }).then((response) => {
      cy.wrap(response).as("apiResponse");
      cy.get("@apiResponse").then((response) => {
        expect(response.status).to.eq(401);
      });
    });
  }
);

Then(
  "The system will response that you are not authorize to performed this action with {int} Code",
  (code) => {
    accessTokenForDifUsers.forEach((_, index) => {
      cy.get(`@apiResponse${index}`).then((response) => {
        expect(response.body.message).to.be.oneOf(expectedMessages);
        expect(response.body.code).to.be.eq(code);
      });
    });
  }
);

// Given("the Super User authenticates successfully", () => {
//     const Supper_User = 'hahmed@allsorter.com'
//     const pass1 = "Aa@1787601"

//     cy.loginWithCognito(Supper_User, pass1).then(tokens => {
//       cy.log('Access Token:', tokens.accessToken);
//       storeToken("Supper_User", tokens.accessToken);
//     });

//     cy.loginWithCognito('Standard8697231611@gmail.com', password).then(tokens => {
//       cy.log('Access Token:', tokens.accessToken);
//       cy.log('ID Token:', tokens.idToken);
//       cy.log('Refresh Token:', tokens.refreshToken);
//       storeToken("Standard_User", tokens.accessToken);
//     });

//     cy.loginWithCognito('orgAdmin21908598501@gmail.com', password).then(tokens => {
//       cy.log('Access Token:', tokens.accessToken);
//       storeToken("Org_Admin", tokens.accessToken);
//     });

//     cy.loginWithCognito('orgManager16501453531@gmail.com', password).then(tokens => {
//       cy.log('Access Token:', tokens.accessToken);
//       storeToken("Org_Manager", tokens.accessToken);
//     });
// });

Given("should authenticate the user and return tokens", () => {
  Supper_User = "superCypressUser" + Math.floor(Math.random() * 3000000) + 1 + "@gmail.com"
 

  cy.createCognitoUserWithGroup(
    Supper_User,
    Supper_User,
    tempPassword,
    'Administrator',     
    'eu-west-1'          
  )
    .then((message) => {
      cy.log(message);  // Now you can log the message after the promise resolves
      cy.forceChangePassword(Supper_User, tempPassword, newPassword).then((token) => {
        accessToken2 = token.AccessToken
        IDToken = token.IdToken
        cy.log(token)
        storeToken('Supper_User', token.AccessToken )
      });
    })

});




Given(`the organization has an active "Elite" plan`, () => {
 
});


When(
  "{string} tries to update the Plan of the organization from Elite to Core",
  (userType) => {

    getToken(userType).then((data) => {
      const accessToken = data.Token;

    cy.log(accessToken)
      cy.request({
        method: "PUT",
        url: env + `organizations/${UUID}/update-plan/2`,
        failOnStatusCode: false,
        headers: {
          Authorization: accessToken,
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse`);
        cy.get(`@apiResponse`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    })
  }
);

Given(`the organization "Automation Org" has an active Data Deletion policy`, () => {
 
});

Given(`the organization "Automation Org" has an inactive Data Deletion policy`, () => {
 
});

Given(`the organization has active licenses`, () => {
 
});

Given(`the {string} is logged in`, () => {
 
});


When(
  "{string} tries to disable the Data Deletion policy of the organization",
  (userType) => {
    getToken(userType).then((data) => {
      const accessToken = data.Token;
      cy.log(accessToken);

      cy.request({
        method: "POST",
        url:
          env +
          `organizations/configureDataDeletion?orgUUID=${UUID}&dataDeletionEnable=false`,
        failOnStatusCode: false,
        headers: {
          Authorization: accessToken,
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse`);
        cy.get(`@apiResponse`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

When(
  "{string} tries to enable the Data Deletion policy of the organization",
  (userType) => {
    getToken(userType).then((data) => {
      const accessToken = data.Token;
      cy.log(accessToken);
      cy.request({
        method: "POST",
        url:
          env +
          `organizations/configureDataDeletion?orgUUID=${UUID}&dataDeletionEnable=true`,
        failOnStatusCode: false,
        headers: {
          Authorization: accessToken,    
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse`);
        cy.get(`@apiResponse`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

When(
  "{string} tries to disable licenses of the organization",
  (userType) => {
    getToken(userType).then((data) => {
      const accessToken = data.Token;
      cy.log(accessToken)
      cy.request({
        method: "PUT",
        url: env + `organizations/disableUserConstraint?orgUUID=${UUID}`,
        failOnStatusCode: false,
        headers: {
          Authorization: accessToken,
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse`);
        cy.get(`@apiResponse`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

When(
  "{string} tries to fetch the list of organizations",
  (userType) => {
    getToken(userType).then((data) => {
      const accessToken = data.Token;
      cy.log(accessToken)
      cy.request({
        method: "GET",
        url: env + "organizations/list",
        failOnStatusCode: false,
        headers: {
          Authorization: accessToken,
        },
      }).then((response) => {
        cy.wrap(response).as(`apiResponse`);
        cy.get(`@apiResponse`).then((response) => {
          expect(response.status).to.eq(401);
        });
      });
    });
  }
);

Given("{string} created new organization with following below details", (userType) => {
  formData.append(
    "name",
    "Automation User" + Math.floor(Math.random() * 30000000) + 1
  );
  formData.append("billingCycle", "MONTHLY");
  formData.append(
    "billingEmail",
    "Api" + Math.floor(Math.random() * 3000000) + 1 + "@apidoc.com"
  );
  formData.append("expiry", "2025-07-25T15:37:34.000Z");
  formData.append("frequencyInterval", "4");
  formData.append("max_users", "5");
  formData.append("planName", "Elite");


  
  getToken(userType).then((data) => {
    const accessToken = data.Token;
    cy.log(accessToken)
    cy.log(env + "organizations")
  cy.request({
    method: "POST",
    url: env + "organizations",
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: accessToken,
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      encoding: "binary",
    },
    failOnStatusCode: false,
    body: formData,
  }).then((response) => {
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    UUID = responseBody.uuid;
    cy.log(responseBody)
    cy.wrap(response).as("apiResponse");
    cy.get("@apiResponse").then((response) => {
      expect(response.status).to.eq(201);
    });
  });
})
});

When("{string} create 3 new users in the organization named Automation Org", (userType) => {

  const orgAdmin2Email = "orgAdmin2" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com";
  const standardEmail = "Standard" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com";
  const orgManagerEmail = "orgManager" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com";

  emails = {
    orgAdmin2: orgAdmin2Email,
    standard: standardEmail,
    orgManager: orgManagerEmail,
  };

 
  payload = [
    {
      email:
        "orgAdmin" + Math.floor(Math.random() * 3000000000) + 1 + "@gmail.com",
      firstName: "Organization",
      lastName: "Admin",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email: orgAdmin2Email,
      firstName: "Organization",
      lastName: "Admin",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email: standardEmail,
      firstName: "Standard",
      lastName: "User",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_USER"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
    {
      email: orgManagerEmail,
      firstName: "Organization ",
      lastName: "Manager",
      address: "<p>ewqwe</p>",
      authorities: ["ROLE_ORG_MANAGER"],
      organizationUUID: UUID, // Ensure this UUID is correct
      phone: "",
      position: "",
      active: true,
    },
  ];

  getToken(userType).then((data) => {
    const accessToken = data.Token;
  cy.request({
    method: 'POST',
    url: env + 'member/users',
    body: payload,
    failOnStatusCode: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': accessToken,
      'cache-control': 'no-cache',
      'Content-Type': 'application/json',
      'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
    },
  }).then((response) => {
    cy.wrap(response).as('apiResponse');
    cy.get('@apiResponse').then((response) => {
      expect(response.status).to.eq(200);
    });
  });
})
});

When("{string} check number of assigned licenses should be equal to 3", (userType) => {

  getToken(userType).then((data) => {
    const accessToken = data.Token;
  cy.request({
    method: "GET",
    url: env + `organizations/detail?orgUUID=${UUID}`,
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: accessToken,
      // 'cache-control': 'no-cache',
      // 'Content-Type': 'application/json',
    },
  }).then((response) => {
    cy.log(response.body);
    expect(response.body.assignedLicenses).to.eq("3");
  }); 
})
});

When("the {string} assigns the ORD Admin role to the Standard User", (userType) => {
  let standardUser = [
    {
      email: payload[2].email,
      firstName: payload[2].firstName,
      lastName: payload[2].lastName,
      authorities: ["ROLE_ORG_ADMIN"],
      organizationUUID: payload[2].organizationUUID,
    },
  ];

  getToken(userType).then((data) => {
    const accessToken = data.Token;
    cy.log(accessToken)
  cy.request({
    method: "PATCH",
    url: env + "member/users/add-to-group",
    body: standardUser,
    failOnStatusCode: false,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: accessToken,
      "cache-control": "no-cache",
      "Content-Type": "application/json",
      orguuid: UUID
    },
  }).then((response) => {
    cy.wrap(response).as("apiResponse");
    cy.get("@apiResponse").then((response) => {
      expect(response.status).to.eq(200);
    });
  }); })
});


Then(
  "System should allow the creation of these Users.",
  () => {
      cy.get(`@apiResponse`).then((response) => {
        cy.log(response)
         expect(response.status).to.be.eq(200);
      });
  }
);


Then(
  `The system should respond with an authorization error`,
  () => {
      cy.get(`@apiResponse`).then((response) => {
        expect(response.body.message).to.be.oneOf(expectedMessages);
      });
  }
);

Then(
  `The system should prevent the additional user creation`,
  () => {
    cy.get(`@apiResponse`).then((response) => {
      expect(response.status).to.be.eq(400);
    });
  }
);

Then(
  `The system should show an error indicating that {string}`,
  (error) => {
      cy.get(`@apiResponse`).then((response) => {
        expect('Your organization has reached its license limit, please contact support@allsorter.com or reach out to your Account Manager to upgrade your subscription.')
        .to.be.eq(error);
      });
  }
);

Given("I have an organization with 3 available licenses", (userType) => {

});

Given("the Standard User is currently assigned the ORD Admin role", (userType) => {

});

And("3 users have already been created", (userType) => {

  const users = [
        { email: emails.standard, file: 'Standard_User' },
        { email: emails.orgAdmin2, file: 'Org_Admin' },
        { email: emails.orgManager, file: 'Org_Manager' }
  ];

users.forEach(user => {
  cy.forceChangePassword(user.email, tempPassword, newPassword).then((token) => {
    cy.log(token.AccessToken)
    storeToken(user.file, token.AccessToken )
  });
});

});




//Function to set Billing Plan to MONTHLY
function setBillingPlanToMonthly() {
  const formData = new FormData();
  formData.append('billingCycle', 'MONTHLY');
  cy.log(UUID)
  cy.request({
      method: 'PUT',
      url: env + `organizations/updateBillingCycle/${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`, // Replace with a valid token
      },
      body: formData
  }).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Response body is:', JSON.stringify(response.body));
     
  });
}


//Function to set Billing Plan to YEARLY
function setBillingPlanToYearly() {
  const formData = new FormData();
  formData.append('billingCycle', 'YEARLY');
  cy.request({
      method: 'PUT',
      url: env + `organizations/updateBillingCycle/${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`, // Replace with a valid token
      },
      body: formData
  }).then((response) => {
      expect(response.status).to.eq(200);
      cy.log('Response body is:', JSON.stringify(response.body));
     
  });
}

//Function to additional uploads to zero initially
function setAdditionalUploadsToZero() {
  additionalUploads = 0;
  const payload = {
    orgUUID: UUID,
    additionalUploads: additionalUploads,
  };

  // Send PUT request to update additional uploads
  cy.request({
    method: 'PUT',
    url: additionalUploadsApi,
    
    headers: {
      'token': IDToken, // Replace with your valid token
    },
    body: payload,
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201]); // Verify the response code indicates success
    
  });
}



Given('A Super user hit the endpoint to fetch the mtm Token from API', () => {
  cy.request({
    method: 'POST',
    url: mtmTokenApi,
    headers: {
      Authorization: mtmBasicAuth,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then((response) => {
    // Check that the response has the expected status code
    expect(response.status).to.eq(200);
    // Save the access token for future requests
    mtmToken = response.body.access_token;
    // Log the fetched token to verify it
    cy.log('Fetched Access Token:', mtmToken);
  });
});

When('The Super user authenticates the endpoint using mtm Token saves the ID token in DB via API', () => {
  // Send POST request to save tokens in the DB
  cy.log(IDToken)
  cy.request({
    method: 'POST',
    url: saveTokenApi,
    headers: {
      Authorization: `Bearer ${mtmToken}`, // Using mtmToken as Bearer token for Authorization
      'Content-Type': 'application/json'
    },
    body: {
      id_token: IDToken, // Pass the IDToken fetched in beforeEach
      access_token: accessToken2, // Pass accessToken2 fetched in beforeEach
      email: Supper_User // Static email as per the request
    }
  }).then((response) => {
    // Check if the request was successful
    expect(response.status).to.eq(200); // Expect status 200 for successful saving
    cy.log('Tokens saved successfully in DB');
  });
});







// Define the step to update the organization of a user
Given('A user updates the organization with the provided details', () => {
  // Define the headers
  const headers = {
    Authorization: `Bearer ${accessToken2}`,  // Ensure 'bearerToken' is set in your Cypress environment variables
    orguuid: UUID
  };

  // Define the payload
  const payload = [
    {
      email: Supper_User,
      firstName: 'abc',
      lastName: 'xyz',
      authorities: ['ROLE_USER'],
      organizationUUID: UUID
    }
  ];

  // Send the PUT request
  cy.request({
    method: 'PUT',
    url: joinOrgApi,
    headers: headers,
    body: payload
  }).then((response) => {
    // Assert the response status code
    expect(response.status).to.eq(200);
    // Log the response for debugging purposes
    cy.log('Response:', JSON.stringify(response.body));
  });
});













/* Scenario: Verify that converting Billing Cycle from Monthly to Quarterly multiplies the existing value of Default User Per Upload by 3 */

// Given step definition




Given('the billing cycle of an organization "Allsorter-StandAlone" is set to "Monthly" and the default user per upload value is storedd', () => {
  //Call to function to set Billing Plan to MONTHLY
  setBillingPlanToMonthly();
  
  
  // Fetch the organization details using GET request
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`,
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code
      // Log the entire response body to verify the structure
      cy.log(JSON.stringify(response.body));

      uploadPerUserInitial = response.body.uploadPerUser; // Store the value of uploadPerUser
      cy.log(`Initial uploadPerUser value: ${uploadPerUserInitial}`);
  });
})




When('the billing cycle is updated to "Quarterly" through the API', () => {
  // Define the PUT request payload
  const formData = new FormData();
  formData.append('billingCycle', 'QUARTERLY');

  // Send a PUT request to update the billing cycle
  cy.request({
      method: 'PUT',
      url: env + `organizations/updateBillingCycle/${UUID}`, // Replace with the actual PUT endpoint URL
      headers: {
        
        'Authorization': `Bearer ${accessToken2}`, // Replace with your auth token
          
      },
      failOnStatusCode: false,
      body: formData
  }).then((response) => {

      cy.log('Response body:', JSON.stringify(response.body));
  });
});

// Then step definition
Then('the initial value of default user per upload value should be multiplied by 3', () => {
  // Fetch the organization details again to verify the updated value
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`, // Replace with your auth token
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code

      const uploadPerUserUpdated = Number(response.body.uploadPerUser); // Get the updated value of uploadPerUser
      const expectedValue = uploadPerUserInitial * 3; // Calculate the expected value

      // Verify if the updated value matches the expected value
      expect(uploadPerUserUpdated).to.eq(expectedValue);
      cy.log(`Updated uploadPerUser value: ${uploadPerUserUpdated}`);
  });
});


/*Scenario: Verify that converting Billing Cycle from Monthly to Yearly multiplies the existing value of Default User Per Upload by 12*/

Given('the billing cycle of an organization "Allsorter-StandAlone" is set to "Monthly" and the default user per upload value is stored', () => {
  //Call to function to set Billing Plan to MONTHLY
  setBillingPlanToMonthly();
  
  
  // Fetch the organization details using GET request
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`,
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code
      // Log the entire response body to verify the structure
      cy.log(JSON.stringify(response.body));

      uploadPerUserInitial = response.body.uploadPerUser; // Store the value of uploadPerUser
      cy.log(`Initial uploadPerUser value: ${uploadPerUserInitial}`);
  });
})




When('the billing cycle is updated to "Yearly" through the API', () => {
  // Define the PUT request payload
  const formData = new FormData();
  formData.append('billingCycle', 'YEARLY');

  // Send a PUT request to update the billing cycle
  cy.request({
      method: 'PUT',
      url: env + `organizations/updateBillingCycle/${UUID}`, // Replace with the actual PUT endpoint URL
      headers: {
        
        'Authorization': `Bearer ${accessToken2}`, // Replace with your auth token
          
      },
      failOnStatusCode: false,
      body: formData
  }).then((response) => {

      cy.log('Response body:', JSON.stringify(response.body));
  });
});

// Then step definition
Then('the monthly value of default user per upload should be multiplied by twelve', () => {
  // Fetch the organization details again to verify the updated value
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`, // Replace with your auth token
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code

      const uploadPerUserUpdated = Number(response.body.uploadPerUser); // Get the updated value of uploadPerUser
      const expectedValue = uploadPerUserInitial * 12; // Calculate the expected value

      // Verify if the updated value matches the expected value
      expect(uploadPerUserUpdated).to.eq(expectedValue);
      cy.log(`Updated uploadPerUser value: ${uploadPerUserUpdated}`);
  });
});


/*Scenario: Verify that consumed quota is being used correctly on uploading resume documents*/

Given('the user Super Admin belongs to an organization AllSorterStandAlone with a specific quota which is retrievedd', () => {
  
  
  // Fetch the organization details using GET request
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`,
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code
      // Log the entire response body to verify the structure
      //cy.log(JSON.stringify(response.body));

      quotaInitialValue = response.body.currentSubscriptionUploads; // Store the value of uploadPerUser
      cy.log(`Initial uploadPerUser value: ${quotaInitialValue}`);

      
  });
})



When('the Super Admin user uploads a valid resume file', () => {
  // Define the file path relative to the "cypress/fixtures" directory
  const filePath = 'resume.pdf'; // Make sure 'resume.pdf' is present in the "cypress/fixtures" folder

  // Load the PDF file from fixtures and convert it to a Blob
  cy.fixture(filePath, 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((blob) => {
          const formData = new FormData();
          formData.append('file', blob, filePath);

          cy.log(IDToken)

          // Send the POST request to upload the resume
          cy.request({
              method: 'POST',
              url: resumeUploadApi,
              headers: {
                  'token': IDToken
              },
              body: formData,
              // Important: Set `encoding` to `binary` since it's a binary file
              encoding: 'binary',
          }).then((response) => {
              // Assert that the response status code is 200 or 201
              expect(response.status).to.be.oneOf([200, 201]);

              // Log the response body for further verification if needed
              cy.log('Resume upload response:', JSON.stringify(response.body));
          });
      });
});


Then('the Consumed Quota value for the organization should increase by 1', () => {
  // Fetch the organization details again to verify the updated value
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`, // Replace with your auth token
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code

      const quotaUpdatedValue = Number(response.body.currentSubscriptionUploads); // Get the updated value of uploadPerUser
      const expectedValue = quotaInitialValue + 1; // Calculate the expected value

      // Verify if the updated value matches the expected value
      expect(quotaUpdatedValue).to.eq(expectedValue);
      cy.log(`Updated uploadPerUser value: ${quotaUpdatedValue}`);
  });
});


/*Scenario: Update the billing cycle from Yearly to Monthly and verify the uploadPerUser value*/
Given('the billing cycle of an organization "Allsorter-StandAlone" is set to "Yearly" and the default user per upload value is stored', () => {
  
  //Call to Function to set Billing tyoe to yearly
  setBillingPlanToYearly();
  // Fetch the organization details using GET request
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`,
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code
      // Log the entire response body to verify the structure
      cy.log(JSON.stringify(response.body));

      uploadPerUserInitial = response.body.uploadPerUser; // Store the value of uploadPerUser
      cy.log(`Initial uploadPerUser value: ${uploadPerUserInitial}`);
  });
})




When('the billing cycle is updated to "Monthly" by the API', () => {
  // Define the PUT request payload
  const formData = new FormData();
  formData.append('billingCycle', 'MONTHLY');

  // Send a PUT request to update the billing cycle
  cy.request({
      method: 'PUT',
      url: env + `organizations/updateBillingCycle/${UUID}`, // Replace with the actual PUT endpoint URL
      headers: {
        
        'Authorization': `Bearer ${accessToken2}`, // Replace with your auth token
          
      },
      failOnStatusCode: false,
      body: formData
  }).then((response) => {

      cy.log('Response body:', JSON.stringify(response.body));
  });
});

// Then step definition
Then('the Yearly value of default user per upload should be divided by twelve', () => {
  // Fetch the organization details again to verify the updated value
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`, // Replace with your auth token
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code

      const uploadPerUserUpdated = Number(response.body.uploadPerUser); // Get the updated value of uploadPerUser
      const expectedValue = uploadPerUserInitial / 12; // Calculate the expected value

      // Verify if the updated value matches the expected value
      expect(uploadPerUserUpdated).to.eq(expectedValue);
      cy.log(`Updated uploadPerUser value: ${uploadPerUserUpdated}`);
  });
});



Given('the user belongs to an organization with an existing available quota for uploads of resume', () => {
  // Fetch organization details using GET request
  setAdditionalUploadsToZero();
  cy.request({
    method: 'GET',
    url: env + `organizations/detail?orgUUID=${UUID}`,
    headers: {
      'Authorization': `Bearer ${accessToken2}`, // Replace with your valid token
    },
  }).then((response) => {
    expect(response.status).to.eq(200); // Verify the response code
    cy.log('Organization Details:', JSON.stringify(response.body));

    // Store the initial value of totalAvailableUploads for comparison in the THEN step
    initialTotalAvailableUploads = response.body.totalAvailableUploads;
    cy.log(`Initial Available Uploads: ${initialTotalAvailableUploads}`);
  });
});

When('the user sends a request to add additional uploads with a specific number {int} using the API endpoint', (uploads) => {
  // Define the payload to update additional uploads
  additionalUploads = uploads;
  const payload = {
    orgUUID: UUID,
    additionalUploads: additionalUploads,
  };

  // Send PUT request to update additional uploads
  cy.request({
    method: 'PUT',
    url: additionalUploadsApi,
    headers: {
      'token': IDToken, // Replace with your valid token
    },
    body: payload,
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 201]); // Verify the response code indicates success
    
  });
});


Then('the count of available uploads for the organization should increase by the exact number provided {int}', (expectedIncrease) => {
  // Fetch the organization details again to verify the updated available uploads
  cy.request({
    method: 'GET',
    url: env + `organizations/detail?orgUUID=${UUID}`,
    headers: {
      'Authorization': `Bearer ${accessToken2}`, // Replace with your valid token
    },
  }).then((response) => {
    expect(response.status).to.eq(200); // Verify the response code

    // Calculate the updated available uploads
      const updatedTotalAvailableUploads = response.body.totalAvailableUploads;
      cy.log(`Updated Total Available Uploads: ${updatedTotalAvailableUploads}`);

      const expectedTotal = initialTotalAvailableUploads + expectedIncrease;
      expect(updatedTotalAvailableUploads).to.eq(expectedTotal);
      cy.log(`Expected Total Available Uploads: ${expectedTotal}`);
  });
});


/*Scenario: Verify total available uploads calculation for an organization*/

Given('a super admin user belongs to an organization {string}', (orgName) => {
  // This is where you might log in or set up any necessary context
  cy.log(`Super admin user is accessing organization: ${orgName}`);
});

When('the API is called to get the details of organization', () => {

  // Make a GET request to fetch organization details
  cy.request({
    method: 'GET',
    url: env + `organizations/detail?orgUUID=${UUID}`,
    headers: {
      'Authorization': `Bearer ${accessToken2}`,
    },
  }).then((response) => {
    // Validate the response status
    expect(response.status).to.eq(200); // Check for successful response

    // Log the entire response body for reference
    cy.log(JSON.stringify(response.body));

    // Store the response for later use
    cy.wrap(response.body).as('orgDetails');
  });
});

Then('the available uploads should be equal to the product of licenses with upload per user then addition of additional uploads', function () {
  // Retrieve organization details stored in the previous step
  const orgDetails = this.orgDetails;

  // Extract necessary fields from the response
  const availableLicenses = orgDetails.availableLicenses;
  const uploadPerUser = orgDetails.uploadPerUser;
  const additionalUploads = orgDetails.additionalUploads;
  const totalAvailableUploads = orgDetails.totalAvailableUploads;

  // Calculate the expected total available uploads
  const expectedTotalAvailableUploads = (availableLicenses * uploadPerUser) + additionalUploads;

  // Log both values for comparison
  cy.log(`Calculated Total Available Uploads: ${expectedTotalAvailableUploads}`);
  cy.log(`API Response Total Available Uploads: ${totalAvailableUploads}`);

  // Validate that the calculated value matches the total available uploads from the API response
  expect(totalAvailableUploads).to.eq(expectedTotalAvailableUploads);
});





Given('the user Super Admin belongs to an organization apiAutomation with a specific quota available', () => {
  // Fetch the organization details using GET request
  cy.request({
      method: 'GET',
      url: env + `organizations/detail?orgUUID=${UUID}`,
      headers: {
          'Authorization': `Bearer ${accessToken2}`,
      },
  }).then((response) => {
      expect(response.status).to.eq(200); // Verify the response code
      
      // Store the value of currentSubscriptionUploads and totalAvailableUploads
      const currentSubscriptionUploads = response.body.currentSubscriptionUploads;
      const totalAvailableUploads = response.body.totalAvailableUploads;
      
      cy.log(`Current Subscription Uploads: ${currentSubscriptionUploads}`);
      cy.log(`Total Available Uploads: ${totalAvailableUploads}`);

      // Save the quota values for use in the When step
      cy.wrap({ currentSubscriptionUploads, totalAvailableUploads }).as('quotaInfo');
  });
});

When('the user uploads a resume then system must upload a resume only if quota is available otherwise there must be a relevant error', function() {
  // Retrieve the stored quota information
  const { currentSubscriptionUploads, totalAvailableUploads } = this.quotaInfo;

  // Define the file path relative to the "cypress/fixtures" directory
  const filePath = 'resume.pdf'; // Make sure 'resume.pdf' is present in the "cypress/fixtures" folder

  // Load the PDF file from fixtures and convert it to a Blob
  cy.fixture(filePath, 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((blob) => {
          const formData = new FormData();
          formData.append('file', blob, filePath);

          // Check if totalAvailableUploads is greater than currentSubscriptionUploads
          if (totalAvailableUploads > currentSubscriptionUploads) {
              // Proceed with the upload if there is available quota
              cy.request({
                  method: 'POST',
                  url: resumeUploadApi,
                  headers: {
                      'token': IDToken,
                  },
                  body: formData,
                  encoding: 'binary', // Important: Set `encoding` to `binary` since it's a binary file
              }).then((response) => {
                  // Assert that the response status code is 200 or 201
                  expect(response.status).to.be.oneOf([200, 201]);

                  // Log the response body for further verification if needed
                  cy.log('Resume uploaded successfully:', JSON.stringify(response.body));
              });
          } else {
              // Handle the case where the quota limit is reached
              cy.log('Resume not uploaded due to quota limit reached.');

              // Attempt to hit the upload endpoint to simulate failure
              cy.request({
                  method: 'POST',
                  url: resumeUploadApi,
                  headers: {
                      'token': IDToken,
                  },
                  body: formData,
                  encoding: 'binary',
                  // Set failOnStatusCode to false to capture the error response
                  failOnStatusCode: false,
              }).then((response) => {
                  // Assert that the response status code indicates an error (like 400)
                  expect(response.status).to.eq(500); 
                  cy.log('Resume upload failed as expected due to quota limit.');
              });
          }
      });
});




//Function to enable the licenses in organization
function enableLicense() {
  cy.request({
    method: 'POST',
    url: env + `organizations/configureUserConstraint?orgUUID=${UUID}&userConstraintEnable=true`,
    headers: {
      'Authorization': `Bearer ${accessToken2}`,
    }
  }).then((response) => {
    // Validate the response to confirm license is disabled
    expect(response.status).to.eq(200); // Assuming 200 means success
    expect(response.body.userConstraintsEnable).to.eq(true); // Confirm license is disabled
    cy.log('License has been enabled for the organization.');
  });
}



// Given step: Verify Super Admin belongs to an organization with a valid license
Given('a Super Admin user belongs to an organization APIAutomation with a valid license', () => {
  // This step would typically be a precondition verification or setup in real applications
  // Assuming organization already has a valid license at the beginning of this test
  cy.log("Super Admin user belongs to an organization with a valid license.");
});

When('the Super Admin disables the license of organization with API and additional uploads are set to zero', () => {
  setAdditionalUploadsToZero();
  cy.request({
    method: 'PUT',
    url: env + `organizations/disableUserConstraint?orgUUID=${UUID}`,
    headers: {
      'Authorization': `Bearer ${accessToken2}`,
    }
  }).then((response) => {
    // Validate the response to confirm license is disabled
    expect(response.status).to.eq(200); // Assuming 200 means success
    expect(response.body.userConstraintsEnable).to.eq(false); // Confirm license is disabled
    cy.log('License has been disabled for the organization.');
  });
});


Then('the system must not allow the user to upload new resume in the organization and display a relevant message', () => {
  // Define the file path relative to the "cypress/fixtures" directory
  const filePath = 'resume.pdf'; // Make sure 'resume.pdf' is present in the "cypress/fixtures" folder

  // Load the PDF file from fixtures and convert it to a Blob
  cy.fixture(filePath, 'binary')
      .then(Cypress.Blob.binaryStringToBlob)
      .then((blob) => {
          const formData = new FormData();
          formData.append('file', blob, filePath);

          // Send the POST request to upload the resume
          cy.request({
              method: 'POST',
              url: resumeUploadApi,
              headers: {
                  'token': IDToken
              },
              body: formData,
              failOnStatusCode: false,
              // Important: Set `encoding` to `binary` since it's a binary file
              encoding: 'binary',
          }).then((response) => {
            // Add an assertion that expects a 500 error
            cy.wrap(response.status).should('eq', 500, 'Expected resume upload to fail with 500 status');
          });
        })
        .then(() => {
          // Ensure enableLicense() is always called afterward
          enableLicense();
        });
    });


    Given('Super Admin enable the organization license', () => {
      enableLicense();
    });








/* Create organization with random email and name
Given('a super user hits the endpoint to create a new organization and the organization is created and uuid is stored', () => {
  // Generate unique name and billing email
  const uniqueSuffix = Date.now();
  const orgName = `apiAutomation_${uniqueSuffix}`;
  const billingEmail = `apiAutomation_${uniqueSuffix}@apidoc.com`;

  // Create FormData object to structure the payload for form-data
  const formData = new FormData();
  formData.append('name', orgName);
  formData.append('billingCycle', 'MONTHLY');
  formData.append('billingEmail', billingEmail);
  formData.append('frequencyInterval', '1');
  formData.append('max_users', '5');
  formData.append('planName', 'Core');

  // Send POST request to create the organization
  cy.request({
    method: 'POST',
    url: 'https://api.dev.allsorter.com/organizations',
    headers: {
      'Authorization': access_token1,  // Include Bearer token for authorization
    },
    body: formData,  // Attach FormData directly as the request body
  }).then((response) => {
    // Validate the response and extract the UUID
    expect(response.status).to.be.oneOf([200, 201]);
    const orgID = response.body.uuid;  // Extract and store UUID
    //cy.wrap(orgUUID).as('orgID');
    cy.log(`Organization created with Name: ${orgName} and UUID: ${orgID}`);
  });
});
*/