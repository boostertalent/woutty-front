describe('Admin - Dashboard', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visiter la page avec un délai plus long pour le chargement
    cy.visit('http://localhost:3000/admin/dashboard', { 
      timeout: 10000,
      retryOnNetworkFailure: true 
    });
  });

  it('Devrait charger le dashboard admin', () => {
    cy.url({ timeout: 10000 }).should('include', '/admin/dashboard');
  });

  it('Devrait afficher les éléments du dashboard', () => {
    // Attendre que les éléments principaux soient chargés
    cy.get('[data-testid="admin-dashboard"]', { timeout: 8000 }).should('exist');
    cy.get('h1, h2', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait avoir le titre du dashboard', () => {
    cy.get('h1, h2', { timeout: 5000 }).should('have.length.greaterThan', 0);
    cy.contains(/dashboard|administration|panel/i, { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les statistiques principales', () => {
    cy.get('[data-testid="stats-container"]', { timeout: 8000 }).should('exist');
    cy.get('[data-testid="user-count"]', { timeout: 5000 }).should('exist');
  });
});
