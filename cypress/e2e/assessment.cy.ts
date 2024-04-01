describe("/assessments/create", () => {
  before(() => {
    cy.setupValidation("identified");
  });

  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("identified").as("identifiedTokens");
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
    const subjectId = "identified_test_subject_id";
    const subjectName = "identified_test_subject_name";
    const subjectType = "identified_test_subject_type";
    cy.get("#radio-0").click();
    cy.get("#create_assessment_button").should("not.have.attr", "disabled");
    cy.get("#assessment-wizard-tab-step-2").click();
    cy.get("#input-info-name").type("identified_test_assessment");
    cy.get("#accordion_subject").click();
    cy.get("#input-info-subject-id").type(subjectId);
    cy.get("#input-info-subject-name").type(subjectName);
    cy.get("#input-info-subject-type").type(subjectType);
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C5").contains("PASS").should("exist");
    cy.get("#left-tabs-tab-C6").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C6").contains("PASS").should("exist");
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
    cy.get("#left-tabs-tabpane-C7").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C11").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C11").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C14").click();
    cy.get("form:visible").within(() => {
      cy.get("#input-value-control").type("70");
      cy.get("#input-value-community").type("70");
    });
    cy.get("#left-tabs-tabpane-C14").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C34").click();
    cy.get("form:visible").within(() => {
      cy.get("#input-value-control").type("70");
      cy.get("#input-value-community").type("70");
    });
    cy.get("#left-tabs-tabpane-C34").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C16").click();
    cy.get("form:visible").within(() => {
      cy.get("#input-value-control").type("70");
      cy.get("#input-value-community").type("70");
    });
    cy.get("#left-tabs-tabpane-C16").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C19").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C19").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C22").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C22").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C29").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C29").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C28").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-yes").click();
    });
    cy.get("#left-tabs-tabpane-C28").contains("PASS").should("exist");

    cy.get("#left-tabs-tab-C35").click();
    cy.get("form:visible").within(() => {
      cy.get("#input-value-control").type("70");
      cy.get("#input-value-community").type("70");
    });
    cy.get("#left-tabs-tabpane-C35").contains("PASS").should("exist");

    cy.get("#create_assessment_button").click();
    cy.url().should("contain", "/assessments");
    cy.contains("Assessment succesfully created.").should("be.visible");
  });
});

describe("/assessments", () => {
  beforeEach(() => {
    cy.kcLogout();
    cy.kcLogin("identified").as("identifiedTokens");
    cy.visit("/assessments");
  });

  it("should be able to filter on subject type and name", () => {
    cy.contains("Filter").click();

    // Test subject type filtering
    cy.get("#floatingSelectSubjectType").select("identified_test_subject_type");
    cy.get("#floatingSelectSubjectType")
      .find(":selected")
      .should("have.text", "identified_test_subject_type");
    cy.get("#apply_filter_button").click();
    cy.get("table").find("tbody").find("tr").should("exist");

    cy.get("#clear_filter_button").click();
    cy.get("#floatingSelectSubjectType")
      .find(":selected")
      .should("have.text", "Select Subject Type");

    // Test subject name filtering
    cy.get("#floatingSelectSubjectName").select("identified_test_subject_name");
    cy.get("#floatingSelectSubjectName")
      .find(":selected")
      .should("have.text", "identified_test_subject_name");
    cy.get("#apply_filter_button").click();
    cy.get("table").find("tbody").find("tr").should("exist");
    cy.get("#clear_filter_button").click();
    cy.get("#floatingSelectSubjectName")
      .find(":selected")
      .should("have.text", "Select Subject Name");
  });

  it("makes no changes to assessment when editing and not saving", () => {
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find('[id^="edit-button-"]')
      .click();
    cy.get("#actorRadio").contains("PID Manager at Oxford Fertility");
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-no").click();
    });
    cy.get("#left-tabs-tabpane-C5").contains("FAIL");
    cy.contains("Close").click();
    // select via Ranking header to prevent breaking tests when columns change.
    cy.contains("thead th", "Ranking").then((rankingHeader) => {
      const rankingColumnIndex = rankingHeader.index();

      cy.get(
        `tbody > :nth-child(1) > :nth-child(${rankingColumnIndex + 1})`,
      ).should("contain", "7");
    });
  });

  it("edits an assessment", () => {
    cy.get("table")
      .contains("td", "1")
      .parent("tr")
      .find('[id^="edit-button-"]')
      .click();
    cy.get("#actorRadio").contains("PID Manager at Oxford Fertility");
    cy.get("#assessment-wizard-tab-step-3").click();
    cy.get("form:visible").within(() => {
      cy.get("#test-check-no").click();
    });
    cy.get("#left-tabs-tabpane-C5").contains("FAIL");
    cy.get("#submit_assessment_button").click();
    // select via Ranking header to prevent breaking tests when columns change.
    cy.contains("thead th", "Ranking").then((rankingHeader) => {
      const rankingColumnIndex = rankingHeader.index();
      cy.get(
        `tbody > :nth-child(1) > :nth-child(${rankingColumnIndex + 1})`,
      ).should("contain", "6");
    });
    cy.contains("Assessment succesfully updated.").should("be.visible");
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
