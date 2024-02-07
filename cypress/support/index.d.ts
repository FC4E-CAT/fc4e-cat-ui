/// <reference types="cypress" />
interface UserData {
  username: string;
  password: string;
  fakeLogin?: {
    access_token: string;
    refresh_token: string;
    id_token: string;
    account: object;
  };
}

interface ProfileData {
  name: string;
  surname: string;
  email: string;
  orcid_id: string;
}

interface KcTokens {
  access_token: string;
  refresh_token: string;
  id_token: string;
}

declare namespace Cypress {
  interface Chainable<Subject> {
    updateProfile(authToken: string): Chainable<Subject>;
    createValidation(authToken: string): Chainable<Subject>;
    approveValidation(authToken: string): Chainable<Subject>;
    setupValidation(user: string): Chainable<Subject>;
    kcLogin(user: string): Chainable<KcTokens>;
    kcLogout(): Chainable<Response<void>>;
  }
}
