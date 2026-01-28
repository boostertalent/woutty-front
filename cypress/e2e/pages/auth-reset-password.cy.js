describe('Auth - Reset Password Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth/reset-password');
  });

  it('Devrait charger la page reset-password', () => {
    cy.url().should('include', '/auth/reset-password');
  });

  it('Devrait afficher le formulaire de réinitialisation', () => {
    cy.get('input[type="password"], input[name*="password"]').should('exist');
  });

  it('Devrait afficher un bouton de confirmation', () => {
    cy.get('button[type="submit"]').should('be.visible');
  });
});
