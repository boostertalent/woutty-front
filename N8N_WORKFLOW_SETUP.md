# 📋 MODE D'EMPLOI - CONFIGURATION WORKFLOW N8N POUR TESTS

## 🎯 OBJECTIF

Ce guide vous explique comment configurer **n8n** pour recevoir automatiquement les résultats de vos tests **Jest** et **Cypress** dans un tableau **Notion**.

---

## 🏗️ ARCHITECTURE DU WORKFLOW

```
Tests (Jest/Cypress) → Webhook n8n → Tableau Notion
```

### Flux de données :
1. **Chaque fichier de test** est envoyé individuellement
2. **Un résumé global** est envoyé après tous les tests
3. **Les données incluent** : type, fichier, statut, description, date

---

## ⚙️ CONFIGURATION N8N

### Étape 1 : Créer le Webhook

1. **Connectez-vous à n8n** : https://app.n8n.cloud
2. **Créez un nouveau workflow** : cliquez sur "+ New workflow"
3. **Ajoutez un déclencheur Webhook** :
   - Cliquez sur "Add trigger"
   - Cherchez "Webhook"
   - Sélectionnez "Webhook"
   - Nommez-le : `Tests Woutty Front`

4. **Configurez le webhook** :
   ```
   HTTP Method: POST
   Path: /webhook-test
   Authentication: None
   Response Code: 200
   ```

5. **Cliquez sur "Listen for calls"** et copiez l'URL du webhook

### Étape 2 : Connecter à Notion

1. **Ajoutez une étape Notion** :
   - Cliquez sur "+" après le webhook
   - Cherchez "Notion"
   - Sélectionnez "Create Page"

2. **Configurez la connexion Notion** :
   - Connectez votre compte Notion
   - Sélectionnez votre base de données "Rapport de bugs"

3. **Configurez le mapping des champs** :

#### **Pour les tests individuels** :
| Champ Notion | Données du webhook | Description |
|-------------|------------------|-------------|
| Type de test | `{{ $json.testType }}` | Jest ou Cypress |
| File Path | `{{ $json.filePath }}` | Chemin du fichier testé |
| Status | `{{ $json.status }}` | Passed/Failed |
| Description | `{{ $json.description }}` | Détails du test |
| Date | `{{ $json.timestamp }}` | Date d'exécution |
| Projet | `{{ $json.projet }}` | Woutty Front |

#### **Pour le résumé global** :
| Champ Notion | Données du webhook | Description |
|-------------|------------------|-------------|
| Type de test | `{{ $json.testType }}` | Jest-Summary ou Cypress-Summary |
| File Path | `{{ $json.filePath }}` | SUMMARY |
| Status | `{{ $json.status }}` | Success/Failed global |
| Description | `{{ $json.description }}` | Résumé complet |
| Date | `{{ $json.timestamp }}` | Date d'exécution |

### Étape 3 : Finaliser le workflow

1. **Ajoutez une étape de réponse** (optionnel) :
   - Ajoutez "HTTP Response"
   - Configurez pour retourner `{"status": "success"}`

2. **Testez le workflow** :
   - Cliquez sur "Test workflow"
   - Envoyez des données de test JSON

3. **Activez le workflow** :
   - Basculez sur "Active"
   - Sauvegardez le workflow

---

## 🔧 CONFIGURATION PROJET

### Variables d'environnement

Créez/modifiez votre fichier `.env.local` :

```env
# URL du webhook n8n (obtenue à l'étape 1)
N8N_WEBHOOK_URL=https://votre-webhook.n8n.cloud/webhook-test

# Alternative pour Jest (si différent)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://votre-webhook.n8n.cloud/webhook-test
```

### Vérification de la configuration

1. **Testez Jest** :
   ```bash
   npm test
   ```
   - Vérifiez les logs : `✅ Fichier testé envoyé à Notion: src/components/Button.test.tsx (Passed)`

2. **Testez Cypress** :
   ```bash
   npm run cypress:run
   ```
   - Vérifiez les logs : `✅ Fichier Cypress envoyé: cypress/e2e/pages/home.cy.js (Passed)`

---

## 📊 STRUCTURE DES DONNÉES REÇUES

### Format JSON envoyé par test

```json
{
  "testType": "Jest" | "Cypress",
  "timestamp": "2026-01-15T10:30:00.000Z",
  "filePath": "src/components/Button.test.tsx",
  "status": "Passed" | "Failed",
  "passed": 5,
  "failed": 0,
  "total": 5,
  "description": "Tous les tests réussis",
  "projet": "Woutty Front",
  "duration": 1250
}
```

### Pour le résumé global

```json
{
  "testType": "Jest-Summary" | "Cypress-Summary",
  "timestamp": "2026-01-15T10:35:00.000Z",
  "filePath": "SUMMARY",
  "status": "Success",
  "passed": 45,
  "failed": 3,
  "total": 48,
  "description": "45 réussis, 3 échoués sur 48 tests",
  "projet": "Woutty Front",
  "duration": 15000
}
```

---

## 🎨 EXEMPLE DE TABLEAU NOTION

### Structure recommandée pour la base Notion :

#### Propriétés de la base :
- **Type de test** (Select) : Jest, Cypress, Jest-Summary, Cypress-Summary
- **File Path** (Title) : Chemin du fichier
- **Status** (Select) : Passed, Failed, Success
- **Description** (Text) : Détails du test
- **Date** (Date) : Date d'exécution
- **Projet** (Text) : Woutty Front
- **Passed** (Number) : Nombre de tests réussis
- **Failed** (Number) : Nombre de tests échoués
- **Total** (Number) : Nombre total de tests
- **Duration** (Number) : Durée en ms

#### Vues recommandées :
- **Table view** : Pour voir tous les tests en tableau
- **Kanban view** : Pour organiser par statut
- **Calendar view** : Pour suivre les tests par date
- **Gallery view** : Pour les fichiers de capture d'écran

---

## 🚀 UTILISATION QUOTIDIENNE

### Lancer les tests avec envoi automatique

```bash
# Tests Jest (envoie individuel + résumé)
npm test

# Tests Cypress (envoie individuel + résumé)  
npm run cypress:run

# Tests Cypress sur Edge
npm run cypress:run:edge

# Tests composants uniquement
npm run cypress:components
```

### Surveillance des résultats

1. **Vérifiez la console** pour les logs d'envoi
2. **Consultez Notion** pour les résultats en temps réel
3. **Filtrez par statut** pour identifier rapidement les problèmes
4. **Utilisez les tags** pour organiser par type de test

---

## 🔍 DÉBOGAGE ET RÉSOLUTION DE PROBLÈMES

### Problèmes fréquents

#### ❌ "NEXT_PUBLIC_N8N_WEBHOOK_URL non défini"
**Solution** : Ajoutez la variable dans `.env.local`
```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://votre-webhook.n8n.cloud/webhook-test
```

#### ❌ "Échec de l'envoi à n8n"
**Causes possibles** :
- URL incorrecte
- Workflow n8n inactif
- Problème réseau
- Erreur de mapping des champs

**Solutions** :
1. Vérifiez l'URL du webhook
2. Activez le workflow n8n
3. Testez avec curl :
   ```bash
   curl -X POST https://votre-webhook.n8n.cloud/webhook-test \
        -H "Content-Type: application/json" \
        -d '{"testType":"test","filePath":"test","status":"test"}'
   ```

#### ❌ "Données non reçues dans Notion"
**Causes possibles** :
- Mappage incorrect des champs
- Permissions Notion insuffisantes
- Structure JSON invalide

**Solutions** :
1. Vérifiez le mapping dans n8n
2. Validez les permissions de la base Notion
3. Consultez les logs d'exécution n8n

---

## 📈 AMÉLIORATIONS POSSIBLES

### Notifications automatiques
Configurez n8n pour envoyer des notifications :
- **Email** en cas d'échec
- **Slack** pour les résumés quotidiens
- **Discord** pour les alertes critiques

### Rapports avancés
Enrichissez les données envoyées :
- **Coverage** des tests
- **Performance** (temps d'exécution)
- **Tendances** (évolution des échecs)

### Automatisation
Déclenchez des actions automatiques :
- **Créer des tickets** GitHub pour les échecs
- **Mettre à jour** le statut Pull Request
- **Archiver** les anciens résultats

---

## ✅ CHECKLIST DE VALIDATION

- [ ] Webhook n8n créé et actif
- [ ] Connexion Notion établie
- [ ] Mapping des champs configuré
- [ ] Variables d'environnement définies
- [ ] Tests Jest fonctionnent
- [ ] Tests Cypress fonctionnent  
- [ ] Envoi vers Notion vérifié
- [ ] Tableau Notion mis à jour
- [ ] Notifications configurées

---

## 🎞 SUPPORT

### En cas de problème
1. **Consultez les logs** de la console
2. **Vérifiez l'état** du workflow n8n
3. **Testez manuellement** le webhook
4. **Validez** la structure JSON

### Ressources utiles
- **Documentation n8n** : https://docs.n8n.io/
- **API Notion** : https://developers.notion.com/
- **Debug Jest** : `--verbose`
- **Debug Cypress** : `--headed --browser chrome`

---

## 🎉 FÉLICITATIONS !

Une fois configuré, votre système de tests enverra automatiquement tous les résultats dans Notion pour un suivi parfait de la qualité de votre code !

**Tests automatisés + Suivi centralisé = Productivité maximale** 🚀

---

*Dernière mise à jour : Janvier 2026*
