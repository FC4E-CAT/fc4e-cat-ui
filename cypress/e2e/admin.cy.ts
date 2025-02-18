/// <reference types="cypress"/>
describe("admin", () => {
  beforeEach(() => {
    cy.kcLogout().then(() => {
      cy.kcLogin("admin")
        .as("adminTokens")
        .then(() => {
          cy.visit("/admin/validations");
        });
    });
  });
  it("accept a validation request", () => {
    cy.intercept(
      "GET",
      "http://127.0.0.1:8080/v1/admin/validations?size=20&page=1",
      {
        fixture: "validations/validations.json",
      },
    ).as("getValidations");
    cy.intercept("GET", "http://127.0.0.1:8080/v1/admin/validations/1", {
      fixture: "validations/validation.json",
    });
    cy.get("table").contains("Oxford Fertility");
    cy.get('[href="/admin/validations/1/approve#alert-spot"]').click();
    cy.get(".btn-success").click();
    cy.intercept(
      "PUT",
      "http://127.0.0.1:8080/v1/admin/validations/1/update-status",
      {
        fixture: "validations/validation_approved.json",
      },
    ).as("updateStatus");
    cy.intercept(
      "http://localhost:8080/v1/admin/validations?size=10&page=1&sortby=asc",
      {
        fixture: "validations/validations_approved.json",
      },
    ).as("validationsApproved");
    cy.contains("Validation Request Approved.");
  });

  it("declines a validation request", () => {
    cy.intercept(
      "GET",
      "http://127.0.0.1:8080/v1/admin/validations?size=20&page=1",
      {
        fixture: "validations/validations.json",
      },
    ).as("getValidations");
    cy.intercept("GET", "http://127.0.0.1:8080/v1/admin/validations/1", {
      fixture: "validations/validation.json",
    });
    // Click the approve icon for the validation.
    cy.get("table").contains("Oxford Fertility");
    cy.get('[href="/admin/validations/1/reject/#alert-spot"]').click();
    cy.get("#input-share-user").type("Rejected");
    cy.get(".btn-danger").click();
    cy.intercept(
      "PUT",
      "http://127.0.0.1:8080/v1/admin/validations/1/update-status",
      { fixture: "validations/validations_rejected.json" },
    );
    cy.contains("Validation Request Rejected.");
  });
});
