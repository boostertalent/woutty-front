describe('Component - Select', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Devrait afficher les éléments select', () => {
    cy.get('select, [role="combobox"], [role="listbox"]').should('exist');
  });

  it('Devrait pouvoir sélectionner une option', () => {
    cy.get('select, [role="combobox"]').first().click({ force: true });
  });
});
