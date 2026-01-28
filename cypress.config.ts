import { defineConfig } from "cypress";
import axios from "axios";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      // "after:run" s'exécute une fois que toute la suite de tests est terminée
      on('after:run', async (results) => {
        // On vérifie que results existe (ce n'est pas le cas en mode interactif 'open')
        if (results && 'totalTests' in results) {
          try {
            // Extraire les résultats par fichier
            const testFiles = results.runs.map((run: any) => ({
              filePath: run.spec.name,
              status: run.stats.failures > 0 ? 'Failed' : 'Passed',
              passed: run.stats.passes,
              failed: run.stats.failures,
              total: run.stats.tests,
              duration: run.stats.duration
            }));

            const data = {
              testType: 'Cypress',
              timestamp: new Date().toISOString(),
              total: results.totalTests,
              passed: results.totalPassed,
              failed: results.totalFailed,
              status: results.totalFailed > 0 ? "Failed" : "Success",
              testFiles: testFiles,
              projet: "Woutty Front",
              duration: results.totalDuration
            };

            // Remplace cette URL par ton URL n8n webhook
            const n8nUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/rapport-bug-nextjs';
            await axios.post(n8nUrl, data, {
              timeout: 10000,
              headers: {
                'Content-Type': 'application/json'
              }
            });
            console.log('✅ Résultats Cypress envoyés à Notion via n8n');
          } catch (error) {
            console.error('❌ Erreur lors de l\'envoi à n8n:', error);
          }
        }
      });
    },
  },
});