import {
    Given,
    When,
    Then
  } from 'cypress-cucumber-preprocessor/steps';

let endpoint;
let payload;
let payload1;
let response;
let updatedPayload
let notExistentPayload 
const url = 'https://api.dev.allsorter.com/member/users';
const accessToken = 'eyJraWQiOiJadGt6V3FzN0ttSHhYOGN1b1hmdTQ1SXVtRFJyZDJGRHNySjhFT1lLeGJBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3Yzg2ZGJjYS04MTVmLTQ4MWUtOTM1Yi0zYzk1ZDI4ZTY0NDgiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbmlzdHJhdG9yIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX3dRQkZ6RnI3ZCIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6IjNnbHF0dm10MzZxNHRnMWI2YmM0M2d0ZW5nIiwiZXZlbnRfaWQiOiIxMzcwOGEzOC0yMjVkLTRlNmQtYTY3Zi1mZmRiYmU0ZDY0NWQiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCIsImF1dGhfdGltZSI6MTcyNjczNjU5NiwiZXhwIjoxNzI2Nzc5Nzk2LCJpYXQiOjE3MjY3MzY1OTksImp0aSI6Ijc3YzQ2MTI3LWM4YWItNDAwMS1iNTExLTdjOWJkYjYzMzM5ZSIsInVzZXJuYW1lIjoiN2M4NmRiY2EtODE1Zi00ODFlLTkzNWItM2M5NWQyOGU2NDQ4In0.MhHdfnWkDv2GBb00ilyuUFJHJcuDnhL33xp9KL3TIcXfHgxZon9kR_nvVjTM9I0tLpjOMICTGVi_W0y1yfknoE1Juf8JNhROUA93NfuUBB0dB7hM2Fa8tntsVDaYge1_V46Kt0LBLR0Sv9bVw6XYo2nTRDIHFUnrttw7agwx1J76jzkLwOdhs7nhfPSsrRI8lQeP9Ao1fVZtBqRqOdjP7IxLTMw82TLpfMOK1CS8rAcOMCOChkDI7pXaXtN3mrBvyYJdEOxjZeqPlMWtBP7McUu80vJG7Fig-OabT1EmCY6m8oRshNrX_Nu_RR3dx56KaQLMGlLDXv4IxoclsyiuIQ'


function generateRandomString(prefix = '', length = 5) {
  return `${prefix}${Math.random().toString(36).substring(2, 2 + length)}`; // Generate random string with a prefix
}


When('a payload with an email {string} that already exists in the system', (email) => {
  // Define the payload
    payload = [ {
        email: "testing12323@gmail.com",
        firstName: "Rayan131",
        lastName: "Ahmad121",
        address: "<p>ewqwe</p>",
        authorities: ["ROLE_USER"],
        organizationUUID: "08f75a64-12ef-4895-8616-03a387c23082",  // Ensure this UUID is correct
        phone: "",
        position: "",
        active: true
      }];
});

When('the user sends a POST request to the API with the payload', () => {
    const url = 'https://api.dev.allsorter.com/member/users';

    cy.request({
      method: 'POST',
      url: url,
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
    });
});

Then('the response body should contain an error message indicating that the user already exists', () => {
    cy.get('@apiResponse').its('body').then((body) => {
        cy.log(body)
        expect(body.code).to.equal('USER_ALREADY_EXISTS');
      });
  
});

Given('a valid payload with the following data to create new User:', (dataTable) => {
  
  const randomFirstName = generateRandomString('FirstName_'); // Generates a random first name with a prefix
  const randomLastName = generateRandomString('LastName_');   // Generates a random last name with a prefix
  const randomEmail = `user_${Date.now()}@example.com`;   

  payload = [ {
    email: randomEmail,
    firstName: randomFirstName,
    lastName: randomLastName,
    address: "<p>ewqwe</p>",
    authorities: ["ROLE_USER"],
    organizationUUID: "08f75a64-12ef-4895-8616-03a387c23082",  // Ensure this UUID is correct
    phone: "5454",
    position: "TESTER ADMIN",
    active: true
  }];

  const jsonData = JSON.stringify(payload, null, 2); // Pretty-print the JSON with 2-space indentation
  cy.writeFile('cypress/fixtures/userPayload.json', jsonData)
});

When('the user sends a POST request to the API with the payload to create user', () => {

  cy.request({
    method: 'POST',
    url: url,
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
  });
});


Then('the response body should contain the valid given payload for new user:', (dataTable) => {
  cy.get('@apiResponse').its('body.successfulUsers').should('exist').and((users) => {
    expect(users[0]).to.have.property('email', payload[0].email);
    expect(users[0]).to.have.property('firstName', payload[0].firstName);
    expect(users[0]).to.have.property('lastName', payload[0].lastName);
    expect(users[0]).to.have.property('address', payload[0].address);
    expect(users[0]).to.have.property('authorities').deep.equal(payload[0].authorities);
    expect(users[0]).to.have.property('organizationUUID', payload[0].organizationUUID);
    expect(users[0]).to.have.property('phone', payload[0].phone);
    expect(users[0]).to.have.property('position', payload[0].position);
    expect(users[0]).to.have.property('active', payload[0].active);
    expect(users[0]).to.have.property('providerKey', 'Cognito');
  });
});

When('I send post request without UUID', () => {

  cy.request({
    method: 'POST',
    url: url,
    body: payload,
    failOnStatusCode: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': accessToken,
      'cache-control': 'no-cache',
      'Content-Type': 'application/json',
      //'orguuid': '',
    }, 
  }).then((response) => {
    cy.wrap(response).as('apiResponse');
  });
});

Given('a valid payload with the following data to create new User:', (dataTable) => {
  
  
});


Then('the response body should contain detail and instance', (dataTable) => {
  cy.get('@apiResponse').its('body').then((body) => {
    cy.log(body)
    expect(body).to.have.property('message', "Required request header 'orgUUID' for method parameter type String is not present");
    //expect(body).to.have.property('instance', "/member/users");
  });
});

When('The user sends a PUT request to the API to Update user', () => {

  cy.readFile('cypress/fixtures/userPayload.json').then((data) => {
  let updatedData = data

  const randomFirstName = generateRandomString('eee'); // Generates a random first name with a prefix
  const randomLastName = generateRandomString('LastName_');   // Generates a random last name with a prefix
  const address = generateRandomString('Address_');   // Generates a random last name with a prefix

   payload = [ {
    email: updatedData[0].email,
    firstName: randomFirstName,
    lastName: randomLastName,
    address: address,
    authorities: updatedData[0].authorities,
    organizationUUID: updatedData[0].organizationUUID,  // Ensure this UUID is correct
    phone: updatedData[0].phone,
    position: updatedData[0].position,
    active: updatedData[0].active
  }];
  
  cy.log(payload)
  
   cy.request({
     method: 'PUT',
     url: url,
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
   });
  })

});

Then('the response body should contain the valid given payload for Updated user:', (dataTable) => {
  cy.get('@apiResponse').its('body.successfulUsers').should('exist').and((users) => {
    expect(users[0]).to.have.property('email', payload[0].email);
    expect(users[0]).to.have.property('firstName', payload[0].firstName);
    expect(users[0]).to.have.property('lastName', payload[0].lastName);
    expect(users[0]).to.have.property('address', payload[0].address);
    expect(users[0]).to.have.property('authorities').deep.equal(payload[0].authorities);
    expect(users[0]).to.have.property('organizationUUID', payload[0].organizationUUID);
    expect(users[0]).to.have.property('phone', payload[0].phone);
    expect(users[0]).to.have.property('position', payload[0].position);
    expect(users[0]).to.have.property('active', payload[0].active);
    //expect(users[0]).to.have.property('providerKey', 'Cognito');
  });
});

When('Sends a PATCH request TO add user to group', () => {

  cy.log(payload)
  updatedPayload = [ {
    email: payload[0].email,
    firstName: payload[0].firstName,
    lastName: payload[0].lastName,
    authorities: payload[0].authorities,
    organizationUUID: payload[0].organizationUUID, 
  }];

  cy.log(updatedPayload)
  
   cy.request({
     method: 'PATCH',
     url: url + '/add-to-group',
     body: updatedPayload,
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
   });

});

When('Sends a PATCH request TO remove user from group', () => {

  cy.log(payload)
  updatedPayload = [ {
    email: payload[0].email,
    firstName: payload[0].firstName,
    lastName: payload[0].lastName,
    authorities: payload[0].authorities,
    organizationUUID: payload[0].organizationUUID, 
  }];

  cy.log(updatedPayload)
  
   cy.request({
     method: 'PATCH',
     url: url + '/remove-from-group',
     body: updatedPayload,
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
   });

});

Then('the response body should contain the valid given payload for add to group:', (dataTable) => {
  cy.get('@apiResponse').its('body.successfulUsers').should('exist').and((users) => {
    expect(updatedPayload[0]).to.have.property('email', users[0].email);
    expect(updatedPayload[0]).to.have.property('firstName', users[0].firstName);
    expect(updatedPayload[0]).to.have.property('lastName', users[0].lastName);
   // expect(updatedPayload[0]).to.have.property('authorities').deep.equal(users[0].authorities);
    //expect(users[0]).to.have.property('providerKey', 'Cognito');
  });
});

When('A valid {string} API endpoint {string} without Bearer Token', (methods, endpoint) => {

  cy.log( url + endpoint)
  
   cy.request({
     method: methods,
     url: url + endpoint,
     body: payload,
     failOnStatusCode: false,
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
     //  'Authorization': accessToken,
       'cache-control': 'no-cache',
       'Content-Type': 'application/json',
       'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
     }, 
   }).then((response) => {
    cy.wrap(response).as('apiResponse');
   });

});

Then('Validate the error message', (dataTable) => {
  cy.get('@apiResponse').its('body').then((body)=>{
    expect(body.error).to.be.eq('Unauthorized')
  })
});


When('The user sends a PATCH request to {string} role to a non-existent user.', (endpoint) => {
  
  let notExistentPayload = [ {
    email: "nonexistentuser@allsorter.com",
    firstName: "nonexistentuser",
    lastName: "LAST",
    authorities: ["ROLE_ORG_ADMIN"],
    organizationUUID: "08f75a64-12ef-4895-8616-03a387c23082", 
  }];

  
   cy.request({
     method: 'PATCH',
     url: url + endpoint,
     body: notExistentPayload,
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
   });

});

When('User {string} without Firstname and last name.', (methods) => {
  
 let missingPayload = [ {
    email: "NEWmail@gmail.com",
    firstName: "",
    lastName: "",
    address: "<p>ewqwe</p>",
    authorities: ["ROLE_USER"],
    organizationUUID: "08f75a64-12ef-4895-8616-03a387c23082",  // Ensure this UUID is correct
    phone: "",
    position: "",
    active: true
  }];

  
   cy.request({
     method: methods,
     url: url,
     body: missingPayload,
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
   });

});

When('User try to update an email {string}', (email) => {

  cy.readFile('cypress/fixtures/userPayload.json').then((data) => {
  let updatedData = data
    updatedData[0].email = email
  
   cy.request({
     method: 'PUT',
     url: url,
     body: updatedData,
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
   });
  })

})

When('Org Admin try to update user of diffrent organization', (email) => {

  payload[0].organizationUUID = '1c5d1f53-a72f-42aa-9b19-2c50117a9d7f'

   cy.request({
     method: 'PUT',
     url: url,
     body: payload,
     failOnStatusCode: false,
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded', // below is org admin header
       'Authorization': 'eyJraWQiOiJadGt6V3FzN0ttSHhYOGN1b1hmdTQ1SXVtRFJyZDJGRHNySjhFT1lLeGJBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3NmJhNzRjMS1hZThmLTQ1NGItYjllMi04ZjFkMGZiYmM0ZTUiLCJjb2duaXRvOmdyb3VwcyI6WyJvcmdBZG1pbiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV93UUJGekZyN2QiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIzZ2xxdHZtdDM2cTR0ZzFiNmJjNDNndGVuZyIsImV2ZW50X2lkIjoiZGJjZDQzNWUtN2VhMC00Yjc0LWE0YjEtOTcyY2E1NzAyZjZjIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiBvcGVuaWQiLCJhdXRoX3RpbWUiOjE3MjY3NDgyNjUsImV4cCI6MTcyNjc5MTQ2NSwiaWF0IjoxNzI2NzQ4MjY4LCJqdGkiOiJkMWFjNjU4YS01MGI5LTQzMGYtYmYzZi1kODIzYTI5NzhiNDciLCJ1c2VybmFtZSI6Ijc2YmE3NGMxLWFlOGYtNDU0Yi1iOWUyLThmMWQwZmJiYzRlNSJ9.vFZcSLtdbbTd1sModVd_HZxwJtNEdMa3ZQLoJGurLVz9q7DaIGr8-XmpknHOvHtORZQMoRcEtqva2ZQWiPfiAb8a3oYrwtLZ5iYMpCREheF3khy0uH86476spNRa4Wc8H5pAS4BD7CVPaVoWUaDZINsTmA34Qw5uMjUGeNhXE13DkyFOM_sAKzEb0brvaESyk2i4IOMv413Ua4cm5yQoa-QInCM_39QFfJejyFq3SnqdBEi5O7GWcM2aLnhXRVLvA2brs-Ts-Q1MSECSGTaht_jcEhHfQWKLy39BciX-wV3ufhwaM-73gtjWepaLsXFqciZaE8jg46q8UqB1K9ZaCA',
       'cache-control': 'no-cache',
       'Content-Type': 'application/json',
       'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
     }, 
   }).then((response) => {
    cy.wrap(response).as('apiResponse');
   });

})

When('Sends a PATCH request {string} with invalid authorities', (endpoint) => {

  cy.log(payload)
  updatedPayload = [ {
    email: payload[0].email,
    firstName: payload[0].firstName,
    lastName: payload[0].lastName,
    authorities: [
      "ROLE_ORG"
  ],
    organizationUUID: payload[0].organizationUUID, 
  }];

  cy.log(updatedPayload)
  
   cy.request({
     method: 'PATCH',
     url: url + endpoint,
     body: updatedPayload,
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
   });

});

When('User create user with Invalid Bearer tokken', () => {

  let invalidUUID = [ {
     email: "testi323@gmail.com",
     firstName: "Rayan131",
     lastName: "Ahmad121",
     address: "<p>ewqwe</p>",
     authorities: ["ROLE_USER"],
     organizationUUID: "08f75a64-12ef-4895-8616-03a387c23084",  // Ensure this UUID is correct
     phone: "",
     position: "",
     active: true
   }];
 
   cy.request({
     method: 'POST',
     url: url,
     body: invalidUUID,
     failOnStatusCode: false,
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
       'Authorization': 'ffJraWQiOiJadGt6V3FzN0ttSHhYOGN1b1hmdTQ1SXVtRFJyZDJGRHNySjhFT1lLeGJBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3Yzg2ZGJjYS04MTVmLTQ4MWUtOTM1Yi0zYzk1ZDI4ZTY0NDgiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbmlzdHJhdG9yIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX3dRQkZ6RnI3ZCIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6IjNnbHF0dm10MzZxNHRnMWI2YmM0M2d0ZW5nIiwiZXZlbnRfaWQiOiIxMzcwOGEzOC0yMjVkLTRlNmQtYTY3Zi1mZmRiYmU0ZDY0NWQiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCIsImF1dGhfdGltZSI6MTcyNjczNjU5NiwiZXhwIjoxNzI2Nzc5Nzk2LCJpYXQiOjE3MjY3MzY1OTksImp0aSI6Ijc3YzQ2MTI3LWM4YWItNDAwMS1iNTExLTdjOWJkYjYzMzM5ZSIsInVzZXJuYW1lIjoiN2M4NmRiY2EtODE1Zi00ODFlLTkzNWItM2M5NWQyOGU2NDQ4In0.MhHdfnWkDv2GBb00ilyuUFJHJcuDnhL33xp9KL3TIcXfHgxZon9kR_nvVjTM9I0tLpjOMICTGVi_W0y1yfknoE1Juf8JNhROUA93NfuUBB0dB7hM2Fa8tntsVDaYge1_V46Kt0LBLR0Sv9bVw6XYo2nTRDIHFUnrttw7agwx1J76jzkLwOdhs7nhfPSsrRI8lQeP9Ao1fVZtBqRqOdjP7IxLTMw82TLpfMOK1CS8rAcOMCOChkDI7pXaXtN3mrBvyYJdEOxjZeqPlMWtBP7McUu80vJG7Fig-OabT1EmCY6m8oRshNrX_Nu_RR3dx56KaQLMGlLDXv4IxoclsyiuIQ',
       'cache-control': 'no-cache',
       'Content-Type': 'application/json',
       'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
     }, 
   }).then((response) => {
     cy.wrap(response).as('apiResponse');
   });
 });

 When('the user create user without UUID', () => {

  let missingUUID = [ {
     email: "test$@@gmail.com",
     firstName: "Rayan131",
     lastName: "Ahmad121",
     address: "<p>ewqwe</p>",
     authorities: ["ROLE_USER"],
     //organizationUUID: "08f75a64-12ef-4895-8616-03a387c23084",  // Ensure this UUID is correct
     phone: "",
     position: "",
     active: true
   }];
 
   cy.request({
     method: 'POST',
     url: url,
     body: missingUUID,
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
   });
 });

When('the user sends a POST request to the API with the payload to create user with Invalid UUID', () => {

 let invalidUUID = [ {
    email: "testi323@gmail.com",
    firstName: "Rayan131",
    lastName: "Ahmad121",
    address: "<p>ewqwe</p>",
    authorities: ["ROLE_USER"],
    organizationUUID: "08f75a64-12ef-4895-8616-03a387c23084",  // Ensure this UUID is correct
    phone: "",
    position: "",
    active: true
  }];

  cy.request({
    method: 'POST',
    url: url,
    body: invalidUUID,
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
  });
});

When('Send reqest to add to user group {string}.', (endpoint) => {
  
  let orgAdminPayload = [ {
    email: "testing1@gmail.com",
    firstName: "Zaid",
    lastName: "Salman",
    authorities: ["ROLE_ORG_ADMIN"],
    organizationUUID: "3c78f78b-5348-40af-84fe-c9dafc618c44", 
  }];

  
   cy.request({
     method: 'PATCH',
     url: url + endpoint,
     body: orgAdminPayload,
     failOnStatusCode: false,
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded',
       'Authorization': 'eyJraWQiOiJadGt6V3FzN0ttSHhYOGN1b1hmdTQ1SXVtRFJyZDJGRHNySjhFT1lLeGJBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3NmJhNzRjMS1hZThmLTQ1NGItYjllMi04ZjFkMGZiYmM0ZTUiLCJjb2duaXRvOmdyb3VwcyI6WyJvcmdBZG1pbiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV93UUJGekZyN2QiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIzZ2xxdHZtdDM2cTR0ZzFiNmJjNDNndGVuZyIsImV2ZW50X2lkIjoiZGJjZDQzNWUtN2VhMC00Yjc0LWE0YjEtOTcyY2E1NzAyZjZjIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiBvcGVuaWQiLCJhdXRoX3RpbWUiOjE3MjY3NDgyNjUsImV4cCI6MTcyNjc5MTQ2NSwiaWF0IjoxNzI2NzQ4MjY4LCJqdGkiOiJkMWFjNjU4YS01MGI5LTQzMGYtYmYzZi1kODIzYTI5NzhiNDciLCJ1c2VybmFtZSI6Ijc2YmE3NGMxLWFlOGYtNDU0Yi1iOWUyLThmMWQwZmJiYzRlNSJ9.vFZcSLtdbbTd1sModVd_HZxwJtNEdMa3ZQLoJGurLVz9q7DaIGr8-XmpknHOvHtORZQMoRcEtqva2ZQWiPfiAb8a3oYrwtLZ5iYMpCREheF3khy0uH86476spNRa4Wc8H5pAS4BD7CVPaVoWUaDZINsTmA34Qw5uMjUGeNhXE13DkyFOM_sAKzEb0brvaESyk2i4IOMv413Ua4cm5yQoa-QInCM_39QFfJejyFq3SnqdBEi5O7GWcM2aLnhXRVLvA2brs-Ts-Q1MSECSGTaht_jcEhHfQWKLy39BciX-wV3ufhwaM-73gtjWepaLsXFqciZaE8jg46q8UqB1K9ZaCA',
       'cache-control': 'no-cache',
       'Content-Type': 'application/json',
       'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
     }, 
   }).then((response) => {
    cy.wrap(response).as('apiResponse');
   });

});




Then('Validate the message and code error message', (code) => {
  cy.get('@apiResponse').its('body').then((body)=>{
    expect(body.message).to.contain('contain between 1 and 200 characters')
    expect(body.code).to.be.eq('BAD_REQUEST')
  })
});

Then('The response message contain {string} and code {string}', (message, code) => {
  cy.get('@apiResponse').its('body').then((body)=>{
    expect(body.message).to.contain(message)
    expect(body.code).to.be.eq(code)
  })
});


Then('Validate the {string} code error message', (code) => {
  cy.get('@apiResponse').its('body').then((body)=>{
    expect(body.code).to.be.eq(code)
  })
});

Then('the API should return a {int} status code', (statusCode) => {
  cy.get('@apiResponse').then((response) => {
    expect(response.status).to.eq(statusCode);
  })
});

//--------------------------------18 Sep----------------------------------------------------------------------------//
Given('a valid payload with the following data to create a new User:', (dataTable) => {
  
  const randomFirstName = generateRandomString('FirstName_'); // Generates a random first name with a prefix
  const randomLastName = generateRandomString('LastName_');   // Generates a random last name with a prefix
  const randomEmail = `user_${Date.now()}@example.com`;   

  payload = [ {
    email: randomEmail,
    firstName: randomFirstName,
    lastName: randomLastName,
    address: "<p>ewqwe</p>",
    authorities: ["ROLE_USER"],
    organizationUUID: "902332d5-a140-4205-9201-1f41c13e796a",  // Ensure this UUID is correct
    phone: "5454",
    position: "TESTER ADMIN",
    active: true
  }];

  const jsonData = JSON.stringify(payload, null, 2); // Pretty-print the JSON with 2-space indentation
  cy.writeFile('cypress/fixtures/userPayload.json', jsonData)
});

When('the user sends a POST request to the API with the payload to create a user with org admin token', () => {

  cy.request({
    method: 'POST',
    url: url,
    body: payload,
    failOnStatusCode: false,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer eyJraWQiOiJadGt6V3FzN0ttSHhYOGN1b1hmdTQ1SXVtRFJyZDJGRHNySjhFT1lLeGJBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3NmJhNzRjMS1hZThmLTQ1NGItYjllMi04ZjFkMGZiYmM0ZTUiLCJjb2duaXRvOmdyb3VwcyI6WyJvcmdBZG1pbiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV93UUJGekZyN2QiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIzZ2xxdHZtdDM2cTR0ZzFiNmJjNDNndGVuZyIsImV2ZW50X2lkIjoiNDliNGM3OTYtMzRiYy00NzU0LTgzNzEtMDFiYzkyN2Y2MTFiIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiBvcGVuaWQiLCJhdXRoX3RpbWUiOjE3MjY2NzIwNTYsImV4cCI6MTcyNjcxNTI1NiwiaWF0IjoxNzI2NjcyMDU3LCJqdGkiOiJkMTczMTY0OC1kZWM3LTQ3MjgtOWI5MC00MDFmODIzNDg2NzgiLCJ1c2VybmFtZSI6Ijc2YmE3NGMxLWFlOGYtNDU0Yi1iOWUyLThmMWQwZmJiYzRlNSJ9.HjFPmS8z8GGe9pOTQjtmA4T1Y_SPLoTv4OrV1PWCb_qpKoI8yJCCrQybOiPYFjCLNtG49LIVW1qVwzrSIFf3ol-GY4ygTqBxSvPw6nk8RxYneG0bYns34VGEoPTgeGECaHY0KM4PYo9Wk2QykhEaZ_A6cTZmHrnR6g7Jslvig-yTktXZKYQfUaQwFThxu770hqiuYm1Ajd5aL2m3BvDFtTladLdzKoPKvtnD8dacw4KtafPZBJ2WiCDrgtljR_yTTDiTA4J-QtxoozqEiPK9Wg_J8S4JgYl6QJCJxuaEhHfusDhEb_WIwbJy4S1jYEsPJNOJ_hS0dXVP8jQ1ULmsfA',
      'cache-control': 'no-cache',
      'Content-Type': 'application/json',
      'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
    }, 
  }).then((response) => {
    cy.wrap(response).as('apiResponse');
  });
});


Then('the API should return a 401 status codes', () => {
  // Validate that the response status is 401 Unauthorized
  cy.get('@apiResponse').then((response) => {
    expect(response.status).to.eq(401);
  });
});


//---------------------------------------------------------------------------------------------------------------//



//Reset User Password
//Successfuly reset the password
Given('a valid API endpoint and a payload with user data', function () {
  // Define the payload for the request
  this.payload = [ {
    email: "bh4sfdemo@allsorter.com",
        firstName: "Adam138",
        lastName: "Sandler138",
        address: "",
        authorities: ["ROLE_USER"],
        organizationUUID: "3c78f78b-5348-40af-84fe-c9dafc618c44",
        organizationName: "AllSorter-SaleForce",
        phone: "N/A",
        position: "N/A",
        active: true
  }];
});

When('the user sends a PATCH request to reset their password', function () {
  cy.request({
    method: 'PATCH',
    url: 'https://api.dev.allsorter.com/member/users/reset-password',
    body: this.payload,
    failOnStatusCode: false,
    headers: {
     
       'Authorization': accessToken,
       'cache-control': 'no-cache',
       'Content-Type': 'application/json',
       'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
    }
  }).then((res) => {
    response = res;
  });
});

Then('the API should return a 200 status codes', function () {
  expect(response.status).to.eq(200);
});


Then('the response body should contain details of the user, indicating that the password reset was successful', function () {
  console.log(response.body);

  // Check the response body structure
  expect(response.body).to.have.property('successfulUsers');
  expect(response.body.successfulUsers).to.be.an('array').that.is.not.empty;

  // Validate the first user object in the array
  const user = response.body.successfulUsers[0];

  expect(user).to.have.property('email', 'bh4sfdemo@allsorter.com');
  expect(user).to.have.property('firstName', 'Adam138');
  expect(user).to.have.property('lastName', 'Sandler138');
  expect(user).to.have.property('active', true);
  expect(user).to.have.property('organizationName', 'AllSorter-SaleForce');
  expect(user).to.have.property('organizationUUID', '3c78f78b-5348-40af-84fe-c9dafc618c44');
  expect(user).to.have.property('phone', 'N/A');
  expect(user).to.have.property('position', 'N/A');
});



//---------------------------------------------------------------------------------------------------------------------------------//



//Scenario: Bearer token is missing
Given('a valid API endpoint and a payload with user data', function () {
  // Define the payload for the request
  this.payload = [ {
    email: "bh4sfdemo@allsorter.com",
        firstName: "Adam138",
        lastName: "Sandler138",
        address: "",
        authorities: ["ROLE_USER"],
        organizationUUID: "3c78f78b-5348-40af-84fe-c9dafc618c44",
        organizationName: "AllSorter-SaleForce",
        phone: "N/A",
        position: "N/A",
        active: true
  }];
});

Given('the Bearer token is not provided in the request header', function () {
  // No Bearer token is set
  this.token = null;
});

When('the user sends a PATCH request without a Bearer token', function () {
  cy.request({
    method: 'PATCH',
    url: 'https://api.dev.allsorter.com/member/users/reset-password',
    body: this.payload,
    failOnStatusCode: false,
    headers: {
     
       
       'cache-control': 'no-cache',
       'Content-Type': 'application/json',
       'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
    }
  }).then((res) => {
    response = res;
  });
});

Then('the API should return a 401 status codess', function () {
  expect(response.status).to.eq(401);
});

Then('the response body should contain an error message indicating that the Bearer token is missing or invalidd', function () {
  console.log(response.body);

  // Convert the response body to a string and search for the specific text
  const responseBody = JSON.stringify(response.body);
  // Adjust the error message as per the actual API response
  expect(response.body).to.have.property('error');
  expect(responseBody).to.include('Unauthorized');
  
});


//---------------------------------------------------------------------------------------------------------------------------------//
//Scenario: Org Admin cannot reset user password in other organization

Given('a valid API endpoint and a payload with user data', function () {
  // Define the payload directly in the step definition
  [ {
    email: "bh4sfdemo@allsorter.com",
        firstName: "Adam138",
        lastName: "Sandler138",
        address: "",
        authorities: ["ROLE_USER"],
        organizationUUID: "3c78f78b-5348-40af-84fe-c9dafc618c44",
        organizationName: "AllSorter-SaleForce",
        phone: "N/A",
        position: "N/A",
        active: true
  }];
});

And('a valid Bearer token for an Org Admin user who does not belong to the organization with UUID "08f75a64-12ef-4895-8616-03a387c23082"', function () {
  // Define the Bearer token for an Org Admin that does not belong to the target organization
  this.accessToken = 'Bearer eyJraWQiOiJadGt6V3FzN0ttSHhYOGN1b1hmdTQ1SXVtRFJyZDJGRHNySjhFT1lLeGJBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI3NmJhNzRjMS1hZThmLTQ1NGItYjllMi04ZjFkMGZiYmM0ZTUiLCJjb2duaXRvOmdyb3VwcyI6WyJvcmdBZG1pbiJdLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuZXUtd2VzdC0xLmFtYXpvbmF3cy5jb21cL2V1LXdlc3QtMV93UUJGekZyN2QiLCJ2ZXJzaW9uIjoyLCJjbGllbnRfaWQiOiIzZ2xxdHZtdDM2cTR0ZzFiNmJjNDNndGVuZyIsImV2ZW50X2lkIjoiNjEyZWUwN2MtMzYwMi00Njg1LTliODEtYmQ1NDgyODEzYjYyIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiBvcGVuaWQiLCJhdXRoX3RpbWUiOjE3MjY0ODk3MDUsImV4cCI6MTcyNjUzMjkwNSwiaWF0IjoxNzI2NDg5NzA2LCJqdGkiOiJmMjA3OWIyZC0zMDVhLTQ0NGItODU2NC1kODk3YWI1YjU1NmEiLCJ1c2VybmFtZSI6Ijc2YmE3NGMxLWFlOGYtNDU0Yi1iOWUyLThmMWQwZmJiYzRlNSJ9.fpWHdzRRvlFUyWP9IsVPnCxkw8TawlruYUS83eR0VXBX8svTnAAZXX0R5YgW-3Wf55nZln03SFKn7AL0C2PHrbkYmILdR0vvhbLQSxrx-LFky_kHl5u7LSKeUW4ZCjPcB5ge6nwUOmOBUObc8zGO4F_lGodkDriJEmP2l6_hfx-CkQeHMHH8eNsYE_07M35sa6I3y30DgbXsD5NBqoYmqUReS6fEGCOi2ebyRiHanm-7jEM_DSdzmZFaOOgBhfYdD0d7PtBdtVlrOJS7a9tBCRFGUAd-LtIoxxpK9_1g3IjSJXVX9pibzF1N-KeyHs_pcSwjTdQ5ytHjN2qlD4OHNA';
});

When('the Org Admin sends a PATCH request to reset the password for a user outside their organization', function () {
  cy.request({
    method: 'PATCH',
    url: 'https://api.dev.allsorter.com/member/users/reset-password',
    body: this.payload,
    failOnStatusCode: false,  // Prevent test from failing on non-2xx status
    headers: {
      'Authorization': this.accessToken,
      'Content-Type': 'application/json',
      'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
    }
  }).then((res) => {
    response = res;
  });
});

Then('the API should return a 401 status codess', function () {
  // Check for a 401 status code
  expect(response.status).to.eq(401);
});


//---------------------------------------------------------------------------------------------------------------------------------//
//OrgUUID is missing in payload

Given('a valid API endpoint and a payload with user data', function () {
  // Define the payload directly in the step definition
  
  payload = [ {
    email: "bh4sfdemo@allsorter.com",
        firstName: "Adam138",
        lastName: "Sandler138",
        address: "",
        authorities: ["ROLE_USER"],
        
        organizationName: "AllSorter-SaleForce",
        phone: "N/A",
        position: "N/A",
        active: true
  }];
});

And('a Bearer token is provided but the orgUUID is not present in the request', function () {
  // Define the Bearer token, but do not include the orgUUID header
  this.accessToken = accessToken;
});

When('the user sends a PATCH request without the orgUUID', function () {
  
  cy.request({
    method: 'PATCH',
    url: 'https://api.dev.allsorter.com/member/users/reset-password',
    body: payload,
    failOnStatusCode: false,  // Prevent the test from failing on a non-2xx status
    headers: {
      'Authorization': this.accessToken,
      'Content-Type': 'application/json',
     //UUID is missing in headers
      
    }
  }).then((res) => {
    response = res;
  });
});

Then('the API should return a 500 status codes', function () {
  // Check for the 400 status code
  expect(response.status).to.eq(500);
});

Then("the response body should contain an error message indicating that the orgUUID header is required but missing", function () {
  // Check if the response contains the expected error message about the missing orgUUID
  expect(response.body).to.have.property('message').and.to.contain("Required request header 'orgUUID' for method parameter type String is not present");
});


//----------------------------------------------------------------------------------------------------------------------------//
//Username is missing
//Username is missing
Given('a valid API endpoint and a payload with non-existent user data', function () {
  // Define the payload with a user that does not exist in the system
  this.payload = [ {
    email: "bh4sfdemo1234@allsorter.com",
        firstName: "Adam138",
        lastName: "Sandler138",
        address: "",
        authorities: ["ROLE_USER"],
        organizationUUID: "3c78f78b-5348-40af-84fe-c9dafc618c44",
        organizationName: "AllSorter-SaleForce",
        phone: "N/A",
        position: "N/A",
        active: true
  }];
});
 
And('a valid Bearer token and orgUUID header are provided', function () {
  // Define the valid Bearer token and orgUUID
  this.accessToken = accessToken;
  this.orgUUID = '08f75a64-12ef-4895-8616-03a387c23081';
});
 
When('the user sends a PATCH request to reset the password for a non-existent user', function () {
  cy.request({
    method: 'PATCH',
    url: 'https://api.dev.allsorter.com/member/users/reset-password',
    body: this.payload,
    failOnStatusCode: false,  // Handle non-2xx status codes
    headers: {
      'Authorization': this.accessToken,
      'Content-Type': 'application/json',
      'orguuid': '08f75a64-12ef-4895-8616-03a387c23081'
    }
  }).then((res) => {
    response = res;
  });
});
 
Then('the API should return a 404 status codes', function () {
  // Validate that the response has a 404 status code
  expect(response.status).to.eq(404);
});


Then("the response body should contain an error message indicating that the user with the specified username was not found", function () {
  // Validate that the response contains the error message about the user not being found
  expect(response.body).to.have.property('message').and.to.contain("not found");
});



Given('there is a valid payload with user data', function () {
  // Define the payload for the request
  this.payload1 = [ {
    email: "bh4sfdemo@allsorter.com",
        firstName: "Adam138",
        lastName: "Sandler138",
        address: "",
        authorities: ["ROLE_USER"],
        organizationUUID: "3c78f78b-5348-40af-84fe-c9dafc618c44",
        phone: "N/A",
        position: "N/A",
        active: true
  }];
});

Given('the invalid Bearer token is provided in the request header', function () {
  // No Bearer token is set
  this.token = 'Bearer RyJraWQiOiJadGt6V3FzN0ttSHhYOGN1b1hmdTQ1SXVtRFJyZDJGRHNySjhFT1lLeGJBPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlYmJkNTAzMS0zYzg4LTRkMzUtYmRlZS00YWQ5YjM3MmJhMDIiLCJjb2duaXRvOmdyb3VwcyI6WyJhZG1pbmlzdHJhdG9yIl0sImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX3dRQkZ6RnI3ZCIsInZlcnNpb24iOjIsImNsaWVudF9pZCI6IjNnbHF0dm10MzZxNHRnMWI2YmM0M2d0ZW5nIiwiZXZlbnRfaWQiOiJhM2Y5N2M2OC1jYjQ1LTQzM2ItYmY4MS1mYzExNGE4ZDk4MWEiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIG9wZW5pZCIsImF1dGhfdGltZSI6MTcyNjczOTE1MywiZXhwIjoxNzI2NzgyMzUzLCJpYXQiOjE3MjY3MzkxNTUsImp0aSI6IjVkNjhiM2M5LWJkNDQtNGM2MC04MmE2LTIxMTBkOWQzM2M4NSIsInVzZXJuYW1lIjoiZWJiZDUwMzEtM2M4OC00ZDM1LWJkZWUtNGFkOWIzNzJiYTAyIn0.5k_txqva29GaNxoy7xhEc71FBF-9W4CAJekA8qHhjo1ghsZ-1Ns_y8Wn3dFCkIcJ9pm-gxAhWYKtFnibg9sfUZqgCa1DEyjDEBzkJRNdxIcyyrWU1bw8NCHG647BC6brrOWqdqvT2EMkSijLcopP9Q7bvHBXEjd0i6cwYbqCwYuSnYsxm7ZqTRb7dxCZ5I1tXQKymhUWS_gcg65K7dBDVTltWPNjdDWkivjD0iAOdlzjtBVfHzGSCtcdpWYijWpQjEMTp_tMNSwrCzVxILWyWW0JvvFr4pqDwS8nUFc4LIFIrq2C_8RlbY26qr58GGySaZj5IcJjjM2VcbjIZSH45Q';
});

When('the user sends a PATCH request with a invalid Bearer token', function () {
  cy.log(this.payload1)
  cy.request({
    method: 'PUT',
    url: 'https://api.dev.allsorter.com/member/users',
    body: this.payload1,
    failOnStatusCode: false,
    headers: {
     
     
      'Authorization': this.token,
       'cache-control': 'no-cache',
       'Content-Type': 'application/json',
       'orguuid': '08f75a64-12ef-4895-8616-03a387c23082',
    }
  }).then((res) => {
    response = res;
  });
});

Then('the API should return the 401 status codes in response', function () {
  expect(response.status).to.eq(401);
});
