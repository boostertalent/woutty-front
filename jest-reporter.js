import axios from 'axios';

class N8nReporter {
  async onRunComplete(contexts, results) {
    // Extraire les résultats de chaque fichier testé
    const testFiles = results.testResults
      .filter(testResult => testResult.numPassingTests > 0 || testResult.numFailingTests > 0) // Ignorer les fichiers sans tests
      .map(testResult => {
        // Nettoyer le chemin du fichier (enlever les chemins absolus si nécessaire)
        const filePath = testResult.testFilePath.replace(/\\/g, '/').replace(process.cwd().replace(/\\/g, '/'), '');
        
        return {
          filePath: filePath.startsWith('/') ? filePath.slice(1) : filePath,
          passed: testResult.numPassingTests,
          failed: testResult.numFailingTests,
          total: testResult.numPassingTests + testResult.numFailingTests,
          status: testResult.numFailingTests > 0 ? 'Failed' : 'Passed',
          description: testResult.failureMessage 
            ? testResult.failureMessage.substring(0, 500) // Limiter à 500 caractères
            : 'Tous les tests réussis'
        };
      });

    const data = {
      testType: 'Jest',
      timestamp: new Date().toISOString(),
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      total: results.numTotalTests,
      testFiles: testFiles,
      summary: `${results.numPassedTests} réussis, ${results.numFailedTests} échoués sur ${results.numTotalTests} tests`
    };

    try {
      // L'URL du webhook n8n depuis les variables d'environnement
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      
      if (!n8nUrl) {
        console.warn('⚠️ N8N_WEBHOOK_URL non défini dans .env.local - données non envoyées');
        return;
      }
      
      await axios.post(n8nUrl, data, {
        timeout: 10000, // Timeout de 10 secondes
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log(`✅ ${testFiles.length} fichier(s) testé(s) envoyé(s) à Notion via n8n`);
    } catch (error) {
      console.error('❌ Échec de l\'envoi à n8n:', error.message);
    }
  }
}

export default N8nReporter;