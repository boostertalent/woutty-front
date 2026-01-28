describe('Component - Process', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher le processus', () => {
    cy.get('section').should('have.length.greaterThan', 0);
  });

  it('Devrait afficher les étapes', () => {
    cy.get('[class*="step"], [class*="process"]').should('have.length.greaterThan', 0);
  });
});
