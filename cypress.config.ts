import { defineConfig } from "cypress";
import axios from "axios";


export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",

    // Support des tests .cy.ts ET .cy.js
    specPattern: "cypress/e2e/**/*.cy.{js,ts}",

    supportFile: "cypress/support/e2e.ts",

    // Sécurité (évite le warning allowCypressEnv)
    allowCypressEnv: false,

    setupNodeEvents(on, config) {
      // Fix GPU (Windows / Chromium)
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "chromium") {
          launchOptions.args.push("--disable-gpu");
        }
        return launchOptions;
      });

      // Hook exécuté UNIQUEMENT en mode `cypress run`
      on("after:run", async (results) => {
        if (!results || !results.runs) {
          return;
        }

        try {
          const testFiles = results.runs.map((run) => ({
            filePath: run.spec?.name ?? "unknown",
            status: run.stats.failures > 0 ? "Failed" : "Passed",
            passed: run.stats.passes,
            failed: run.stats.failures,
            total: run.stats.tests,
            duration: run.stats.duration,
          }));

          const data = {
            testType: "Cypress",
            timestamp: new Date().toISOString(),
            total: results.totalTests,
            passed: results.totalPassed,
            failed: results.totalFailed,
            status: results.totalFailed > 0 ? "Failed" : "Success",
            testFiles,
            projet: "Woutty Front",
            duration: results.totalDuration,
          };

          const n8nUrl =
            process.env.N8N_WEBHOOK_URL ??
            "http://localhost:5678/webhook-test/rapport-bug-nextjs";

          await axios.post(n8nUrl, data, {
            timeout: 10_000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          console.log("✅ Résultats Cypress envoyés à n8n");
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi à n8n:", error);
        }
      });

      return config;
    },
  },
});
