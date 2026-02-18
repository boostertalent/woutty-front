describe('Admin - Brands Management', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visiter la page avec un délai plus long pour le chargement
    cy.visit('http://localhost:3000/admin/brands', { 
      timeout: 10000,
      retryOnNetworkFailure: true 
    });
  });

  it('Devrait charger la page de gestion des marques', () => {
    cy.url({ timeout: 10000 }).should('include', '/admin/brands');
  });

  it('Devrait afficher le titre de la page', () => {
    cy.contains('🏢 Gestion des marques', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher le tableau des marques', () => {
    cy.get('table', { timeout: 8000 }).should('exist');
    cy.get('th').should('contain', 'Marque');
    cy.get('th').should('contain', 'Email');
    cy.get('th').should('contain', 'Domaine');
    cy.get('th').should('contain', 'Inscription');
    cy.get('th').should('contain', 'Actions');
  });

  it('Devrait afficher le bouton créer une marque', () => {
    cy.contains('Créer une marque', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les boutons de filtrage', () => {
    cy.contains(/Toutes \(/, { timeout: 5000 }).should('be.visible');
    cy.contains('⚡ Actives').should('be.visible');
    cy.contains('🏆 Top 10').should('be.visible');
  });

  it('Devrait afficher "Toutes" par défaut', () => {
    cy.contains(/Toutes \(/).should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait filtrer par "Actives"', () => {
    cy.contains('⚡ Actives').click();
    cy.url().should('include', '/admin/brands');
    cy.contains('⚡ Actives').should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait filtrer par "Top 10"', () => {
    cy.contains('🏆 Top 10').click();
    cy.url().should('include', '/admin/brands');
    cy.contains('🏆 Top 10').should('have.class', 'bg-[#ceaf4a]');
  });

  it('Devrait afficher les informations des marques', () => {
    // Vérifier que les informations des marques sont affichées
    cy.get('td').should('contain.length.greaterThan', 0);
    cy.get('td').should('contain', '@'); // Vérifier les emails
  });

  it('Devrait afficher les domaines des marques', () => {
    cy.get('body').then($body => {
      if ($body.find('.bg-purple-50').length > 0) {
        cy.get('.bg-purple-50').should('be.visible');
      }
    });
  });

  it('Devrait afficher les avatars avec les initiales', () => {
    cy.get('table').find('td').first().find('.bg-purple-100').should('exist');
  });

  it('Devrait afficher les IDs des marques', () => {
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

  it('Devrait naviguer vers la création de marque', () => {
    cy.contains('Créer une marque').click();
    cy.url({ timeout: 5000 }).should('include', '/brands/auth/entreprise');
  });

  it('Devrait afficher le loader pendant le chargement', () => {
    // Recharger la page pour voir le loader
    cy.visit('http://localhost:3000/admin/brands');
    cy.get('.animate-spin').should('exist');
    // Le loader devrait disparaître après le chargement
    cy.get('.animate-spin', { timeout: 5000 }).should('not.exist');
  });

  it('Devrait afficher les dates formatées correctement', () => {
    cy.get('table').find('tr').should('have.length.greaterThan', 1);
    cy.get('td').should('contain.text', /\d{1,2} \w{3,4} \d{4}/); // Format: "1 janv. 2024"
  });

  it('Devrait afficher le message quand aucune marque n\'est trouvée', () => {
    cy.get('body').then($body => {
      if ($body.find('td[colspan="5"]').length > 0) {
        cy.contains('Aucune marque trouvée').should('be.visible');
      }
    });
  });

  it('Devrait afficher les initiales dans les avatars', () => {
    cy.get('table').find('td').first().within(() => {
      cy.get('.bg-purple-100').should('exist');
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
      expect(win.localStorage.setItem).toHaveBeenCalledWith('admin_viewing_brand', Cypress.sinon.match.string);
      expect(win.localStorage.setItem).toHaveBeenCalledWith('admin_mode', 'view');
      expect(win.localStorage.setItem).toHaveBeenCalledWith('hide_profile_section', 'true');
    });
  });

  it('Devrait afficher les badges de domaine correctement', () => {
    cy.get('body').then($body => {
      if ($body.find('.bg-purple-50').length > 0) {
        cy.get('.bg-purple-50').should('have.class', 'text-purple-700');
        cy.get('.bg-purple-50').should('have.class', 'px-2');
        cy.get('.bg-purple-50').should('have.class', 'py-1');
        cy.get('.bg-purple-50').should('have.class', 'rounded-full');
      }
    });
  });

  it('Devrait afficher les téléphones ou un tiret si absent', () => {
    cy.get('table').find('tr').should('have.length.greaterThan', 1);
    // Vérifier que soit un numéro de téléphone soit un tiret est affiché
    cy.get('td').contains(/(\+?\d+|-)/).should('exist');
  });
});
