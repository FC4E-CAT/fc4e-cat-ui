// Import API service modules
import UserService from './services/User';
import ValidationService from './services/Validation';

// Export API service modules
export const UserAPI = UserService;
export const ValidationAPI = ValidationService;

export { default as APIClient } from './client';