describe('Auth - Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth/forgot-password');
  });

  it('Devrait charger la page forgot-password', () => {
    cy.url().should('include', '/auth/forgot-password');
  });

  it('Devrait afficher le formulaire de récupération', () => {
    cy.get('input[type="email"], input[name*="email"]').should('exist');
  });

  it('Devrait afficher un bouton d\'envoi', () => {
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('Devrait avoir un lien vers la page de connexion', () => {
    cy.contains('a', /login|back/i).should('exist');
  });
});
