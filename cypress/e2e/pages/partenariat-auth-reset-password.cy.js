describe('Partenariat - Auth - Reset Password', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/partenariat/auth/reset-password');
  });

  it('Devrait charger la page reset-password', () => {
    cy.url().should('include', '/partenariat/auth/reset-password');
  });

  it('Devrait afficher le formulaire', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
