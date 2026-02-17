import axios from 'axios';

class N8nReporter {
  async onRunComplete(contexts, results) {
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!n8nUrl) {
      console.warn('⚠️ NEXT_PUBLIC_N8N_WEBHOOK_URL non défini dans .env.local - données non envoyées');
      return;
    }

    // Traiter chaque fichier de test individuellement
    const testFiles = results.testResults
      .filter(testResult => testResult.numPassingTests > 0 || testResult.numFailingTests > 0);

    for (const testResult of testFiles) {
      const filePath = testResult.testFilePath
        .replace(/\\/g, '/')
        .replace(process.cwd().replace(/\\/g, '/'), '')
        .replace(/^\//, '');
      
      const individualData = {
        testType: 'Jest',
        timestamp: new Date().toISOString(),
        filePath: filePath,
        passed: testResult.numPassingTests,
        failed: testResult.numFailingTests,
        total: testResult.numPassingTests + testResult.numFailingTests,
        status: testResult.numFailingTests > 0 ? 'Failed' : 'Passed',
        description: testResult.failureMessage 
          ? testResult.failureMessage.substring(0, 500)
          : 'Tous les tests réussis',
        projet: 'Woutty Front',
        duration: testResult.perTestStats.reduce((sum, stat) => sum + (stat.durations?.[0] || 0), 0)
      };

      try {
        await axios.post(n8nUrl, individualData, {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' }
        });
        console.log(`✅ Fichier testé envoyé à Notion: ${filePath} (${individualData.status})`);
      } catch (error) {
        console.error(`❌ Échec de l'envoi pour ${filePath}:`, error.message);
      }
    }

    // Envoyer aussi un résumé global
    const summaryData = {
      testType: 'Jest-Summary',
      timestamp: new Date().toISOString(),
      filePath: 'SUMMARY',
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      total: results.numTotalTests,
      status: results.numFailedTests > 0 ? 'Failed' : 'Success',
      description: `${results.numPassedTests} réussis, ${results.numFailedTests} échoués sur ${results.numTotalTests} tests`,
      projet: 'Woutty Front',
      duration: 0
    };

    try {
      await axios.post(n8nUrl, summaryData, {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`✅ Résumé global Jest envoyé à Notion`);
    } catch (error) {
      console.error('❌ Échec de l\'envoi du résumé:', error.message);
    }
  }
}

export default N8nReporter;