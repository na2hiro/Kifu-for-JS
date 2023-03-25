import {
    backward1,
    backward10, lastCellShouldBe, lastCellShouldNotBe,
    credit,
    end,
    forward1,
    forward10,
    reverse,
    selectCell,
    selectTesuu,
    start, tesuuShouldBe
} from "../utils";

const CREDIT = "credit";



describe("Control", () => {
    beforeEach(() => {
        cy.visit('/examples/loadJkf.html', {
            onBeforeLoad(win) {
                cy.stub(win, 'open');
            }
        });
    })
    it("navigates back and forth by 1", () => {
        forward1().click();
        tesuuShouldBe(1)
        lastCellShouldBe(7, 6)

        forward1().click();
        tesuuShouldBe(2)
        lastCellShouldBe(3, 4)

        backward1().click();
        tesuuShouldBe(1)
        lastCellShouldBe(7, 6)

        backward1().click();
        tesuuShouldBe(0)
        lastCellShouldNotBe(7, 6)

        // Go back too much: no change
        backward1().click();
        tesuuShouldBe(0)
        lastCellShouldNotBe(7, 6)
    })

    it("navigates back and forth by 10", () => {
        forward10().click();
        tesuuShouldBe(10)
        lastCellShouldBe(3, 3)

        forward10().click();
        tesuuShouldBe(20)
        lastCellShouldBe(4, 4)

        backward10().click();
        tesuuShouldBe(10)
        lastCellShouldBe(3, 3)

        backward1().click();
        tesuuShouldBe(9)
        lastCellShouldBe(3, 8)

        // Go back too much: first
        backward10().click();
        tesuuShouldBe(0)
        lastCellShouldNotBe(7, 6)
    })

    it("navigates to end and start, mixed with all types of buttons", () => {
        end().click();
        tesuuShouldBe(118)

        backward1().click();
        tesuuShouldBe(117)

        backward10().click();
        tesuuShouldBe(107)

        start().click();
        tesuuShouldBe(0)

        forward10().click();
        tesuuShouldBe(10)

        forward1().click();
        tesuuShouldBe(11)
    })

    it('navigates by typing', () => {
        selectTesuu().type('98')
        tesuuShouldBe(98)

        selectTesuu().type('{backspace}{backspace}10')
        tesuuShouldBe(10)

        selectTesuu().type('2')
        tesuuShouldBe(102)

        // Overflow, then go to max
        selectTesuu().type('1')
        tesuuShouldBe(118)

        // Empty string, then 0
        selectTesuu().type('{backspace}{backspace}{backspace}')
        tesuuShouldBe(0)
    })

    it("shows reverted board", () => {
        end().click();
        backward1().click();
        lastCellShouldBe(7, 3)
        reverse().click();
        lastCellShouldBe(3, 7)
        reverse().click();
        lastCellShouldBe(7, 3)
    })

    it("shows credit and navigate to github", () => {
        credit().click();
        cy.window().its('open').should('be.called');
    })
})
