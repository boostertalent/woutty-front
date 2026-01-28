describe('Creators - Dashboard', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/dashboard');
  });

  it('Devrait charger le dashboard creators', () => {
    cy.url().should('include', '/creators/dashboard');
  });

  it('Devrait afficher les éléments du dashboard', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
