describe("/subjects", () => {
  const backendURL = Cypress.env("backend_url");
  before(() => {
    cy.setupValidation("identified");
  });
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("identified");
    cy.visit("/subjects");
    cy.intercept("GET", `${backendURL}/v1/subjects?size=10&page=1&sortby=asc`, {
      fixture: "subjects/subjects",
    }).as("getSubjects");
  });
  it("deletes a subject", () => {
    cy.intercept("GET", `${backendURL}/v1/subjects/9`, {
      fixture: "subjects/subject",
    }).as("getSubject");
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find("#delete-button-9")
      .click();
    cy.get(".modal-header")
      .should("have.class", "bg-danger text-white")
      .contains(".modal-title", "Delete subject");
    cy.intercept("DELETE", "**/v1/subjects/**", {
      fixture: "subjects/subject_deleted.json",
      statusCode: 200,
    });
    cy.get(".btn-danger").click();
    cy.contains("Subject succesfully deleted.").should("be.visible");
  });
  it("edits a subject", () => {
    cy.intercept("GET", `${backendURL}/v1/subjects/9`, {
      fixture: "subjects/subject",
    }).as("getSubject");
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find("#edit-button-9")
      .click();
    cy.get(".modal-header").contains("Edit subject");
    cy.intercept("PATCH", "**/v1/subjects/**", {
      fixture: "subjects/subject.json",
      statusCode: 200,
    });
    cy.get(".btn-success").click();
    cy.contains("Subject succesfully updated.").should("be.visible");
  });
});

describe("/subjects?create", () => {
  const backendURL = Cypress.env("backend_url");
  before(() => {
    cy.setupValidation("identified");
  });
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("identified");
    cy.visit("/subjects?create");
  });

  it("greets with create new subject", () => {
    cy.get("#contained-modal-title-vcenter").contains("Create new subject");
  });

  it("closes the modal", () => {
    cy.get(".modal-content").should("be.visible");
    cy.get("#modal-cancel-button").click();
    cy.get(".modal-content").should("not.exist");
  });

  it("creates a subject", () => {
    cy.intercept("POST", `${backendURL}/v1/subjects`, {
      fixture: "subjects/subject",
    }).as("postSubject");
    cy.get("#input-info-subject-id").type("subject_test_id");
    cy.get("#input-info-subject-name").type("subject_test_name");
    cy.get("#input-info-subject-type").type("subject_test_type");
    cy.get(".btn-success").click();
    cy.wait("@postSubject");
    cy.contains("Subject succesfully created.").should("be.visible");
  });
  it("requires a subject id", () => {
    cy.get(".btn-success").click();
    cy.get(".modal-content").should("be.visible");
    cy.contains("Error during subject creation.").should("be.visible");
  });
  it("requires a subject name", () => {
    cy.get("#input-info-subject-id").type("subject_test_id{enter}");
    cy.get(".btn-success").click();
    cy.get(".modal-content").should("be.visible");
    cy.contains("Error during subject creation.").should("be.visible");
  });
  it("requires a subject type", () => {
    cy.get("#input-info-subject-id").type("subject_test_id");
    cy.get("#input-info-subject-name").type("subject_test_name{enter}");
    cy.get(".btn-success").click();
    cy.get(".modal-content").should("be.visible");
    cy.contains("Error during subject creation.").should("be.visible");
  });
});
