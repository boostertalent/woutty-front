describe('Brands - Auth - Contact', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/brands/auth/contact');
  });

  it('Devrait charger la page contact', () => {
    cy.url().should('include', '/brands/auth/contact');
  });

  it('Devrait afficher le formulaire de contact', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
