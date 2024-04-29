describe("User Login Tests", () => {
  beforeEach(() => {
    cy.visit("/login");
  });
  it("greets with sign in", () => {
    cy.origin("http://localhost:58080", () => {
      cy.get("h1").should("contain", "Sign in to your account");
    });
  });
  it("requires username", () => {
    cy.origin("http://localhost:58080", () => {
      cy.get("input#kc-login").click();
      cy.get("#input-error").should("contain", "Invalid username or password.");
    });
  });
  it("requires password", () => {
    cy.origin("http://localhost:58080", () => {
      cy.get("input#kc-login").click();
      cy.get("#input-error").should("contain", "Invalid username or password.");
    });
  });
  it("logs in", () => {
    cy.origin("http://localhost:58080", () => {
      cy.get("input#username").type("identified_ui");
      cy.get("input#password").type("identified_ui");
      cy.get("input#kc-login").click();
    });
    cy.url().should("include", "login");
  });
});
