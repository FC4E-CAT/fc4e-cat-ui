const ROUTES = {
  HOME: "/",
  ABOUT: {
    CAT: "/about/cat",
    INTEROPERABILITY: "/about/interoperability",
    ACCEPTABLE_USE: "/about/acceptable-use",
    PRIVACY: "/about/privacy",
    TERMS: "/about/terms",
    DISCLAIMER: "/about/disclaimer",
    COOKIES: "/about/cookies",
  },
  PID_SELECTION: "/pid-selection",
  ASSESSMENTS: {
    ROOT: "/assessments",
    CREATE: "/assessments/create",
    CREATE_WITH_VALIDATION: "/assessments/create/:valID",
    IMPORT: "/assessments/import",
    EDIT: "/assessments/:asmtId",
    VIEW: "/assessments/:asmtId/view",
    ASSESS: "/assess",
  },
  PUBLIC_ASSESSMENTS: {
    ROOT: "/public-assessments",
    VIEW: "/public-assessments/:asmtId/view",
  },
  PROFILE: {
    ROOT: "/profile",
    UPDATE: "/profile/update",
  },
  SUBJECTS: "/subjects",
  VALIDATIONS: {
    ROOT: "/validations",
    REQUEST: "/validations/request",
    VIEW: "/validations/:id",
  },
  LOGIN: "/login",
  ADMIN: {
    DASHBOARD: "/admin",
    USERS: "/admin/users",
    USER_VIEW: "/admin/users/view/:id",
    VALIDATIONS: "/admin/validations",
    VALIDATION_VIEW: "/admin/validations/:id",
    VALIDATION_REJECT: "/admin/validations/:id/reject",
    VALIDATION_APPROVE: "/admin/validations/:id/approve",
    ASSESSMENTS: "/admin/assessments",
    SETTINGS: {
      ROOT: "/admin/settings",
      TEST_METHODS: "/admin/settings/test-methods",
      METRIC_TYPES: "/admin/settings/metric-types",
      ALGORITHMS: "/admin/settings/algorithms",
      BENCHMARK_TYPES: "/admin/settings/benchmark-types",
    },
    MOTIVATIONS: {
      ROOT: "/admin/motivations",
      VIEW: "/admin/motivations/:mtvId",
      MANAGE_CRITERIA: "/admin/motivations/:mtvId/manage-criteria-principles",
      METRICS_TESTS: "/admin/motivations/:mtvId/metrics-tests/:mtrId",
      ACTOR_CRITERIA: "/admin/motivations/:mtvId/actors/:actId",
      TEMPLATES: "/admin/motivations/:mtvId/templates/actors/:actId",
      ASSESSMENT_BUILDER:
        "/admin/motivations/:mtvId/templates/actors/:actId/assessment-builder",
    },
    CRITERIA: {
      ROOT: "/admin/criteria",
      VIEW: "/admin/criteria/:criId",
    },
    METRICS: {
      ROOT: "/admin/metrics",
      VIEW: "/admin/metrics/:mtrId",
    },
    TESTS: {
      ROOT: "/admin/tests",
      VIEW: "/admin/tests/:testId",
      CREATE: "/admin/tests/create-test",
      EDIT: "/admin/tests/edit-test/:testId",
      CREATE_VERSION: "/admin/tests/create-version-test/:testId",
    },
    PRINCIPLES: {
      ROOT: "/admin/principles",
      VIEW: "/admin/principles/:priId",
    },
  },
  REGISTRY: {
    MOTIVATIONS: "/registry/motivations",
    CRITERIA: "/registry/criteria",
    METRICS: "/registry/metrics",
    TESTS: "/registry/tests",
    PRINCIPLES: "/registry/principles",
  },
  USER_ROLE: {
    ROOT: "/user-role",
    REQUESTS: "/user-role-requests",
    GUIDE: "/user-role-guide",
    USERS_TABLE: "/users-table",
  },
  LOGOUT: "/logout",
};

// Helper function to build routes with parameters
export const buildRoute = (
  template: string,
  params: Record<string, string>,
): string => {
  return Object.entries(params).reduce(
    (route, [key, value]) => route.replace(`:${key}`, value),
    template,
  );
};

export default ROUTES;
