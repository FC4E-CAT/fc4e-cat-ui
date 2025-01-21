describe("/assessments/create", () => {
  before(() => {
    cy.setupValidation("identified");
  });

  beforeEach(() => {
    cy.kcLogout().then(() => {
      cy.kcLogin("identified")
        .as("identifiedTokens")
        .then(() => {
          cy.visit("/assessments/create");
        });
    });
  });

  it("greets with create assessment", () => {
    cy.contains(".cat-view-heading", "create assessment");
    cy.get("#assessment-wizard-tab-step-1").should(
      "have.attr",
      "aria-selected",
      "true",
    );
  });

  it("brings me back to assess", () => {
    cy.get(".btn-secondary").click();
    cy.url().should("contain", "/assess");
  });
  it("has the correct actor option", () => {
    cy.get("#actorRadio").contains(
      "PID Scheme (Component) at Oxford Fertility - EOSC PID Policy",
    );
  });

  it("Can go to step 2 and go back", () => {
    cy.get("#radio-0").click();
    cy.get("#create_assessment_button").should("not.have.attr", "disabled");
    cy.get("#next-button").click();
    cy.get("#assessment-wizard-tab-step-2").should(
      "have.attr",
      "aria-selected",
      "true",
    );
    cy.get("#prev-button").click();
    cy.get("#assessment-wizard-tab-step-1").should(
      "have.attr",
      "aria-selected",
      "true",
    );
  });
  it("makes the submitter fields readonly", () => {
    cy.get("#radio-0").click();
    cy.get("#create_assessment_button").should("not.have.attr", "disabled");
    cy.get("#next-button").click();
    cy.get("#accordion_general button").should("exist");
    cy.get("#accordion_submitter").click();
    cy.get('#accordion_submitter button[aria-expanded="true"]').should("exist");
    cy.get("#input-submitter-fname").should(
      "have.attr",
      "readonly",
      "readonly",
    );
    cy.get("#input-submitter-affiliation").should(
      "have.attr",
      "readonly",
      "readonly",
    );
    cy.get("#input-submitter-lname").should(
      "have.attr",
      "readonly",
      "readonly",
    );
    cy.get("#input-submitter-orcid").should(
      "have.attr",
      "readonly",
      "readonly",
    );
  });

  it("create an assessment", () => {
    const subjectId = "identified_test_subject_id";
    const subjectName = "identified_test_subject_name";
    const subjectType = "identified_test_subject_type";
    cy.get("#radio-0").click();
    cy.get("#create_assessment_button").should("not.have.attr", "disabled");
    cy.get("#assessment-wizard-tab-step-2").click();
    cy.get(
      "#accordion_general > .accordion-header > .accordion-button",
    ).click();
    cy.get("#input-info-name").type("identified_test_assessment");
    cy.get("#accordion_subject").click();
    cy.get("#input-info-subject-id").type(subjectId);
    cy.get("#input-info-subject-name").type(subjectName);
    cy.get("#input-info-subject-type").type(subjectType);
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tab-P10C28").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#create_assessment_button").click();
    cy.url().should("contain", "/assessments");
    cy.contains("Assessment succesfully created.").should("be.visible");
  });
});

describe("/assessments", () => {
  beforeEach(() => {
    cy.kcLogout().then(() => {
      cy.kcLogin("identified")
        .as("identifiedTokens")
        .then(() => {
          cy.visit("/assessments");
        });
    });
  });

  it("should be able to filter on subject type and name", () => {
    // Test subject type filtering
    cy.get("#subject-type-select").select("identified_test_subject_type");
    cy.get("#subject-type-select")
      .find(":selected")
      .should("have.text", "identified_test_subject_type");
    cy.get("table").find("tbody").find("tr").should("exist");
    cy.get("#clear_filter_button").click();
    cy.get("#subject-type-select")
      .find(":selected")
      .should("have.text", "Select Subject Type");

    // Test subject name filtering
    cy.get("#subject-name-select").select("identified_test_subject_name");
    cy.get("#subject-name-select")
      .find(":selected")
      .should("have.text", "identified_test_subject_name");
    cy.get("table").find("tbody").find("tr").should("exist");
    cy.get("#clear_filter_button").click();
    cy.get("#subject-name-select")
      .find(":selected")
      .should("have.text", "Select Subject Name");
  });

  it("makes no changes to assessment when editing and not saving", () => {
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find('[id^="edit-button-"]')
      .click();
    cy.get("#actorRadio").contains(
      "PID Scheme (Component) at Oxford Fertility - EOSC PID Policy",
    );
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-no").click();
    });
    cy.contains("Close").click();
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find('[id^="edit-button-"]')
      .click();
    cy.get("#actorRadio").contains(
      "PID Scheme (Component) at Oxford Fertility - EOSC PID Policy",
    );
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").should("be.checked");
    });
  });

  it("edits an assessment", () => {
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find('[id^="edit-button-"]')
      .click();
    cy.get("#actorRadio").contains(
      "PID Scheme (Component) at Oxford Fertility - EOSC PID Policy",
    );
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-no").click();
    });
    cy.get("#submit_assessment_button").click();
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find('[id^="edit-button-"]')
      .click();
    cy.get("#actorRadio").contains(
      "PID Scheme (Component) at Oxford Fertility - EOSC PID Policy",
    );
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-no").should("be.checked");
    });
  });

  it("deletes an assessment", () => {
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find('[id^="delete-button-"]')
      .click();
    cy.get("#contained-modal-title-vcenter").contains("Delete Assessment");
    cy.get(".btn-danger").click();
    cy.contains("Assessment succesfully deleted.").should("be.visible");
  });
});
