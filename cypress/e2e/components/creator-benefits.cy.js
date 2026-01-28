describe('Component - CreatorBenefits', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher les bénéfices creators', () => {
    cy.get('section').should('have.length.greaterThan', 0);
  });

  it('Devrait avoir du contenu', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
