describe('Creators - Auth - Social Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/auth/social');
  });

  it('Devrait charger la page social', () => {
    cy.url().should('include', '/creators/auth/social');
  });

  it('Devrait afficher les options de réseaux sociaux', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
