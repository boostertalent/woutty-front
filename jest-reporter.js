import axios from 'axios';

class N8nReporter {
  async onRunComplete(contexts, results) {
    const data = {
      testType: 'Jest',
      passed: results.numPassedTests,
      failed: results.numFailedTests,
      total: results.numTotalTests,
      status: results.numFailedTests > 0 ? '❌ Erreur' : '✅ Succès',
      details: results.testResults
        .filter(r => r.failureMessage) // On ne garde que les erreurs si besoin
        .map(r => r.failureMessage)
        .join('\n') || 'Tous les tests sont passés !'
    };

    try {
      // C'est ici qu'on mettra l'URL de n8n à l'étape suivante
      await axios.post('http://localhost:5678/webhook-test/rapport-bug-nextjs', data);
      console.log('🚀 Résultats envoyés à Notion via n8n');
    } catch (error) {
      console.error('❌ Échec de l\'envoi à n8n:', error.message);
    }
  }
}

export default N8nReporter;