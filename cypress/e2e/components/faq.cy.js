describe('Component - FAQ', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher la section FAQ', () => {
    cy.contains(/faq|question|réponse/i).should('exist');
  });

  it('Devrait avoir des questions et réponses', () => {
    cy.get('details').should('have.length.greaterThan', 0);
  });
});
