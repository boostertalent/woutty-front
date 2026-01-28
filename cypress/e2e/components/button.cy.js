describe('Component - Button', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher des boutons', () => {
    cy.get('button').should('have.length.greaterThan', 0);
  });

  it('Les boutons doivent être cliquables', () => {
    cy.get('button').first().should('be.enabled');
  });

  it('Devrait afficher un feedback au clic', () => {
    cy.get('button').first().click();
  });
});
