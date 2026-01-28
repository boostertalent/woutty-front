describe('Component - BrandVisual', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher le visuel brand', () => {
    cy.get('img, [class*="visual"]').should('have.length.greaterThan', 0);
  });
});
