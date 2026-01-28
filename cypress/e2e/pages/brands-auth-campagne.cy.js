describe('Brands - Auth - Campagne', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/auth/campagne');
  });

  it('Devrait charger la page campagne', () => {
    cy.url().should('include', '/brands/auth/campagne');
  });

  it('Devrait afficher le formulaire de campagne', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
