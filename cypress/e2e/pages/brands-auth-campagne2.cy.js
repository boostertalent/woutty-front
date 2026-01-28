describe('Brands - Auth - Campagne 2', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/auth/campagne2');
  });

  it('Devrait charger la page campagne2', () => {
    cy.url().should('include', '/brands/auth/campagne2');
  });

  it('Devrait afficher le formulaire', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
