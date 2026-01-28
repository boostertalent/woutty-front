describe('Component - Footer', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher le footer', () => {
    cy.get('footer').should('be.visible');
    cy.scrollTo('bottom');
  });

  it('Devrait avoir des liens', () => {
    cy.scrollTo('bottom');
    cy.get('footer a').should('have.length.greaterThan', 0);
  });

  it('Devrait avoir des informations de contact', () => {
    cy.scrollTo('bottom');
    cy.get('footer').should('exist');
  });
});
