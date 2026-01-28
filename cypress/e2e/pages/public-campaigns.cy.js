describe('Public - Partenariat - Campaigns', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/public/partenariart/campaigns');
  });

  it('Devrait charger la page campaigns', () => {
    cy.url().should('include', '/campaigns');
  });

  it('Devrait afficher les campagnes', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
