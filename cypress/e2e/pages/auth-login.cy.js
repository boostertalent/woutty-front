describe('Auth - Login Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth/login');
  });

  it('Devrait charger la page de connexion', () => {
    cy.url().should('include', '/auth/login');
  });

  it('Devrait afficher le formulaire de connexion', () => {
    cy.get('input[type="email"], input[name*="email"]').should('exist');
    cy.get('input[type="password"], input[name*="password"]').should('exist');
  });

  it('Devrait afficher un bouton de soumission', () => {
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('Devrait avoir un lien "Forgot Password"', () => {
    cy.contains('a', /forgot|password/i).should('exist');
  });
});
