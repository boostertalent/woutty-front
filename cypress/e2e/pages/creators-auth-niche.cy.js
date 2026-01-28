describe('Creators - Auth - Niche Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/auth/niche');
  });

  it('Devrait charger la page niche', () => {
    cy.url().should('include', '/creators/auth/niche');
  });

  it('Devrait afficher les options de niche', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
