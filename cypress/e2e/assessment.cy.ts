describe("/assessments/create", () => {
  before(() => {
    cy.setupValidation("bob");
  });

  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("bob").as("bobTokens");
    cy.visit("/assessments/create");
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
    cy.get("#actorRadio").contains("PID Manager at Oxford Fertility");
  });

  it("Can go to step 2 and go back", () => {
    cy.get("#radio-0").click();
    cy.get(".btn-success").should("not.have.attr", "disabled");
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
    cy.get(".btn-success").should("not.have.attr", "disabled");
    cy.get("#next-button").click();
    cy.get('#accordion_general button[aria-expanded="true"]').should("exist");
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
    const T7 =
      "Can you provide evidence that the relation between PIDs and entities, as maintained by the PID manager, conforms to the Authority requirements.";
    const T35 =
      "Given the percentage f of resolved PIDs that result in a viable entity, compared to a community expectation p. Please provide values for f and p.";
    const subjectId = "bob_test_subject_id";
    const subjectName = "bob_test_subject_name";
    const subjectType = "bob_test_subject_type";
    cy.get("#radio-0").click();
    cy.get(".btn-success").should("not.have.attr", "disabled");
    cy.get("#assessment-wizard-tab-step-2").click();
    cy.get("#input-info-name").type("bob_test_assessment");
    cy.get("#accordion_subject").click();
    cy.get("#input-info-subject-id").type(subjectId);
    cy.get("#input-info-subject-name").type(subjectName);
    cy.get("#input-info-subject-type").type(subjectType);
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C5 .badge:visible")
      .contains("PASS")
      .should("exist");
    cy.get("#left-tabs-tab-C6").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C6 .badge:visible")
      .contains("PASS")
      .should("exist");
    cy.get("#left-tabs-tab-C7").click();

    cy.get("form:visible")
      .contains(T7)
      .closest("form")
      .within(() => {
        cy.get("#test-check-yes").click();
      });

    cy.get("form:visible")
      .contains(T35)
      .closest("form")
      .within(() => {
        cy.get("#input-value-control").type("70");
        cy.get("#input-value-community").type("70");
      });
    cy.get("#left-tabs-tabpane-C7 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C11").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C11 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C14").click();
    cy.get("form:visible").within(() => {
      cy.get("#input-value-control").type("70");
      cy.get("#input-value-community").type("70");
    });
    cy.get("#left-tabs-tabpane-C14 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C34").click();
    cy.get("form:visible").within(() => {
      cy.get("#input-value-control").type("70");
      cy.get("#input-value-community").type("70");
    });
    cy.get("#left-tabs-tabpane-C34 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C16").click();
    cy.get("form:visible").within(() => {
      cy.get("#input-value-control").type("70");
      cy.get("#input-value-community").type("70");
    });
    cy.get("#left-tabs-tabpane-C16 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C19").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C19 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C22").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C22 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C29").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C29 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C28").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C28 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get("#left-tabs-tab-C35").click();
    cy.get("form:visible").within(() => {
      cy.get("#input-value-control").type("70");
      cy.get("#input-value-community").type("70");
    });
    cy.get("#left-tabs-tabpane-C35 .badge:visible")
      .contains("PASS")
      .should("exist");

    cy.get(".btn-success").click();
    cy.url().should("contain", "/assessments");
    cy.contains("Assessment succesfully created.").should("be.visible");
  });
});
