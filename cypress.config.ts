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

        const n8nUrl = process.env.N8N_WEBHOOK_URL ?? 
          "http://localhost:5678/webhook-test/rapport-bug-nextjs";

        if (!n8nUrl) {
          console.warn('⚠️ N8N_WEBHOOK_URL non défini - résultats non envoyés');
          return;
        }

        // Traiter chaque fichier de test individuellement
        for (const run of results.runs) {
          const individualData = {
            testType: "Cypress",
            timestamp: new Date().toISOString(),
            filePath: run.spec?.name ?? "unknown",
            status: run.stats.failures > 0 ? "Failed" : "Passed",
            passed: run.stats.passes,
            failed: run.stats.failures,
            total: run.stats.tests,
            duration: run.stats.duration,
            projet: "Woutty Front",
            description: run.stats.failures > 0 
              ? `${run.stats.failures} test(s) échoué(s)` 
              : "Tous les tests réussis"
          };

          try {
            await axios.post(n8nUrl, individualData, {
              timeout: 10_000,
              headers: {
                "Content-Type": "application/json",
              },
            });
            console.log(`✅ Fichier Cypress envoyé: ${individualData.filePath} (${individualData.status})`);
          } catch (error) {
            console.error(`❌ Erreur pour ${individualData.filePath}:`, error.message);
          }
        }

        // Envoyer un résumé global
        const summaryData = {
          testType: "Cypress-Summary",
          timestamp: new Date().toISOString(),
          filePath: "SUMMARY",
          status: results.totalFailed > 0 ? "Failed" : "Success",
          passed: results.totalPassed,
          failed: results.totalFailed,
          total: results.totalTests,
          duration: results.totalDuration,
          projet: "Woutty Front",
          description: `${results.totalPassed} réussis, ${results.totalFailed} échoués sur ${results.totalTests} tests`
        };

        try {
          await axios.post(n8nUrl, summaryData, {
            timeout: 10_000,
            headers: {
              "Content-Type": "application/json",
            },
          });
          console.log("✅ Résumé global Cypress envoyé à n8n");
        } catch (error) {
          console.error("❌ Erreur lors de l'envoi du résumé:", error);
        }
      });

      return config;
    },
  },
});
