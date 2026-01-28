describe('Public - Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/public');
  });

  it('Devrait charger la page public', () => {
    cy.url().should('include', '/public');
  });

  it('Devrait afficher le contenu', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
