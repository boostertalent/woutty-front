describe('Vérification Application', () => {
  it("Charge la page d'accueil", () => {
    cy.visit('http://localhost:3000'); // Assure-toi que ton Next.js tourne
    cy.contains('h1').should('be.visible');
  });
});