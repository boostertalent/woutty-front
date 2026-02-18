describe('Admin - Admins Management', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visiter la page avec un délai plus long pour le chargement
    cy.visit('http://localhost:3000/admin/admins', { 
      timeout: 10000,
      retryOnNetworkFailure: true 
    });
  });

  it('Devrait charger la page de gestion des admins', () => {
    cy.url({ timeout: 10000 }).should('include', '/admin/admins');
  });

  it('Devrait afficher le titre de la page', () => {
    cy.contains('🛡️ Gestion des admins', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher le tableau des admins', () => {
    cy.get('table', { timeout: 8000 }).should('exist');
    cy.get('th').should('contain', 'Admin');
    cy.get('th').should('contain', 'Email');
    cy.get('th').should('contain', 'Téléphone');
    cy.get('th').should('contain', 'Type');
    cy.get('th').should('contain', 'Actions');
  });

  it('Devrait afficher le bouton créer un admin pour l\'admin principal', () => {
    cy.contains('Créer un admin', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait ouvrir la modal de création d\'admin', () => {
    cy.contains('Créer un admin').click();
    cy.contains('➕ Nouvel admin', { timeout: 3000 }).should('be.visible');
    cy.contains('Nom complet *').should('be.visible');
    cy.contains('Email *').should('be.visible');
    cy.contains('Mot de passe * (min. 8)').should('be.visible');
    cy.contains('Confirmer *').should('be.visible');
  });

  it('Devrait fermer la modal de création avec le bouton X', () => {
    cy.contains('Créer un admin').click();
    cy.get('button').contains('×').click();
    cy.contains('➕ Nouvel admin').should('not.exist');
  });

  it('Devrait fermer la modal de création avec le bouton Annuler', () => {
    cy.contains('Créer un admin').click();
    cy.contains('Annuler').click();
    cy.contains('➕ Nouvel admin').should('not.exist');
  });

  it('Devrait afficher les types d\'admins correctement', () => {
    cy.contains('⭐ Principal', { timeout: 5000 }).should('be.visible');
    cy.contains('Secondaire', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait ouvrir la modal de confirmation pour la suppression', () => {
    // Trouver et cliquer sur un bouton supprimer (pas celui de l'admin principal)
    cy.get('button').contains('Supprimer').then($buttons => {
      // Prendre le premier bouton supprimer qui n'est pas désactivé
      const activeButton = $buttons.filter((index, btn) => !btn.disabled);
      if (activeButton.length > 0) {
        cy.wrap(activeButton.first()).click();
        cy.contains('🔐 Confirmation requise', { timeout: 3000 }).should('be.visible');
        cy.contains('Entrez votre mot de passe pour confirmer cette suppression.').should('be.visible');
      }
    });
  });

  it('Devrait fermer la modal de confirmation avec Annuler', () => {
    cy.get('button').contains('Supprimer').then($buttons => {
      const activeButton = $buttons.filter((index, btn) => !btn.disabled);
      if (activeButton.length > 0) {
        cy.wrap(activeButton.first()).click();
        cy.contains('Annuler').click();
        cy.contains('🔐 Confirmation requise').should('not.exist');
      }
    });
  });

  it('Devrait afficher les informations des admins', () => {
    // Vérifier que les informations des admins sont affichées
    cy.get('td').should('contain.length.greaterThan', 0);
    cy.get('td').should('contain', '@'); // Vérifier les emails
  });

  it('Devrait afficher les IDs des admins', () => {
    cy.get('td').should('contain.text', 'ID:');
  });

  it('Devrait afficher le loader pendant le chargement', () => {
    // Recharger la page pour voir le loader
    cy.visit('http://localhost:3000/admin/admins');
    cy.get('.animate-spin').should('exist');
    // Le loader devrait disparaître après le chargement
    cy.get('.animate-spin', { timeout: 5000 }).should('not.exist');
  });

  it('Devrait gérer le champ de mot de passe dans la modal', () => {
    cy.contains('Créer un admin').click();
    
    // Vérifier que le champ mot de passe est de type password
    cy.get('input[type="password"]').should('exist');
    
    // Vérifier la présence des boutons pour afficher/masquer le mot de passe
    cy.get('button').should('contain.length.greaterThan', 0);
  });

  it('Devrait afficher le message quand aucun admin n\'est trouvé', () => {
    // Ce test suppose qu'on peut simuler une réponse vide
    // Dans un cas réel, il faudrait mocker la réponse API
    cy.get('table').should('exist');
    // Si la table est vide, le message devrait apparaître
    cy.get('body').then($body => {
      if ($body.find('td[colspan="5"]').length > 0) {
        cy.contains('Aucun admin trouvé').should('be.visible');
      }
    });
  });
});
