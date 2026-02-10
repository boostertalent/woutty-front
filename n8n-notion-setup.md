# 🚀 Configuration n8n + Notion pour les Rapports de Tests

## 📋 Vue d'ensemble

Ce guide explique comment configurer n8n pour recevoir les résultats de tests (Jest et Cypress) et les envoyer dans une base de données Notion avec le format demandé :
- Type de test (Jest/Cypress)
- Chemin du fichier
- Statut (Passé/Échoué)
- Description
- Date de création

---

## 🔧 Prérequis

1. **Compte Notion** avec accès à l'API
2. **n8n installé** (local ou cloud)
3. **Variables d'environnement** configurées

---

## 📊 Étape 1: Création de la Base de Données Notion

### 1.1 Créer la base de données
1. Allez sur [notion.so](https://notion.so)
2. Créez une nouvelle page → "Database" → "Table"
3. Nommez-la : "📊 Rapports de Tests"

### 1.2 Configurer les colonnes
Créez les colonnes suivantes avec les types appropriés :

| Nom de la colonne | Type | Description |
|------------------|------|-------------|
| 🏷️ Type de test | Select | Options: "Jest", "Cypress" |
| 📁 Chemin du fichier | Text | Chemin relatif du fichier test |
| ✅ Statut | Select | Options: "Passé", "Échoué" |
| 📝 Description | Text | Description du résultat |
| 📅 Date de création | Date | Date automatique |

---

## 🔌 Étape 2: Configuration du Webhook n8n

### 2.1 Créer le workflow n8n
1. Connectez-vous à votre instance n8n
2. Créez un nouveau workflow
3. Ajoutez un nœud **"Webhook"** (HTTP Trigger)

### 2.2 Configuration du Webhook
```yaml
Node: Webhook
Path: /test-reports
HTTP Method: POST
Response Code: 200
Response Body: {"status": "received"}
```

### 2.3 Générer l'URL du webhook
- Copiez l'URL générée (ex: `https://votre-n8n.com/webhook/test-reports`)
- Ajoutez-la à vos variables d'environnement

---

## 🔄 Étape 3: Workflow n8n Complet

### 3.1 Structure du workflow
```
[Webhook] → [Code] → [Split In Batches] → [Notion] → [Set] → [HTTP Response]
```

### 3.2 Configuration des nœuds

#### Nœud 1: Webhook (déjà configuré)

#### Nœud 2: Code (Traitement des données)
```javascript
// Traitement des données reçues
const inputData = $input.first().json;

// Normaliser les données pour Jest et Cypress (uniquement les 5 champs requis)
let testFiles = [];

if (inputData.testType === 'Jest') {
  testFiles = inputData.testFiles.map(file => ({
    type: 'Jest',
    path: file.filePath,
    status: file.status === 'Passed' ? 'Passé' : 'Échoué',
    description: file.description,
    date: new Date().toISOString()
  }));
} else if (inputData.testType === 'Cypress') {
  testFiles = inputData.testFiles.map(file => ({
    type: 'Cypress',
    path: file.filePath,
    status: file.status === 'Passed' ? 'Passé' : 'Échoué',
    description: `${file.passed} passés, ${file.failed} échoués`,
    date: new Date().toISOString()
  }));
}

return testFiles.map(item => ({ json: item }));
```

#### Nœud 3: Split In Batches
```yaml
Batch Size: 1
Options: Reset between each batch
```

#### Nœud 4: Notion (Création des entrées)
```javascript
// Configuration de la connexion Notion
const notionToken = 'votre_token_notion';
const databaseId = 'votre_database_id';

// Mapping des champs Notion (uniquement les 5 colonnes requises)
const properties = {
  '🏷️ Type de test': {
    select: { name: $json.type }
  },
  '📁 Chemin du fichier': {
    rich_text: [{ text: { content: $json.path } }]
  },
  '✅ Statut': {
    select: { name: $json.status }
  },
  '📝 Description': {
    rich_text: [{ text: { content: $json.description } }]
  },
  '📅 Date de création': {
    date: { start: $json.date }
  }
};

// Requête API Notion
const response = await fetch('https://api.notion.com/v1/pages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${notionToken}`,
    'Content-Type': 'application/json',
    'Notion-Version': '2022-06-28'
  },
  body: JSON.stringify({
    parent: { database_id: databaseId },
    properties: properties
  })
});

const result = await response.json();
return { json: result };
```

#### Nœud 5: Set (Réponse de succès)
```javascript
return {
  status: 'success',
  message: `Test report for ${$json.path} saved to Notion`,
  timestamp: new Date().toISOString()
};
```

#### Nœud 6: HTTP Response
```yaml
Status Code: 200
Response Body: {{ $json }}
Headers: Content-Type: application/json
```

---

## 🔐 Étape 4: Variables d'Environnement

### 4.1 Fichier `.env.local`
```env
# URL du webhook n8n
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://votre-n8n.com/webhook/test-reports

# Alternative pour Cypress
N8N_WEBHOOK_URL=https://votre-n8n.com/webhook/test-reports
```

### 4.2 Variables n8n
Dans n8n, ajoutez ces credentials :
- **Notion API Token** : Votre token d'intégration Notion
- **Database ID** : ID de votre base de données Notion

---

## 🧪 Étape 5: Test du Workflow

### 5.1 Tester avec Jest
```bash
npm test -- --coverage --reporters=default --reporters=./jest-reporter.js
```

### 5.2 Tester avec Cypress
```bash
npm run cypress:run
```

### 5.3 Vérifier dans Notion
- Allez dans votre base de données Notion
- Vous devriez voir de nouvelles entrées avec les résultats des tests

---

## 📝 Étape 6: Code de Configuration Complet

### 6.1 Fichier `n8n-workflow-export.json` (optionnel)
```json
{
  "name": "Test Reports to Notion",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "test-reports",
        "responseMode": "onReceived",
        "options": {}
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [240, 300]
    },
    {
      "parameters": {
        "jsCode": "// Code de traitement des données\nconst inputData = $input.first().json;\n\nlet testFiles = [];\n\nif (inputData.testType === 'Jest') {\n  testFiles = inputData.testFiles.map(file => ({\n    type: 'Jest',\n    path: file.filePath,\n    status: file.status === 'Passed' ? 'Passé' : 'Échoué',\n    description: file.description,\n    passed: file.passed,\n    failed: file.failed,\n    total: file.total,\n    duration: 0,\n    project: inputData.projet || 'Woutty Front',\n    date: new Date().toISOString()\n  }));\n} else if (inputData.testType === 'Cypress') {\n  testFiles = inputData.testFiles.map(file => ({\n    type: 'Cypress',\n    path: file.filePath,\n    status: file.status === 'Passed' ? 'Passé' : 'Échoué',\n    description: `${file.passed} passés, ${file.failed} échoués`,\n    passed: file.passed,\n    failed: file.failed,\n    total: file.total,\n    duration: file.duration || 0,\n    project: inputData.projet || 'Woutty Front',\n    date: new Date().toISOString()\n  }));\n}\n\nreturn testFiles.map(item => ({ json: item }));"
      },
      "name": "Process Test Data",
      "type": "n8n-nodes-base.code",
      "position": [460, 300]
    },
    {
      "parameters": {
        "batchSize": 1,
        "options": {}
      },
      "name": "Split In Batches",
      "type": "n8n-nodes-base.splitInBatches",
      "position": [680, 300]
    },
    {
      "parameters": {
        "jsCode": "// Configuration Notion\nconst notionToken = credentials.notionApiToken.apiToken;\nconst databaseId = 'votre_database_id';\n\nconst properties = {\n  '🏷️ Type de test': {\n    select: { name: $json.type }\n  },\n  '📁 Chemin du fichier': {\n    rich_text: [{ text: { content: $json.path } }]\n  },\n  '✅ Statut': {\n    select: { name: $json.status }\n  },\n  '📝 Description': {\n    rich_text: [{ text: { content: $json.description } }]\n  },\n  '📅 Date de création': {\n    date: { start: $json.date }\n  },\n  '🎯 Projet': {\n    rich_text: [{ text: { content: $json.project } }]\n  },\n  '📊 Tests passés': {\n    number: $json.passed\n  },\n  '❌ Tests échoués': {\n    number: $json.failed\n  },\n  '📈 Total tests': {\n    number: $json.total\n  },\n  '⏱️ Durée (ms)': {\n    number: $json.duration\n  }\n};\n\nconst response = await fetch('https://api.notion.com/v1/pages', {\n  method: 'POST',\n  headers: {\n    'Authorization': `Bearer ${notionToken}`,\n    'Content-Type': 'application/json',\n    'Notion-Version': '2022-06-28'\n  },\n  body: JSON.stringify({\n    parent: { database_id: databaseId },\n    properties: properties\n  })\n});\n\nconst result = await response.json();\nreturn { json: result };"
      },
      "name": "Create Notion Entry",
      "type": "n8n-nodes-base.code",
      "position": [900, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Process Test Data", "type": "main", "index": 0 }]]
    },
    "Process Test Data": {
      "main": [[{ "node": "Split In Batches", "type": "main", "index": 0 }]]
    },
    "Split In Batches": {
      "main": [[{ "node": "Create Notion Entry", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## 🎯 Étape 7: Automatisation

### 7.1 GitHub Actions (optionnel)
```yaml
name: Tests and Report
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run Jest tests
        run: npm test -- --coverage --reporters=default --reporters=./jest-reporter.js
        env:
          NEXT_PUBLIC_N8N_WEBHOOK_URL: ${{ secrets.N8N_WEBHOOK_URL }}
      
      - name: Run Cypress tests
        run: npm run cypress:run
        env:
          N8N_WEBHOOK_URL: ${{ secrets.N8N_WEBHOOK_URL }}
```

---

## 🔍 Étape 8: Dépannage

### 8.1 Problèmes courants
1. **Webhook ne reçoit pas les données**
   - Vérifiez l'URL du webhook
   - Vérifiez les variables d'environnement

2. **Erreur d'authentification Notion**
   - Vérifiez le token API
   - Vérifiez les permissions de la base de données

3. **Mauvais format de données**
   - Vérifiez le mapping des champs
   - Vérifiez les types de données Notion

### 8.2 Logs et monitoring
- Activez les logs dans n8n
- Surveillez les réponses du webhook
- Vérifiez les erreurs dans la console

---

## 📈 Étape 9: Optimisations

### 9.1 Performance
- Utilisez des batches pour les grands volumes de tests
- Mettez en cache les résultats temporaires
- Optimisez les requêtes API Notion

### 9.2 Fonctionnalités avancées
- Ajoutez des graphiques dans Notion
- Créez des vues filtrées par type de test
- Ajoutez des notifications Slack/Email

---

## 🎉 Conclusion

Une fois configuré, vous aurez :
- ✅ Rapports de tests automatiques dans Notion
- ✅ Suivi des performances de tests
- ✅ Historique complet des exécutions
- ✅ Interface conviviale pour l'équipe

Pour toute question ou problème, consultez la documentation officielle :
- [n8n Documentation](https://docs.n8n.io/)
- [Notion API Documentation](https://developers.notion.com/)
