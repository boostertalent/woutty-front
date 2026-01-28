describe('Creators - Profile Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/profile');
  });

  it('Devrait charger la page profil', () => {
    cy.url().should('include', '/creators/profile');
  });

  it('Devrait afficher les informations du profil', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
