describe('Component - BrandVisual', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000', { timeout: 10000 });
  });

  it('Devrait afficher le visuel brand', () => {
    // Attendre que le composant BrandVisual soit chargé
    cy.get('[data-testid="brand-visual"], section[class*="brand"], section[class*="visual"]', { timeout: 8000 })
      .should('have.length.greaterThan', 0);
    
    // Vérifier la présence du titre Woutty
    cy.contains('Woutty', { timeout: 5000 }).should('be.visible');
    
    // Vérifier les éléments visuels (images ou divs avec classes spécifiques)
    cy.get('img, [class*="visual"], [class*="woutty"], [class*="brand"]', { timeout: 5000 })
      .should('have.length.greaterThan', 0);
  });

  it('Devrait avoir les animations de fond', () => {
    // Vérifier la présence des éléments d'animation
    cy.get('[class*="blur"], [class*="animate"], [class*="motion"]', { timeout: 5000 })
      .should('have.length.greaterThan', 0);
  });
});
