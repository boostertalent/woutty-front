describe('Auth - Page d\'authentification', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/auth');
  });

  it('Devrait charger la page auth', () => {
    cy.url().should('include', '/auth');
  });

  it('Devrait afficher les options d\'authentification', () => {
    cy.get('button, a').filter(':contains("Login"), :contains("Sign up"), :contains("Register")').should('exist');
  });
});
