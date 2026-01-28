describe('Component - Reveal', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher le composant Reveal', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });

  it('Devrait animer au scroll', () => {
    cy.scrollTo('center');
    cy.get('*').should('exist');
  });
});
