/// <reference types="cypress"/>

describe("User Login Tests", () => {
  beforeEach(() => {
    // Go to the main site.
    cy.visit("http://localhost:3000");
    // Find the login button by its ID attribute.
    cy.get("#login-button").click();

    // Check redirect to localhost:58080 for login.
    cy.url().should("include", "localhost:58080");

    // Login to the system
    cy.get("input#username").type("bob");
    cy.get("input#password").type("bob");
    cy.get("input#kc-login").click();
  });

  // Define your individual test cases within the suite.
  it("Login and check user profile", () => {
    // Check if profile information is correct.
    cy.get("#user-id").should("contain", "bob_voperson_id");
    cy.get("#identified").should("contain", "Identified");
  });

  it("Step 2: Click on the Login button", () => {
    // Click profile update button.
    cy.get("#profile-update-button").click();

    // Check if we are routed to the correct page.
    cy.url().should("include", "profile/update");

    // Input profile update information.
    cy.get("#inputName")
      .clear()
      .then(() => cy.get("#inputName").type("Bob"));
    cy.get("#inputSurname")
      .clear()
      .then(() => cy.get("#inputSurname").type("Ross"));
    cy.get("#inputEmail")
      .clear()
      .then(() => cy.get("#inputEmail").type("bob.ross@example.com"));
    cy.get("#inputOrcidId")
      .clear()
      .then(() => cy.get("#inputOrcidId").type("0000-0002-0255-5101"));

    // Click submit button.
    cy.get("#submit-button").click();

    // Check that we are routed to the correct page.
    cy.url().should("include", "profile");

    // Check that the personal details have been updated.
    cy.get("#name").should("contain", "Bob");
    cy.get("#surname").should("contain", "Ross");
    cy.get("#email").should("contain", "bob.ross@example.com");
    cy.get("#orcid").should("contain", "0000-0002-0255-5101");
  });
});
