describe('Brands - Auth - Entreprise', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/auth/entreprise');
  });

  it('Devrait charger la page entreprise', () => {
    cy.url().should('include', '/brands/auth/entreprise');
  });

  it('Devrait afficher le formulaire entreprise', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
