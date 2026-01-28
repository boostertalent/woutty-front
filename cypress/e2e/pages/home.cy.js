describe('Home Page - Page d\'accueil', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait charger la page d\'accueil', () => {
    cy.get('h1').should('be.visible');
  });

  it('Devrait afficher le composant Hero', () => {
    cy.contains('Hero').should('exist');
  });

  it('Devrait afficher la navbar', () => {
    cy.get('nav').should('be.visible');
  });

  it('Devrait afficher le footer', () => {
    cy.get('footer').should('be.visible');
  });

  it('Devrait avoir des liens de navigation', () => {
    cy.get('nav a').should('have.length.greaterThan', 0);
  });

  it('Devrait être responsive sur mobile', () => {
    cy.viewport(375, 667);
    cy.get('h1').should('be.visible');
  });
});
