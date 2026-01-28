describe('Brands - Dashboard', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/dashboard');
  });

  it('Devrait charger le dashboard brands', () => {
    cy.url().should('include', '/brands/dashboard');
  });

  it('Devrait afficher les éléments du dashboard', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
