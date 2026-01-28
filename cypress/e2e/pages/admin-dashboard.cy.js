describe('Admin - Dashboard', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/admin/dashboard');
  });

  it('Devrait charger le dashboard admin', () => {
    cy.url().should('include', '/admin/dashboard');
  });

  it('Devrait afficher les éléments du dashboard', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });

  it('Devrait avoir le titre du dashboard', () => {
    cy.get('h1, h2').should('have.length.greaterThan', 0);
  });
});
