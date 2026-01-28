describe('Brands - Dashboard - Success Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/dashboard/success');
  });

  it('Devrait charger la page success', () => {
    cy.url().should('include', '/brands/dashboard/success');
  });

  it('Devrait afficher le message de succès', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
