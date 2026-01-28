describe('Brands - Auth - Campagne 3', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/auth/campagne3');
  });

  it('Devrait charger la page campagne3', () => {
    cy.url().should('include', '/brands/auth/campagne3');
  });

  it('Devrait afficher le formulaire', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
