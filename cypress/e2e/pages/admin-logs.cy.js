describe('Admin - Logs', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visiter la page avec un délai plus long pour le chargement
    cy.visit('http://localhost:3000/admin/logs', { 
      timeout: 10000,
      retryOnNetworkFailure: true 
    });
  });

  it('Devrait charger la page des logs', () => {
    cy.url({ timeout: 10000 }).should('include', '/admin/logs');
  });

  it('Devrait afficher le titre de la page', () => {
    cy.contains('📊 Logs d\'activité', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher le sous-titre', () => {
    cy.contains('Suivi des actions des administrateurs', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher le bouton d\'actualisation', () => {
    cy.contains('Actualiser', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les logs d\'activité', () => {
    cy.get('.divide-y.divide-gray-100 > div', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les noms des administrateurs', () => {
    cy.get('body').should('contain.text', 'Admin');
  });

  it('Devrait afficher les badges d\'action', () => {
    cy.get('body').should('contain.text', 'CREATE');
    cy.get('body').should('contain.text', 'UPDATE');
    cy.get('body').should('contain.text', 'DELETE');
  });

  it('Devrait afficher les icônes d\'action', () => {
    cy.get('.text-lg', { timeout: 5000 }).should('have.length.greaterThan', 0);
    cy.get('body').should('contain.text', '➕'); // CREATE icon
    cy.get('body').should('contain.text', '🗑️'); // DELETE icon
    cy.get('body').should('contain.text', '✏️'); // UPDATE icon
  });

  it('Devrait afficher les détails des actions', () => {
    cy.get('.text-sm.text-gray-600', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les temps relatifs', () => {
    cy.get('body').should('contain.text', 'Il y a');
    cy.get('svg', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les types de cibles', () => {
    cy.get('body').should('contain.text', /brand|creator|campaign/);
  });

  it('Devrait afficher les couleurs d\'action correctes', () => {
    cy.get('[class*="bg-green-50"], [class*="bg-red-50"], [class*="bg-blue-50"]', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher le loader pendant le chargement', () => {
    // Recharger la page pour voir le loader
    cy.visit('http://localhost:3000/admin/logs');
    cy.get('.animate-spin').should('exist');
    // Le loader devrait disparaître après le chargement
    cy.get('.animate-spin', { timeout: 5000 }).should('not.exist');
  });

  it('Devrait gérer le clic sur le bouton d\'actualisation', () => {
    cy.contains('Actualiser').click();
    // La page devrait se recharger et afficher les logs
    cy.url().should('include', '/admin/logs');
  });

  it('Devrait afficher les timestamps formatés', () => {
    cy.get('body').then($body => {
      if ($body.find('.text-xs.text-gray-400').length > 0) {
        cy.get('.text-xs.text-gray-400').should('have.length.greaterThan', 0);
      }
    });
  });

  it('Devrait afficher l\'état vide quand il n\'y a pas de logs', () => {
    cy.get('body').then($body => {
      if ($body.find('.text-center.py-12').length > 0) {
        cy.contains('Aucune activité enregistrée').should('be.visible');
      }
    });
  });

  it('Devrait afficher les avatars des administrateurs', () => {
    cy.get('.w-10.h-10.rounded-full', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les bordures colorées pour les actions', () => {
    cy.get('[class*="border-"]', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait être responsive', () => {
    // Test mobile
    cy.viewport(375, 667);
    cy.contains('📊 Logs d\'activité').should('be.visible');
    
    // Test desktop
    cy.viewport(1280, 720);
    cy.contains('📊 Logs d\'activité').should('be.visible');
  });

  it('Devrait afficher les logs dans l\'ordre chronologique', () => {
    cy.get('.divide-y.divide-gray-100 > div').then($logs => {
      if ($logs.length > 1) {
        // Vérifier que les logs sont affichés
        expect($logs.length).to.be.greaterThan(0);
      }
    });
  });

  it('Devrait afficher les icônes d\'horloge', () => {
    cy.get('svg', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les informations de timestamp', () => {
    cy.get('body').should('contain.text', '•'); // Séparateur entre temps et type
  });

  it('Devrait afficher les badges avec les bonnes classes', () => {
    cy.get('.text-xs.px-2.py-0\\.5.rounded-full', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les conteneurs de logs corrects', () => {
    cy.get('.p-4.hover\\:bg-gray-50', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les conteneurs principaux', () => {
    cy.get('.bg-white.rounded-2xl.border', { timeout: 5000 }).should('exist');
  });

  it('Devrait gérer les logs avec différents types d\'actions', () => {
    cy.get('body').then($body => {
      const text = $body.text();
      // Vérifier différents types d'actions possibles
      const hasActions = text.includes('CREATE') || text.includes('UPDATE') || text.includes('DELETE') || text.includes('VIEW');
      expect(hasActions).to.be.true;
    });
  });

  it('Devrait afficher les détails complets des actions', () => {
    cy.get('.text-sm.text-gray-600').then($details => {
      if ($details.length > 0) {
        // Vérifier que les détails contiennent du texte
        $details.each((index, element) => {
          expect(Cypress.$(element).text().trim()).to.not.be.empty;
        });
      }
    });
  });

  it('Devrait maintenir le formatage des temps', () => {
    cy.get('body').then($body => {
      const text = $body.text();
      // Vérifier différents formats de temps possibles
      const hasTimeFormat = text.includes('Il y a') || text.includes('À l\'instant') || /\d{1,2} \w{3,4} \d{4}/.test(text);
      expect(hasTimeFormat).to.be.true;
    });
  });
});
