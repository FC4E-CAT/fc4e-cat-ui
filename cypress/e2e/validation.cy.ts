/// <reference types="cypress"/>

describe("/validations/request", () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("identified").as("identifiedTokens");
    cy.visit("/validations/request");
  });

  it("creates a validation", () => {
    cy.intercept("POST", "http://127.0.0.1:8080/v1/validations", {
      fixture: "validations/validation_review.json",
    }).as("getValidations");
    cy.get(".select__input").click().type("Oxford");
    cy.contains(".select__option", "University of Oxford").click();
    cy.get("#registry_actor_id").select(1);
    cy.get("#organisation_role").type("Team Manager");
    cy.get("#registry_actor_id")
      .should("have.value", "pid_graph:0E00C332")
      .contains("PID Scheme (Component)");
    cy.get("#create_validation").click();
    cy.wait(["@getValidations"]);
    cy.url().should("contain", "/validations");
    cy.contains("Validation request succesfully submitted.").should(
      "be.visible",
    );
  });

  it("creates a validation with a custom organisation", () => {
    cy.intercept("POST", "http://127.0.0.1:8080/v1/validations", {
      fixture: "validations/validation_review.json",
    }).as("getValidations");
    cy.get("#organisation_source").select("Custom");
    cy.get("#organisation_name").type("Test Organisation");
    cy.get("#organisation_website").type("www.example.com");
    cy.get("#registry_actor_id").select(1);
    cy.get("#organisation_role").type("Team Manager");
    cy.get("#registry_actor_id")
      .should("have.value", "pid_graph:0E00C332")
      .contains("PID Scheme (Component)");
    cy.get("#create_validation").click();
    cy.wait(["@getValidations"]);
    cy.url().should("contain", "/validations");
    cy.contains("Validation request succesfully submitted.").should(
      "be.visible",
    );
  });

  it("requires an organization role", () => {
    cy.get("#create_validation").click();
    cy.get("#organisation_role").should("have.class", "is-invalid");
  });
});
