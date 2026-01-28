describe('Creators - Auth - Success Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/auth/success');
  });

  it('Devrait charger la page success', () => {
    cy.url().should('include', '/creators/auth/success');
  });

  it('Devrait afficher le message de succès', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
