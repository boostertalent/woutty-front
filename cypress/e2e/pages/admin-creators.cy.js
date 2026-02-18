describe('Admin - Creators Management', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visiter la page avec un délai plus long pour le chargement
    cy.visit('http://localhost:3000/admin/creators', { 
      timeout: 10000,
      retryOnNetworkFailure: true 
    });
  });

  it('Devrait charger la page de gestion des créateurs', () => {
    cy.url({ timeout: 10000 }).should('include', '/admin/creators');
  });

  it('Devrait afficher le titre de la page', () => {
    cy.contains('👥 Gestion des créateurs', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher le tableau des créateurs', () => {
    cy.get('table', { timeout: 8000 }).should('exist');
    cy.get('th').should('contain', 'Créateur');
    cy.get('th').should('contain', 'Email');
    cy.get('th').should('contain', 'Téléphone');
    cy.get('th').should('contain', 'Inscription');
    cy.get('th').should('contain', 'Actions');
  });

  it('Devrait afficher le bouton créer un créateur', () => {
    cy.contains('Créer un créateur', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les boutons de filtrage', () => {
    cy.contains(/Tous \(/, { timeout: 5000 }).should('be.visible');
    cy.contains('⚡ Actifs').should('be.visible');
    cy.contains('🏆 Top 10').should('be.visible');
  });

  it('Devrait afficher "Tous" par défaut', () => {
    cy.contains(/Tous \(/).should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait filtrer par "Actifs"', () => {
    cy.contains('⚡ Actifs').click();
    cy.url().should('include', '/admin/creators');
    cy.contains('⚡ Actifs').should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait filtrer par "Top 10"', () => {
    cy.contains('🏆 Top 10').click();
    cy.url().should('include', '/admin/creators');
    cy.contains('🏆 Top 10').should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait afficher les informations des créateurs', () => {
    // Vérifier que les informations des créateurs sont affichées
    cy.get('td').should('contain.length.greaterThan', 0);
    cy.get('td').should('contain', '@'); // Vérifier les emails
  });

  it('Devrait afficher les avatars des créateurs', () => {
    cy.get('table').find('td').first().find('.bg-gray-200').should('exist');
  });

  it('Devrait afficher les IDs des créateurs', () => {
    cy.get('td').should('contain.text', 'ID:');
  });

  it('Devrait afficher les boutons d\'action', () => {
    cy.get('button').contains('Voir').should('have.length.greaterThan', 0);
    cy.get('button').contains('Supprimer').should('have.length.greaterThan', 0);
  });

  it('Devrait ouvrir la modal de confirmation pour la suppression', () => {
    cy.get('button').contains('Supprimer').first().click();
    cy.contains('🔐 Confirmation requise', { timeout: 3000 }).should('be.visible');
    cy.contains('Entrez votre mot de passe pour confirmer cette suppression.').should('be.visible');
  });

  it('Devrait fermer la modal de confirmation avec Annuler', () => {
    cy.get('button').contains('Supprimer').first().click();
    cy.contains('Annuler').click();
    cy.contains('🔐 Confirmation requise').should('not.exist');
  });

  it('Devrait naviguer vers la création de créateur', () => {
    cy.contains('Créer un créateur').click();
    cy.url({ timeout: 5000 }).should('include', '/creators/auth/profil');
  });

  it('Devrait afficher le loader pendant le chargement', () => {
    // Recharger la page pour voir le loader
    cy.visit('http://localhost:3000/admin/creators');
    cy.get('.animate-spin').should('exist');
    // Le loader devrait disparaître après le chargement
    cy.get('.animate-spin', { timeout: 5000 }).should('not.exist');
  });

  it('Devrait afficher les dates formatées correctement', () => {
    cy.get('table').find('tr').should('have.length.greaterThan', 1);
    cy.get('td').should('contain.text', /\d{1,2} \w{3,4} \d{4}/); // Format: "1 janv. 2024"
  });

  it('Devrait afficher le message quand aucun créateur n\'est trouvé', () => {
    cy.get('body').then($body => {
      if ($body.find('td[colspan="5"]').length > 0) {
        cy.contains('Aucun créateur trouvé').should('be.visible');
      }
    });
  });

  it('Devrait afficher les initiales dans les avatars quand pas d\'image', () => {
    cy.get('table').find('td').first().within(() => {
      cy.get('.bg-gray-200').should('exist');
      // Vérifier que les initiales sont affichées
      cy.get('.bg-gray-200').find('div').should('contain.text', /^[A-Z?]$/);
    });
  });

  it('Devrait gérer le clic sur le bouton Voir', () => {
    // Intercepter la navigation pour vérifier que localStorage est utilisé
    cy.window().then((win) => {
      cy.spy(win.localStorage, 'setItem');
    });

    cy.get('button').contains('Voir').first().click();
    
    // Vérifier que les valeurs sont stockées dans localStorage
    cy.window().then((win) => {
      expect(win.localStorage.setItem).toHaveBeenCalledWith('admin_viewing_creator', Cypress.sinon.match.string);
      expect(win.localStorage.setItem).toHaveBeenCalledWith('admin_mode', 'view');
      expect(win.localStorage.setItem).toHaveBeenCalledWith('hide_profile_section', 'true');
    });
  });

  it('Devrait afficher les téléphones ou un tiret si absent', () => {
    cy.get('table').find('tr').should('have.length.greaterThan', 1);
    // Vérifier que soit un numéro de téléphone soit un tiret est affiché
    cy.get('td').contains(/(\+?\d+|-)/).should('exist');
  });

  it('Devrait afficher les images des avatars si présentes', () => {
    cy.get('table').find('td').first().within(() => {
      cy.get('.bg-gray-200').then($avatar => {
        if ($avatar.find('img').length > 0) {
          cy.get('img').should('have.attr', 'src');
        } else {
          // Si pas d'image, vérifier les initiales
          cy.get('.bg-gray-200').find('div').should('contain.text', /^[A-Z?]$/);
        }
      });
    });
  });

  it('Devrait afficher les noms des créateurs correctement', () => {
    cy.get('table').find('tr').should('have.length.greaterThan', 1);
    cy.get('td').find('p.font-bold').should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les emails des créateurs correctement', () => {
    cy.get('table').find('tr').should('have.length.greaterThan', 1);
    cy.get('td').should('contain.text', '@');
    cy.get('td').should('contain.text', '.');
  });
});
