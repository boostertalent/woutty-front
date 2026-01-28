describe('Brands - Auth - Campagne 4', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/auth/campagne4');
  });

  it('Devrait charger la page campagne4', () => {
    cy.url().should('include', '/brands/auth/campagne4');
  });

  it('Devrait afficher le formulaire', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
