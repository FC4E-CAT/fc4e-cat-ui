/// <reference types="cypress"/>
describe("/assess", () => {
  beforeEach(() => {
    cy.kcLogout().then(() => {
      cy.kcLogin("identified")
        .as("identifiedTokens")
        .then(() => {
          cy.visit("/assess");
        });
    });
  });

  it("should have actor cards that are flippable", () => {
    cy.get('[id^="actorCard_"]').eq(0).as("actorCard");
    cy.get("@actorCard").find('[id^="frontButton_"]').click();
    cy.get("@actorCard").find('[id^="frontButton_"]').should("not.exist");
    cy.get("@actorCard").find('[id^="backButton_"]').click();
    cy.get("@actorCard").find('[id^="assessmentButton_"]').should("exist");
  });

  it("should link to the public assessments page", () => {
    cy.get('[id^="actorCard_"]').eq(0).as("actorCard");
    cy.get("@actorCard").find('[id^="assessmentButton_"]').click();
    cy.url().should("include", "public-assessments");
  });
  it("should have working links", () => {
    cy.get(
      "#actorCard_PID_Scheme_Component > .bg-transparent > .text-decoration-none",
    )
      .should("have.attr", "href")
      .and("match", /^\/public-assessments/);
  });
});
