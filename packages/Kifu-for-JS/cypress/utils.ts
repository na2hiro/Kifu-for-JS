export const start = () => cy.findByText("|<");
export const backward10 = () => cy.findByText("<<");
export const backward1 = () => cy.findByText("<");

export const forward1 = () => cy.findByText(">");
export const forward10 = () => cy.findByText(">>");
export const end = () => cy.findByText(">|");

export const reverse = () => cy.findByText("反転");
export const credit = () => cy.findByText("credit");

export const comment = () => cy.findByLabelText("コメント");

export const kifuList = () => cy.findByRole("listbox")

export const selectCell = (x: number, y: number) =>
    cy.get(`table tr:nth-child(${y + 1}) td:nth-child(${10 - x})`);

export const selectTesuu = () => cy.findByLabelText(`現在の手数`);
export const goto = (tesuu: number) => selectTesuu().type(`{backspace}{backspace}{backspace}${tesuu}`)

export const tesuuShouldBe = (tesuu: number) => selectTesuu().should('have.value', tesuu)
export const lastCellShouldBe = (x: number, y: number) => selectCell(x, y).should("have.class", "kifuforjs-cell--lastto")
export const lastCellShouldNotBe = (x: number, y: number) => selectCell(x, y).should("not.have.class", "kifuforjs-cell--lastto")
