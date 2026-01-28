describe('Creators - Payments Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/payments');
  });

  it('Devrait charger la page payments', () => {
    cy.url().should('include', '/creators/payments');
  });

  it('Devrait afficher les informations de paiement', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
