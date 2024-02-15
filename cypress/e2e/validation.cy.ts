/// <reference types="cypress"/>

describe("/validations/request", () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("identified").as("identifiedTokens");
    cy.visit("/validations/request");
  });

  it("creates a validation", () => {
    cy.intercept("POST", "http://localhost:8080/v1/validations", {
      fixture: "validation_review.json",
    }).as("getValidations");
    cy.get(".select__input").click().type("Oxford");
    cy.contains(".select__option", "University of Oxford").click();
    cy.get("#actor_id").select(1);
    cy.get("#organisation_role").type("Team Manager");
    cy.get("#actor_id")
      .should("have.value", "1")
      .contains("PID Standards Body");
    cy.get("#create_validation").click();
    cy.wait(["@getValidations"]);
    cy.url().should("contain", "/validations");
  });

  it("requires an organization role", () => {
    cy.get("#create_validation").click();
    cy.get("#organisation_role").should("have.class", "is-invalid");
  });
});
