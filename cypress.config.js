const { defineConfig } = require("cypress");
const cucumber = require('cypress-cucumber-preprocessor').default

module.exports = defineConfig({
  e2e: {
    env: {
      AWS_REGION: 'us-east-1',
      AWS_ACCESS_KEY_ID: '',
      AWS_SECRET_ACCESS_KEY: '',
      USER_POOL_ID: 'your-user-pool-id',
      CLIENT_ID: 'your-client-id',
      baseUrl: 'review Enviroment',
      Standard_User: 'cypress/fixtures/Standard_User.json',
      Org_Admin: 'cypress/fixtures/Org_Admin.json',
      Org_Manager: 'cypress/fixtures/Org_Manager.json',
      Supper_User: 'cypress/fixtures/Supper_User.json',
      Super_Admin_Test: 'cypress/fixtures/Super_Admin_Test.json',
      ID_Token: 'cypress/fixtures/ID_Token.json'

    },
    specPattern: "**/*.{feature,features}",
    setupNodeEvents(on, config) {
      on('file:preprocessor', cucumber())
      // implement node event listeners here
    },
  },
});

