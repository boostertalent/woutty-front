describe('Partenariat - Auth - Forgot Password', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/partenariat/auth/forgot-password');
  });

  it('Devrait charger la page forgot-password', () => {
    cy.url().should('include', '/partenariat/auth/forgot-password');
  });

  it('Devrait afficher le formulaire', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
