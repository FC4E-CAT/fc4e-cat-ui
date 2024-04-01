import { defineConfig } from "cypress";

export default defineConfig({
  reporter: "junit",
  reporterOptions: {
    mochaFile: "results/test-results-[hash].xml",
    outputs: true,
    testCaseSwitchClassnameAndName: true,
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
  env: {
    auth_base_url: "http://localhost:58080/",
    auth_realm: "quarkus",
    auth_client_id: "frontend-service",
    backend_url: "http://localhost:8080",
  },

  e2e: {
    baseUrl: "http://localhost:3000",
  },
});
