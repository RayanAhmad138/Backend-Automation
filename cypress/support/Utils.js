
export function storeToken(userType, token) {
    cy.writeFile(Cypress.env(userType), {Token: token});
  }

  export function getToken(userType) {
    return cy.readFile(`cypress/fixtures/${userType}.json`);
  }