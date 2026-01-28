describe('Component - BrandBenefits', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher les bénéfices brands', () => {
    cy.get('section').should('have.length.greaterThan', 0);
  });

  it('Devrait avoir des cartes de bénéfices', () => {
    cy.get('[class*="card"], [class*="benefit"]').should('have.length.greaterThan', 0);
  });
});
