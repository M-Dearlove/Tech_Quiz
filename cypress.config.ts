import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://127.0.0.1:3001",
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      //return require('./cypress/plugins/index.js')(on, config)
    }
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
