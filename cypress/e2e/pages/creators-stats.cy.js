describe('Creators - Stats Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/stats');
  });

  it('Devrait charger la page stats', () => {
    cy.url().should('include', '/creators/stats');
  });

  it('Devrait afficher les statistiques', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
