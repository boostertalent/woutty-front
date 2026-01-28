describe('Partenariat - Auth - Login', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/partenariat/auth/login');
  });

  it('Devrait charger la page login partenariat', () => {
    cy.url().should('include', '/partenariat/auth/login');
  });

  it('Devrait afficher le formulaire de connexion', () => {
    cy.get('input[type="email"], input[name*="email"]').should('exist');
  });
});
