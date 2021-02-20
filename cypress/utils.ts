export const start = () => cy.contains(/^\|<$/);
export const backward10 = () => cy.contains(/^<<$/);
export const backward1 = () => cy.contains(/^<$/);

export const forward1 = () => cy.contains(/^>$/);
export const forward10 = () => cy.contains(/^>>$/);
export const end = () => cy.contains(/^>\|$/);

export const reverse = () => cy.contains("反転");
export const credit = () => cy.contains("credit");

export const comment = () => cy.get(".kifuforjs-comment");

export const selectCell = (x: number, y: number) =>
    cy.get(`table tr:nth-child(${y + 1}) td:nth-child(${10 - x})`);

export const selectTesuu = () => cy.get(`input[name="tesuu"]`);
export const goto = (tesuu: number) => selectTesuu().type(`{backspace}{backspace}{backspace}${tesuu}`)

export const tesuuShouldBe = (tesuu: number) => selectTesuu().should('have.value', tesuu)
export const lastCellShouldBe = (x: number, y: number) => selectCell(x, y).should("have.class", "kifuforjs-cell--lastto")
export const lastCellShouldNotBe = (x: number, y: number) => selectCell(x, y).should("not.have.class", "kifuforjs-cell--lastto")
