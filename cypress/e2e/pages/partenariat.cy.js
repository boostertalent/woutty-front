describe('Partenariat - Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/partenariat');
  });

  it('Devrait charger la page partenariat', () => {
    cy.url().should('include', '/partenariat');
  });

  it('Devrait afficher les informations de partenariat', () => {
    cy.get('*').should('have.length.greaterThan', 0);
  });
});
