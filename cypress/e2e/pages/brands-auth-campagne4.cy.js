describe('Brands - Auth - Campagne 4', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('http://localhost:3000/brands/auth/campagne4');
  });

  it('Devrait charger la page campagne4', () => {
    cy.url().should('include', '/brands/auth/campagne4');
  });

  it('Devrait afficher le titre de l\'étape', () => {
    cy.contains('Étape 4', { timeout: 5000 }).should('be.visible');
    cy.contains('Budget', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher l\'indicateur de progression', () => {
    cy.get('[data-testid="step-indicator"], .step-indicator', { timeout: 5000 }).should('exist');
    cy.contains('4').should('be.visible');
  });

  it('Devrait afficher le champ de saisie du budget', () => {
    cy.get('input[placeholder*="budget"]', { timeout: 5000 }).should('exist');
    cy.contains('Entrez votre budget').should('be.visible');
  });

  it('Devrait afficher les informations sur le budget minimum', () => {
    cy.contains('15 000 CFA', { timeout: 5000 }).should('be.visible');
    cy.contains('budget minimum', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les boutons de navigation', () => {
    cy.contains('Retour', { timeout: 5000 }).should('be.visible');
    cy.contains('Finaliser la campagne', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait n\'accepter que les entrées numériques', () => {
    cy.get('input[placeholder*="budget"]').type('abc');
    cy.get('input[placeholder*="budget"]').should('have.value', '');
    
    cy.get('input[placeholder*="budget"]').type('50000');
    cy.get('input[placeholder*="budget"]').should('have.value', '50000');
  });

  it('Devrait sauvegarder le budget dans localStorage', () => {
    cy.get('input[placeholder*="budget"]').type('75000');
    
    cy.window().then((win) => {
      const saved = win.localStorage.getItem('campaign_step_4');
      expect(saved).to.exist;
      const data = JSON.parse(saved);
      expect(data.budget).to.equal('75000');
      expect(data.currency).to.equal('CFA');
    });
  });

  it('Devrait charger le budget sauvegardé depuis localStorage', () => {
    // Simuler un budget sauvegardé
    cy.window().then((win) => {
      win.localStorage.setItem('campaign_step_4', JSON.stringify({ budget: '100000', currency: 'CFA' }));
    });
    
    cy.reload();
    
    cy.get('input[placeholder*="budget"]').should('have.value', '100000');
  });

  it('Devrait afficher une erreur pour un budget inférieur au minimum', () => {
    cy.get('input[placeholder*="budget"]').type('10000');
    cy.contains('Finaliser la campagne').click();
    
    cy.contains('Le budget minimum est de 15 000 CFA', { timeout: 3000 }).should('be.visible');
  });

  it('Devrait afficher l\'état de chargement pendant la soumission', () => {
    cy.get('input[placeholder*="budget"]').type('50000');
    cy.contains('Finaliser la campagne').click();
    
    // Vérifier l'état de chargement
    cy.contains('Finalisation...', { timeout: 3000 }).should('be.visible');
  });

  it('Devrait naviguer vers l\'étape précédente', () => {
    cy.contains('Retour').click();
    cy.url().should('include', '/brands/auth/campagne3');
  });

  it('Devrait afficher les icônes et éléments visuels', () => {
    // Vérifier la présence d'icônes
    cy.get('svg', { timeout: 5000 }).should('have.length.greaterThan', 0);
    
    // Vérifier les éléments de design
    cy.get('.bg-gradient-to-r, .bg-[#ceaf4a]', { timeout: 5000 }).should('exist');
  });

  it('Devrait afficher le formulaire correctement', () => {
    cy.get('form, .form-container', { timeout: 5000 }).should('exist');
    cy.get('*').should('have.length.greaterThan', 0);
  });

  it('Devrait gérer les entrées vides', () => {
    cy.get('input[placeholder*="budget"]').should('have.value', '');
    cy.contains('Finaliser la campagne').click();
    
    // Devrait afficher une erreur ou ne pas soumettre
    cy.url().should('include', '/brands/auth/campagne4');
  });

  it('Devrait afficher les informations sur la monnaie', () => {
    cy.contains('CFA', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait être responsive', () => {
    // Test mobile
    cy.viewport(375, 667);
    cy.contains('Étape 4').should('be.visible');
    cy.get('input[placeholder*="budget"]').should('be.visible');
    
    // Test desktop
    cy.viewport(1280, 720);
    cy.contains('Étape 4').should('be.visible');
    cy.get('input[placeholder*="budget"]').should('be.visible');
  });
});
