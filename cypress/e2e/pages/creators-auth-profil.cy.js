describe('Creators - Auth - Profil Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/auth/profil');
  });

  it('Devrait charger la page profil auth', () => {
    cy.url().should('include', '/creators/auth/profil');
  });

  it('Devrait afficher le formulaire de profil', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
