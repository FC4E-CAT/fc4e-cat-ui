/// <reference types="cypress" />

import { getAuthCodeFromLocation } from "./utils";
const backendURL = Cypress.env("backend_url");
Cypress.Commands.add("updateProfile", (authToken) => {
  cy.fixture("profile").then((profileData: ProfileData) => {
    cy.request({
      method: "PUT",
      url: `${backendURL}/v1/users/profile`,
      body: profileData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    }).then((updateProfile) => {
      // Check if the profile was successfully updated.
      expect(updateProfile.status).to.equal(200);
    });
  });
});

Cypress.Commands.add("createValidation", (authToken) => {
  cy.fixture("validations/validation").then((orgData) => {
    cy.request({
      method: "POST",
      url: `${backendURL}/v1/validations`,
      body: orgData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      failOnStatusCode: false,
    }).then((createResponse) => {
      cy.wrap(createResponse)
        .its("status")
        .should((status) => {
          if (status !== 409) {
            expect(status).to.equal(201);
          }
        });
    });
  });
});

Cypress.Commands.add("approveValidation", (authToken) => {
  // Now, make a separate request to approve the validation
  const approveRequestBody = {
    status: "APPROVED",
    // Add any other required fields for approval
  };

  cy.request({
    method: "PUT",
    url: `${backendURL}/v1/admin/validations/1/update-status`,
    body: approveRequestBody,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${authToken}`,
    },
  }).then((approveResponse) => {
    // Check if the validation was approved successfully
    expect(approveResponse.status).to.equal(200);
  });
});

Cypress.Commands.add("kcLogin", (user: string) => {
  Cypress.log({ name: "Login" });

  cy.fixture(`users/${user}`).then((userData: UserData) => {
    const authBaseUrl = Cypress.env("auth_base_url");
    const realm = Cypress.env("auth_realm");
    const client_id = Cypress.env("auth_client_id");

    cy.request({
      url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/auth`,
      followRedirect: false,
      qs: {
        scope: "openid",
        response_type: "code",
        approval_prompt: "auto",
        redirect_uri: Cypress.config("baseUrl"),
        client_id,
      },
    })
      .then((response) => {
        const html = document.createElement("html");
        html.innerHTML = response.body;

        const form = html.getElementsByTagName("form")[0];
        const url = form.action;

        return cy.request({
          method: "POST",
          url,
          followRedirect: false,
          form: true,
          body: {
            username: userData.username,
            password: userData.password,
          },
        });
      })
      .then((response) => {
        const code = getAuthCodeFromLocation(
          response.headers["location"] as string,
        );

        cy.request({
          method: "post",
          url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/token`,
          body: {
            client_id,
            redirect_uri: Cypress.config("baseUrl"),
            code,
            grant_type: "authorization_code",
          },
          form: true,
          followRedirect: false,
        }).its("body");
      });
  });
});

Cypress.Commands.add("kcLogout", () => {
  Cypress.log({ name: "Logout" });
  const authBaseUrl = Cypress.env("auth_base_url");
  const realm = Cypress.env("auth_realm");

  return cy.request({
    url: `${authBaseUrl}/realms/${realm}/protocol/openid-connect/logout`,
  });
});
Cypress.Commands.add("setupValidation", (user: string) => {
  cy.kcLogout();
  cy.kcLogin(user).as("userTokens");
  cy.get<KcTokens>("@userTokens").then((tokens) => {
    cy.updateProfile(tokens.access_token);
    cy.createValidation(tokens.access_token);
  });
  cy.kcLogout();
  cy.kcLogin("admin").as("adminTokens");
  cy.get<KcTokens>("@adminTokens").then((tokens) => {
    cy.approveValidation(tokens.access_token);
  });
  cy.kcLogout();
});
