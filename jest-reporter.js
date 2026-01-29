import axios from 'axios';

class N8nReporter {
  async onRunComplete(contexts, results) {
    // Extraire les résultats de chaque fichier testé
    const testFiles = results.testResults
      .filter(testResult => testResult.numPassingTests > 0 || testResult.numFailingTests > 0)
      .map(testResult => {
        const filePath = testResult.testFilePath
          .replace(/\\/g, '/')
          .replace(process.cwd().replace(/\\/g, '/'), '')
          .replace(/^\//, '');
        
        return {
          filePath: filePath,
          passed: testResult.numPassingTests,
          failed: testResult.numFailingTests,
          total: testResult.numPassingTests + testResult.numFailingTests,
          status: testResult.numFailingTests > 0 ? 'Failed' : 'Passed',
          description: testResult.failureMessage 
            ? testResult.failureMessage.substring(0, 500)
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
      status: results.numFailedTests > 0 ? 'Failed' : 'Success',
      projet: 'Woutty Front',
      summary: `${results.numPassedTests} réussis, ${results.numFailedTests} échoués sur ${results.numTotalTests} tests`
    };

    try {
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
      
      if (!n8nUrl) {
        console.warn('⚠️ N8N_WEBHOOK_URL ou NEXT_PUBLIC_N8N_WEBHOOK_URL non défini dans .env.local - données non envoyées');
        return;
      }
      
      await axios.post(n8nUrl, data, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`✅ ${testFiles.length} fichier(s) testé(s) envoyé(s) à Notion via n8n`);
    } catch (error) {
      console.error('❌ Échec de l\'envoi à n8n:', error.message);
    }
  }
}

export default N8nReporter;