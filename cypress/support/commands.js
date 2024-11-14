// cypress/support/commands.js
import 'cypress-file-upload';
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
// cypress/support/commands.js
const AWS = require('aws-sdk');


AWS.config.update({
  accessKeyId: Cypress.env('AWS_ACCESS_KEY_ID'),
  secretAccessKey: Cypress.env('AWS_SECRET_ACCESS_KEY'),
  region: 'eu-west-1'
});

// User pool configuration
const poolData = {
  UserPoolId: Cypress.env('USER_POOL_ID'), // Your user pool id
  ClientId: Cypress.env('CLIENT_ID'), // Your client id
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

Cypress.Commands.add('loginWithCognito', (username, password) => {
  const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: username,
    Password: password,
  });

  const userData = {
    Username: username,
    Pool: userPool,
  };

  const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        const { accessToken, idToken, refreshToken } = result;

        // Store tokens in localStorage or cookies
        window.localStorage.setItem('access_token', accessToken.getJwtToken());
        window.localStorage.setItem('id_token', idToken.getJwtToken());
        window.localStorage.setItem('refresh_token', refreshToken.getToken());

        resolve({
          accessToken: accessToken.getJwtToken(),
          idToken: idToken.getJwtToken(),
          refreshToken: refreshToken.getToken(),
        });
      },
      onFailure: (err) => {
        reject(new Error('Authentication failed: ' + err.message));
      },
    });
  });
});



const cognito = new AWS.CognitoIdentityServiceProvider({
  region: 'eu-west-1'
});

Cypress.Commands.add('forceChangePassword', (username, tempPassword, newPassword) => {

  //cy.log(poolData.UserPoolId)
  // Step 1: Initiate authentication with ADMIN_NO_SRP_AUTH
  const authParams = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    UserPoolId: poolData.UserPoolId,
    ClientId: poolData.ClientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: tempPassword
    }
  };

  return cognito.adminInitiateAuth(authParams).promise()
    .then(response => {
      if (response.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
        // Step 2: Respond to the NEW_PASSWORD_REQUIRED challenge
        const challengeParams = {
          ChallengeName: 'NEW_PASSWORD_REQUIRED',
          ClientId: poolData.ClientId,
          UserPoolId: poolData.UserPoolId,
          ChallengeResponses: {
            USERNAME: username,
            NEW_PASSWORD: newPassword
          },
          Session: response.Session // Use the session from the initial response
        };

        return cognito.adminRespondToAuthChallenge(challengeParams).promise();
      } else {
        throw new Error('Unexpected challenge type or user not in FORCE_CHANGE_PASSWORD state');
      }
    })
    .then(finalResponse => {
      // Ensure the user is now in CONFIRMED state
      expect(finalResponse).to.have.property('AuthenticationResult');
      expect(finalResponse.AuthenticationResult).to.have.property('AccessToken');
      
      // Optionally return tokens if needed
      return finalResponse.AuthenticationResult;
    });
});


Cypress.Commands.add('createCognitoUserWithGroup', (username, email, tempPassword, groupName, region) => {
  cy.log(region)
  AWS.config.update({
    region: region,
    credentials: new AWS.Credentials({
      accessKeyId: Cypress.env('AWS_ACCESS_KEY_ID'),
      secretAccessKey: Cypress.env('AWS_SECRET_ACCESS_KEY')
    })
  });

  const cognito = new AWS.CognitoIdentityServiceProvider();

  const createUser = () => {
    const params = {
      UserPoolId: poolData.UserPoolId,
      Username: username,
      TemporaryPassword: tempPassword,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: 'johnY' },
        { Name: 'family_name', Value: 'jamesQW' }

      ]
    };

    

    return cognito.adminCreateUser(params).promise(); // Use .promise() to work with promises directly
  };

  const addUserToGroup = () => {
    const params = {
      GroupName: groupName,
      UserPoolId: poolData.UserPoolId,
      Username: username
    };

    return cognito.adminAddUserToGroup(params).promise();
  };

  return cy.wrap(
    createUser()
      .then(() => addUserToGroup())
      .then(() => `User ${username} added to group ${groupName}`)
  );
});
