/// <reference types="cypress"/>
describe("admin", () => {
  const backendURL = Cypress.env("backend_url");
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("admin").as("admin");
    cy.visit("/profile");
  });

  it("accept a validation request", () => {
    cy.intercept(
      "GET",
      `${backendURL}/v1/admin/validations?size=10&page=1&sortby=asc`,
      {
        fixture: "validations/validations.json",
      },
    ).as("getValidations");
    cy.intercept("GET", `${backendURL}/v1/admin/validations/1`, {
      fixture: "validations/validation.json",
    });
    // Navigate to validations list for admins
    cy.get("#admin_nav").click();
    cy.get("#admin_validation").contains("Validations").click();
    cy.wait(["@getValidations"]);
    cy.url().should("include", "/validations");

    // Click the approve icon for the validation.
    cy.get("table").contains("Oxford Fertility");
    cy.get(".cat-action-approve-link").click();
    // Click the approve button on the validation's page.
    cy.get(".btn-success").click();
    cy.intercept("PUT", `${backendURL}/v1/admin/validations/1/update-status`, {
      fixture: "validations/validation_approved.json",
    }).as("updateStatus");
    cy.intercept(
      `${backendURL}/v1/admin/validations?size=10&page=1&sortby=asc`,
      {
        fixture: "validations/validations_approved.json",
      },
    ).as("validationsApproved");
    cy.contains("Validation successfully approved.");
    cy.wait(["@validationsApproved"]);
    cy.contains("APPROVED");
  });

  it("declines a validation request", () => {
    cy.intercept(
      {
        method: "GET",
        url: `${backendURL}/v1/admin/validations?size=10&page=1&sortby=asc`,
      },
      (req) => {
        if (req.alias === "rejectedValidations") {
          req.reply({ fixture: "validations/validations_rejected.json" });
        } else {
          req.reply({ fixture: "validations/validations.json" });
        }
      },
    ).as("getValidations");
    // Navigate to validations list for admins
    cy.get("#admin_nav").click();
    cy.get("#admin_validation").contains("Validations").click();
    cy.wait(["@getValidations"]);
    cy.url().should("include", "/validations");

    // Click the approve icon for the validation.
    cy.get("table").contains("Oxford Fertility");
    cy.get(".cat-action-reject-link").click();
    // Click the approve button on the validation's page.
    cy.get(".btn-danger").click();
    cy.intercept("PUT", `${backendURL}/v1/admin/validations/1/update-status`, {
      fixture: "validations/validations_rejected.json",
    });

    cy.contains("Validation successfully rejected.");
    cy.url().should("include", "/validations");
  });
});
