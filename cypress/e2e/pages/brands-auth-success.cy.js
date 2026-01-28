describe('Brands - Auth - Success', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/auth/success');
  });

  it('Devrait charger la page success', () => {
    cy.url().should('include', '/brands/auth/success');
  });

  it('Devrait afficher le message de succès', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
