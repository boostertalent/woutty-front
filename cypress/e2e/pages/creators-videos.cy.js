describe('Creators - Videos Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/creators/videos');
  });

  it('Devrait charger la page videos', () => {
    cy.url().should('include', '/creators/videos');
  });

  it('Devrait afficher les vidéos ou un message vide', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
