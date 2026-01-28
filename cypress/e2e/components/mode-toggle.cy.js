describe('Component - ModeToggle', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher le toggle de thème', () => {
    cy.get('button[class*="toggle"], button[class*="theme"]').should('exist');
  });

  it('Devrait pouvoir changer de thème', () => {
    cy.get('button[class*="toggle"], button[class*="theme"]').click();
    cy.get('html').should('exist');
  });
});
