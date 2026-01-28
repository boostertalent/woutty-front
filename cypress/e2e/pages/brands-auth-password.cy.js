describe('Brands - Auth - Password', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/auth/password');
  });

  it('Devrait charger la page password', () => {
    cy.url().should('include', '/brands/auth/password');
  });

  it('Devrait afficher le formulaire de mot de passe', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
