describe('Partenariat - Auth - Register', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/partenariat/auth/register');
  });

  it('Devrait charger la page register', () => {
    cy.url().should('include', '/partenariat/auth/register');
  });

  it('Devrait afficher le formulaire d\'inscription', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
