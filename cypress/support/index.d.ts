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

interface OrgData {
  organisation_role: string;
  organisation_id: string;
  organisation_source: string;
  organisation_name: string;
  organisation_website: string;
  actor_id: string;
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
    loginBob(): Chainable<void>;
    loginAdmin(): Chainable<void>;
    updateProfile(authToken: string): Chainable<void>;
    createValidation(authToken: string): Chainable<void>;
    approveValidation(authToken: string): Chainable<void>;
    setupValidation(user: string): Chainable<void>;
    kcLogin(user: string): Chainable<KcTokens>;
    kcLogout(): Chainable<any>;
  }
}
