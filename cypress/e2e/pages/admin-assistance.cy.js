describe('Admin - Assistance Management', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visiter la page avec un délai plus long pour le chargement
    cy.visit('http://localhost:3000/admin/assistance', { 
      timeout: 10000,
      retryOnNetworkFailure: true 
    });
  });

  it('Devrait charger la page d\'assistance', () => {
    cy.url({ timeout: 10000 }).should('include', '/admin/assistance');
  });

  it('Devrait afficher le titre de la page', () => {
    cy.contains('Demandes d\'assistance', { timeout: 5000 }).should('be.visible');
    cy.contains('Marques ayant demandé de l\'aide pour créer une campagne').should('be.visible');
  });

  it('Devrait afficher les boutons de filtrage', () => {
    cy.contains(/Toutes \(/, { timeout: 5000 }).should('be.visible');
    cy.contains('En attente').should('be.visible');
    cy.contains('En cours').should('be.visible');
    cy.contains('Terminées').should('be.visible');
  });

  it('Devrait afficher le bouton d\'actualisation', () => {
    cy.contains('Actualiser', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les demandes d\'assistance', () => {
    // Attendre que les cartes de demandes se chargent
    cy.get('.grid.grid-cols-1.gap-4 > div', { timeout: 8000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les informations de la marque dans chaque demande', () => {
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      cy.get('h3').should('exist'); // Nom de la marque
      cy.get('body').should('contain', '@'); // Email de la marque
    });
  });

  it('Devrait afficher les statuts des demandes', () => {
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      // Vérifier la présence d'un badge de statut
      cy.get('span').should('have.class', 'px-3'); // Badge de statut
    });
  });

  it('Devrait afficher les dates des demandes', () => {
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      cy.contains('Demandé le').should('be.visible');
    });
  });

  it('Devrait filtrer par statut "En attente"', () => {
    cy.contains('En attente').click();
    cy.url().should('include', '/admin/assistance');
    // Le filtre devrait être actif
    cy.contains('En attente').should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait filtrer par statut "En cours"', () => {
    cy.contains('En cours').click();
    cy.url().should('include', '/admin/assistance');
    cy.contains('En cours').should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait filtrer par statut "Terminées"', () => {
    cy.contains('Terminées').click();
    cy.url().should('include', '/admin/assistance');
    cy.contains('Terminées').should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait afficher "Toutes" par défaut', () => {
    cy.contains(/Toutes \(/).should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait afficher les boutons d\'action pour les demandes en attente', () => {
    // Cliquer sur le filtre "En attente" pour voir les demandes en attente
    cy.contains('En attente').click();
    
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      cy.contains('Prendre en charge').should('be.visible');
      cy.contains('Annuler').should('be.visible');
    });
  });

  it('Devrait afficher les boutons d\'action pour les demandes en cours', () => {
    // Cliquer sur le filtre "En cours" pour voir les demandes en cours
    cy.contains('En cours').click();
    
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      cy.contains('Marquer comme terminée').should('be.visible');
      cy.contains('Annuler').should('be.visible');
    });
  });

  it('Devrait afficher les boutons d\'action pour les demandes terminées', () => {
    // Cliquer sur le filtre "Terminées" pour voir les demandes terminées
    cy.contains('Terminées').click();
    
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      cy.contains('Rouvrir').should('be.visible');
    });
  });

  it('Devrait afficher le loader pendant le chargement', () => {
    // Recharger la page pour voir le loader
    cy.visit('http://localhost:3000/admin/assistance');
    cy.get('.animate-spin').should('exist');
    // Le loader devrait disparaître après le chargement
    cy.get('.animate-spin', { timeout: 5000 }).should('not.exist');
  });

  it('Devrait afficher le message quand aucune demande n\'est trouvée', () => {
    // Si aucune demande n'est trouvée, le message devrait apparaître
    cy.get('body').then($body => {
      if ($body.find('.text-center.py-12').length > 0) {
        cy.contains('Aucune demande d\'assistance').should('be.visible');
      }
    });
  });

  it('Devrait afficher les icônes de statut', () => {
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      // Vérifier la présence d'icônes de statut
      cy.get('svg').should('exist');
    });
  });

  it('Devrait afficher les informations de contact', () => {
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      // Vérifier la présence des icônes de contact
      cy.get('body').should('contain', '@'); // Email
      // Le téléphone peut ne pas être toujours présent
    });
  });

  it('Devrait actualiser les données', () => {
    cy.contains('Actualiser').click();
    // La page devrait se recharger et afficher les données
    cy.url().should('include', '/admin/assistance');
  });

  it('Devrait afficher les dates formatées correctement', () => {
    cy.get('.grid.grid-cols-1.gap-4 > div').first().within(() => {
      // Vérifier que les dates sont formatées en français
      cy.contains(/\d{1,2} \w{3,4} \d{4}/).should('be.visible'); // Format: "1 janv. 2024"
    });
  });
});
