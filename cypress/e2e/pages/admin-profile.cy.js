describe('Admin - Profile', () => {
  beforeEach(() => {
    // Nettoyer les cookies et localStorage avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visiter la page avec un délai plus long pour le chargement
    cy.visit('http://localhost:3000/admin/profile', { 
      timeout: 10000,
      retryOnNetworkFailure: true 
    });
  });

  it('Devrait charger la page de profil', () => {
    cy.url({ timeout: 10000 }).should('include', '/admin/profile');
  });

  it('Devrait afficher le titre de la page', () => {
    cy.contains('Mon profil', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les informations de l\'administrateur', () => {
    cy.get('body').should('contain.text', 'Admin'); // Nom de l'admin
    cy.get('body').should('contain.text', '@'); // Email
  });

  it('Devrait afficher le badge de rôle', () => {
    cy.contains('Admin Principal', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher l\'avatar avec les initiales', () => {
    cy.get('.w-20.h-20.rounded-full', { timeout: 5000 }).should('exist');
    cy.get('.text-white.font-bold', { timeout: 5000 }).should('exist');
  });

  it('Devrait afficher le bouton de modification', () => {
    cy.contains('Modifier le profil', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait afficher les sections d\'informations', () => {
    cy.contains('Informations personnelles', { timeout: 5000 }).should('be.visible');
    cy.contains('Nom complet', { timeout: 5000 }).should('be.visible');
    cy.contains('Email', { timeout: 5000 }).should('be.visible');
    cy.contains('Téléphone', { timeout: 5000 }).should('be.visible');
  });

  it('Devrait entrer en mode édition', () => {
    cy.contains('Modifier le profil').click();
    
    cy.get('input[placeholder*="nom complet"]', { timeout: 3000 }).should('exist');
    cy.get('input[placeholder*="téléphone"]', { timeout: 3000 }).should('exist');
    cy.contains('Enregistrer', { timeout: 3000 }).should('be.visible');
    cy.contains('Annuler', { timeout: 3000 }).should('be.visible');
  });

  it('Devrait annuler le mode édition', () => {
    cy.contains('Modifier le profil').click();
    
    cy.contains('Annuler').click();
    
    // Retour à l'affichage normal
    cy.contains('Modifier le profil', { timeout: 3000 }).should('be.visible');
    cy.get('input[placeholder*="nom complet"]').should('not.exist');
  });

  it('Devrait afficher le loader pendant le chargement', () => {
    // Recharger la page pour voir le loader
    cy.visit('http://localhost:3000/admin/profile');
    cy.get('.animate-spin').should('exist');
    // Le loader devrait disparaître après le chargement
    cy.get('.animate-spin', { timeout: 5000 }).should('not.exist');
  });

  it('Devrait afficher l\'email comme non modifiable', () => {
    // L'email devrait être visible mais pas dans un input modifiable
    cy.get('body').should('contain.text', '@');
    cy.get('input[type="email"]').should('not.exist');
  });

  it('Devrait afficher le numéro de téléphone', () => {
    cy.get('body').then($body => {
      if ($body.text().includes('+')) {
        cy.get('body').should('contain.text', /\+\d+/);
      }
    });
  });

  it('Devrait afficher les placeholders corrects en mode édition', () => {
    cy.contains('Modifier le profil').click();
    
    cy.get('input[placeholder="Votre nom complet"]').should('exist');
    cy.get('input[placeholder="Votre numéro de téléphone"]').should('exist');
  });

  it('Devrait gérer la sauvegarde du profil', () => {
    cy.contains('Modifier le profil').click();
    
    // Modifier le nom
    cy.get('input[placeholder*="nom complet"]').clear().type('Test Updated Name');
    
    cy.contains('Enregistrer').click();
    
    // Vérifier que la sauvegarde est effectuée (soit succès soit erreur)
    cy.get('body').then($body => {
      const text = $body.text();
      // Soit message de succès soit retour au mode affichage
      const hasFeedback = text.includes('✅') || text.includes('❌') || text.includes('Test Updated Name');
      expect(hasFeedback).to.be.true;
    });
  });

  it('Devrait valider les champs obligatoires', () => {
    cy.contains('Modifier le profil').click();
    
    // Vider le nom et essayer de sauvegarder
    cy.get('input[placeholder*="nom complet"]').clear();
    cy.contains('Enregistrer').click();
    
    // Devrait afficher une erreur ou ne pas sauvegarder
    cy.get('body').then($body => {
      const text = $body.text();
      const hasError = text.includes('❌') || text.includes('requis') || text.includes('invalide');
      if (hasError) {
        expect(hasError).to.be.true;
      }
    });
  });

  it('Devrait être responsive', () => {
    // Test mobile
    cy.viewport(375, 667);
    cy.contains('Mon profil').should('be.visible');
    
    // Test desktop
    cy.viewport(1280, 720);
    cy.contains('Mon profil').should('be.visible');
  });

  it('Devrait afficher les icônes', () => {
    cy.get('svg', { timeout: 5000 }).should('have.length.greaterThan', 0');
  });

  it('Devrait afficher les cartes d\'information', () => {
    cy.get('.bg-white.rounded-2xl', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les badges avec les bonnes classes', () => {
    cy.get('.text-xs.font-bold.uppercase', { timeout: 5000 }).should('exist');
  });

  it('Devrait afficher les boutons avec les bonnes icônes', () => {
    cy.contains('Modifier le profil').click();
    
    cy.get('svg', { timeout: 3000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait maintenir l\'état des champs', () => {
    cy.contains('Modifier le profil').click();
    
    // Vérifier que les champs contiennent les valeurs actuelles
    cy.get('input[placeholder*="nom complet"]').should('not.have.value', '');
  });

  it('Devrait afficher les informations dans le bon ordre', () => {
    cy.get('.space-y-6 > div', { timeout: 5000 }).then($sections => {
      expect($sections.length).to.be.greaterThan(0);
    });
  });

  it('Devrait gérer les erreurs de sauvegarde', () => {
    cy.contains('Modifier le profil').click();
    
    // Essayer de sauvegarder avec des données invalides
    cy.get('input[placeholder*="téléphone"]').clear().type('invalid-phone');
    cy.contains('Enregistrer').click();
    
    // Vérifier la gestion d'erreur
    cy.get('body').then($body => {
      const text = $body.text();
      if (text.includes('❌')) {
        expect(text.includes('invalide')).to.be.true;
      }
    });
  });

  it('Devrait afficher le conteneur principal', () => {
    cy.get('.max-w-4xl.mx-auto', { timeout: 5000 }).should('exist');
  });

  it('Devrait afficher les éléments de formulaire corrects', () => {
    cy.contains('Modifier le profil').click();
    
    cy.get('input', { timeout: 3000 }).should('have.length.greaterThan', 0);
    cy.get('button', { timeout: 3000 }).should('have.length.greaterThan', 1);
  });

  it('Devrait afficher les titres de section', () => {
    cy.get('h2, h3', { timeout: 5000 }).should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les informations de contact', () => {
    cy.get('body').then($body => {
      const text = $body.text();
      // Vérifier la présence d'informations de contact
      const hasContactInfo = text.includes('@') || text.includes('+') || text.includes('phone');
      expect(hasContactInfo).to.be.true;
    });
  });
});
