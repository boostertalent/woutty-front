describe('Component - About', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher la section About', () => {
    cy.contains(/about|à propos|apropos/i).should('exist');
  });

  it('Devrait avoir du contenu', () => {
    cy.get('section').should('have.length.greaterThan', 0);
  });
});
