import {comment, end, goto, reverse} from "../utils";

describe("Static checks", () => {
    beforeEach(() => {
        cy.visit('http://0.0.0.0:8080/examples/loadJkf.html');
    })

    describe("Metadata", () => {
        it('should show some data', () => {
            cy.get(".kifuforjs-info").contains("竜王戦")
        })
    })
    describe("Mochigoma", () => {
        it('shows pieces and name correctly', () => {
            end().click()

            verify();
            reverse().click()
            verify();

            function verify() {
                cy.getBySel("hand-for-0")
                    .contains("☗羽生善治")
                cy.getBySel("hand-for-0")
                    .find(".kifuforjs-pieceinhand--fu > div")
                    .should("have.length", 6)
                cy.getBySel("hand-for-1")
                    .contains("☖糸谷哲郎")
                cy.getBySel("hand-for-1")
                    .find(".kifuforjs-pieceinhand--fu > div")
                    .should("have.length", 3)
            }
        })
    })
    describe("Comment", () => {
        it("shows comment", () => {
            goto(5)
            comment().should("have.text", "comment comment")
            goto(17)
            comment().should("have.text", "")
        })
    })
})
