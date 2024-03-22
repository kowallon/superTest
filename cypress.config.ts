import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'https://fred.stlouisfed.org/',
    watchForFileChanges: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
