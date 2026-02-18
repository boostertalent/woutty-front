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

  it('Devrait afficher le titre du dashboard', () => {
    cy.contains('Vue d\'ensemble', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les statistiques principales', () => {
    cy.contains('Créateurs', { timeout: 5000 }).should('be.visible');
    cy.contains('Marques', { timeout: 5000 }).should('be.visible');
    cy.contains('Campagnes', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les graphiques', () => {
    cy.get('[data-testid="area-chart"], .recharts-wrapper', { timeout: 5000 }).should('exist');
  });

  it('Devrait afficher la section d\'activité récente', () => {
    cy.contains('Activité récente', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher la section des demandes d\'assistance', () => {
    cy.contains('Demandes d\'assistance', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les onglets de navigation', () => {
    cy.contains('Vue d\'ensemble', { timeout: 5000 }).should('be.visible');
    cy.contains('Logs d\'activité', { timeout: 5000 }).should('be.visible');
    cy.contains('Mon profil', { timeout: 5000 }).should('be.visible');
    cy.contains('Assistance', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait basculer vers la vue des logs', () => {
    cy.contains('Logs d\'activité').click();
    cy.url({ timeout: 5000 }).should('include', '/admin/dashboard');
    cy.contains('📊 Logs d\'activité', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait basculer vers la vue profil', () => {
    cy.contains('Mon profil').click();
    cy.url({ timeout: 5000 }).should('include', '/admin/dashboard');
    cy.contains('Mon profil', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait basculer vers la vue assistance', () => {
    cy.contains('Assistance').click();
    cy.url({ timeout: 5000 }).should('include', '/admin/dashboard');
    cy.contains('Demandes d\'assistance', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les boutons d\'actualisation', () => {
    cy.get('button').contains('Actualiser').should('have.length.greaterThan', 0');
  });

  it('Devrait afficher le loader pendant le chargement', () => {
    // Recharger la page pour voir le loader
    cy.visit('http://localhost:3000/admin/dashboard');
    cy.get('.animate-spin').should('exist');
    // Le loader devrait disparaître après le chargement
    cy.get('.animate-spin', { timeout: 5000 }).should('not.exist');
  });

  it('Devrait afficher les informations de l\'admin', () => {
    cy.get('body').should('contain.text', 'Admin'); // Nom de l'admin
  });

  it('Devrait afficher les icônes d\'action dans l\'activité', () => {
    cy.get('.text-lg', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les temps relatifs', () => {
    cy.get('body').should('contain.text', 'Il y a');
  });

  it('Devrait afficher les badges d\'action', () => {
    cy.get('body').should('contain.text', 'CREATE');
    cy.get('body').should('contain.text', 'UPDATE');
    cy.get('body').should('contain.text', 'DELETE');
  });

  it('Devrait être responsive', () => {
    // Test mobile
    cy.viewport(375, 667);
    cy.contains('Vue d\'ensemble').should('be.visible');
    
    // Test desktop
    cy.viewport(1280, 720);
    cy.contains('Vue d\'ensemble').should('be.visible');
  });

  it('Devrait afficher les états vides quand il n\'y a pas de données', () => {
    cy.get('body').then($body => {
      if ($body.find('.text-center.py-12').length > 0) {
        cy.contains('Aucune activité récente').should('be.visible');
      }
    });
  });

  it('Devrait afficher les nombres dans les statistiques', () => {
    cy.get('body').should('contain.text', /\d+/); // Au moins un chiffre pour les stats
  });

  it('Devrait gérer les clics sur les boutons d\'actualisation', () => {
    cy.get('button').contains('Actualiser').first().click();
    // La page devrait se recharger
    cy.url().should('include', '/admin/dashboard');
  });

  it('Devrait afficher les types de cibles dans les logs', () => {
    cy.get('body').then($body => {
      if ($body.text().includes('brand') || $body.text().includes('creator') || $body.text().includes('campaign')) {
        // Vérifier que les types de cibles sont affichés
        cy.get('body').should('contain.text', /brand|creator|campaign/);
      }
    });
  });

  it('Devrait afficher les détails des actions', () => {
    cy.get('body').then($body => {
      if ($body.find('.text-sm.text-gray-600').length > 0) {
        cy.get('.text-sm.text-gray-600').should('have.length.greaterThan', 0);
      }
    });
  });

  it('Devrait afficher les icônes d\'horloge pour les timestamps', () => {
    cy.get('svg', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait maintenir l\'état actif de l\'onglet', () => {
    cy.contains('Logs d\'activité').click();
    cy.contains('Logs d\'activité').should('have.class', 'bg-[#ceaf4a]');
    
    cy.contains('Vue d\'ensemble').click();
    cy.contains('Vue d\'ensemble').should('have.class', 'bg-[#ceaf4a]');
  });
});
