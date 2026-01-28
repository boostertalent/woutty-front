describe('Component - Navbar', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher la navbar', () => {
    cy.get('nav').should('be.visible');
  });

  it('Devrait avoir des liens de navigation', () => {
    cy.get('nav a').should('have.length.greaterThan', 0);
  });

  it('Devrait être accessible au scroll', () => {
    cy.get('nav').should('be.visible');
    cy.scrollTo('bottom');
    cy.get('nav').should('be.visible');
  });
});
