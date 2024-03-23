import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://fred.stlouisfed.org/',
    watchForFileChanges: false,
    viewportWidth: 1200,
    viewportHeight: 800,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
