describe('Vérification Application', () => {
  beforeEach(() => {
    // Nettoyer avant chaque test
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visiter avec timeout augmenté
    cy.visit('http://localhost:3000', { 
      timeout: 10000,
      retryOnNetworkFailure: true 
    });
  });

  it("Charge la page d'accueil", () => {
    // Vérifier que la page est bien chargée
    cy.url({ timeout: 10000 }).should('include', 'localhost:3000');
    
    // Vérifier la présence du h1 principal
    cy.get('h1', { timeout: 8000 }).should('be.visible');
    
    // Vérifier le contenu du h1
    cy.get('h1').should('contain.text', /Transformez|créativité|revenu/i);
    
    // Vérifier la présence du composant Hero
    cy.get('[data-testid="hero"], section[class*="hero"]', { timeout: 5000 }).should('exist');
    
    // Vérifier la navbar
    cy.get('nav, [data-testid="navbar"]', { timeout: 5000 }).should('be.visible');
    
    // Vérifier le footer
    cy.get('footer, [data-testid="footer"]', { timeout: 5000 }).should('exist');
  });
});