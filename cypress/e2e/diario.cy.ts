describe('Diário de Poemas - Automação', () => {
  it('Deve criar, editar e apagar um poema com sucesso', () => {
    // 1. Acessa a aplicação
    cy.visit('http://localhost:3000');

    // 2. Clica no botão de criar novo poema
    cy.get('[data-cy="btn-novo"]').click();

    // 3. Preenche o formulário
    cy.get('input[name="titulo"]').type('Versos de Automação');
    cy.get('textarea[name="conteudo"]').type('Mesmo em linhas de código, a poesia encontra o seu espaço.');
    
    // 4. Salva o poema
    cy.contains('button', 'Salvar').click();

    // 5. Verifica se o poema apareceu na tela
    cy.contains('Versos de Automação').should('be.visible');

    // 6. Clica para editar o poema recém-criado
    cy.get('[data-cy="btn-editar"]').first().click();
    cy.get('input[name="titulo"]').clear().type('Versos Refatorados');
    cy.contains('button', 'Salvar').click();

    // 7. Verifica se a edição funcionou
    cy.contains('Versos Refatorados').should('be.visible');

    // 8. Diz para o Cypress aceitar o alerta de confirmação automaticamente
    cy.on('window:confirm', () => true);

    // 9. Clica para deletar o poema
    cy.get('[data-cy="btn-deletar"]').first().click();

    // 10. Verifica se o poema sumiu da tela
    cy.contains('Versos Refatorados').should('not.exist');
  });
});