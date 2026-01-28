describe('Component - Hero', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher le Hero section', () => {
    cy.get('h1').should('be.visible');
  });

  it('Devrait avoir un titre principal', () => {
    cy.get('h1').should('contain.text', '');
  });

  it('Devrait être responsive', () => {
    cy.viewport(375, 667);
    cy.get('h1').should('be.visible');
  });
});
