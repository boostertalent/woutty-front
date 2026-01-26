import { defineConfig } from "cypress";
import axios from "axios";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // "after:run" s'exécute une fois que toute la suite de tests est terminée
      on('after:run', async (results) => {
        // On vérifie que results existe (ce n'est pas le cas en mode interactif 'open')
        if (results && 'totalTests' in results) {
          try {
            await axios.post('http://localhost:5678/webhook-test/rapport-bug-nextjs', {
              projet: "Woutty Front",
              type: "Cypress",
              total: results.totalTests,
              reussis: results.totalPassed,
              echecs: results.totalFailed,
              statut: results.totalFailed > 0 ? "Failed" : "Success",
              date: new Date().toISOString()
            });
            console.log('✅ Rapport envoyé à Notion via n8n');
          } catch (error) {
            console.error('❌ Erreur lors de l\'envoi à n8n:', error);
          }
        }
      });
    },
  },
});