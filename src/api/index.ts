// Import API service modules
import UserService from './services/User';
import ValidationService from './services/Validation';
import OrganisationService from './services/Organisation';
import ActorService from './services/Actor';
import TemplateService from './services/Template'

// Export API service modules
export const UserAPI = UserService;
export const ValidationAPI = ValidationService;
export const OrganisationAPI = OrganisationService;
export const ActorAPI = ActorService;
export const TemplateAPI = TemplateService;

export { default as APIClient } from './client';