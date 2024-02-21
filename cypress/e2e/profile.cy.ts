/// <reference types="cypress"/>
describe("/profile", () => {
  before(() => {
    cy.setupValidation("identified");
  });

  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("identified").as("identifiedTokens");
    cy.visit("/profile");
  });

  it("checks an identified user profile information", () => {
    // Check if profile information is correct.
    cy.intercept("GET", "http://localhost:8080/v1/users/profile", {
      fixture: "profile_empty.json",
    });
    cy.get("#user-id").should("contain", "identified_ui_voperson_id");
    cy.get("#identified").should("contain", "Identified");
  });

  it("does not allow validations without updating details", () => {
    cy.intercept("GET", "http://localhost:8080/v1/users/profile", {
      fixture: "profile_empty.json",
    });

    cy.get("#validation-alert-warning").should(
      "contain",
      "You should update your personal details in order to be able to create validation requests",
    );
  });

  it("does not show assessments/subjects without validation", () => {
    cy.intercept("GET", "http://localhost:8080/v1/users/profile", {
      fixture: "profile_updated.json",
    });
    cy.get("#assessments_section").should("have.class", "disabled");
    cy.get("#subjects_section").should("have.class", "disabled");
  });

  it("links to validations", () => {
    cy.get("#view_validations_button").should(
      "have.attr",
      "href",
      "/validations",
    );
    cy.get("#create_validation_button").should(
      "have.attr",
      "href",
      "/validations/request",
    );
  });

  it("links to assessments", () => {
    cy.get("#view_assessments_button").should(
      "have.attr",
      "href",
      "/assessments",
    );
    cy.get("#create_assessment_button").should(
      "have.attr",
      "href",
      "/assessments/create",
    );
  });

  it("links to subjects", () => {
    cy.get("#view_subjects_button").should("have.attr", "href", "/subjects");
    cy.get("#create_subject_button").should(
      "have.attr",
      "href",
      "/subjects?create",
    );
  });
});

describe("/profile/update", () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("identified").as("identifiedTokens");
    cy.visit("/profile/update");
  });

  it("requires the required fields to be filled out", () => {
    cy.get("#inputName").clear();
    cy.get("#inputSurname").clear();
    cy.get("#inputEmail").clear();
    cy.get("#inputOrcidId").clear();
    cy.get("#submit-button").click();
    // Check if the input element has the class "is-invalid", indicating a red outline
    cy.get("#inputName").should("have.class", "is-invalid");
    cy.get("#inputSurname").should("have.class", "is-invalid");
    cy.get("#inputEmail").should("have.class", "is-invalid");

    cy.get(".invalid-feedback").each(($element) => {
      cy.wrap($element).should("contain.text", "is required");
    });
  });

  it("requires the name to be longer than 3 characters", () => {
    cy.get("#inputName").clear().type("UI");

    cy.get("#submit-button").click();
    cy.get(".invalid-feedback").should("contain", "Minimum length is 3");
  });

  it("requires a valid email address", () => {
    cy.get("#inputEmail").clear().type("test");
    cy.get("#submit-button").click();
    cy.get("#inputEmail").then(($input) => {
      expect($input[0].validationMessage).to.contain("Please include an");
    });

    cy.get("#inputEmail").clear().type("test@");
    cy.get("#submit-button").click();
    cy.get("#inputEmail").then(($input) => {
      expect($input[0].validationMessage).to.contain("Please enter a part");
    });

    cy.get("#inputEmail").clear().type("test@test");
    cy.get("#submit-button").click();
    cy.get("#inputEmail").should("have.class", "is-invalid");
  });

  it("Does not require an ORCID id", () => {
    cy.get("#inputName").clear().type("Identified");
    cy.get("#inputSurname").clear().type("Test");
    cy.get("#inputEmail").clear().type("identified@example.com");
    cy.get("#inputOrcidId").clear();
    cy.get("#submit-button").click();

    cy.url().should("match", /\/profile$/);
  });

  it("updates the personal details", () => {
    cy.get("#inputName").clear().type("Identified");
    cy.get("#inputSurname").clear().type("Test");
    cy.get("#inputEmail").clear().type("identified@example.com");
    cy.get("#inputOrcidId").clear().type("0000-0002-0255-5101");

    cy.get("#submit-button").click();

    cy.url().should("match", /\/profile$/);

    cy.get("#name").should("contain", "Identified");
    cy.get("#surname").should("contain", "Test");
    cy.get("#email").should("contain", "identified@example.com");
    cy.get("#orcid").should("contain", "0000-0002-0255-5101");
  });
});
