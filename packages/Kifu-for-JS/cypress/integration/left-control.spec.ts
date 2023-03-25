import {lastCellShouldBe, end, forward1, forward10, selectTesuu, tesuuShouldBe, goto, kifuList} from "../utils";

const activeRow = () => cy.get(".kifuforjs-kifulist-row--selected")
const dl = () => cy.get(".kifuforjs-dl")
const autoload = () => cy.get(".kifuforjs-autoload")
const forklist = () => cy.getBySel("forklist")

const selectRow = (tesuu: number) => cy.get(`.kifuforjs-kifulist-inner>div:nth-child(${tesuu + 2})`)

let response; // Mutate this to change stubbed request
const setJkfUntil = (jkfObj: any, tesuu: number) => response = {
    ...jkfObj,
    moves: jkfObj.moves.slice(0, tesuu+1)
};

describe("Left control", () => {
    beforeEach(() => {
        cy.visit('/examples/loadJkf.html', {
            onBeforeLoad(win) {
                cy.stub(win, 'open');
            }
        });
    })

    it('scrolls kifu list as it navigates', () => {
        activeRow().should("contain.text", "0 ")
        forward1().click();
        activeRow().should("contain.text", "1 ")
        forward10().click();
        activeRow().should("contain.text", "11 ")
        end().click();
        activeRow().should("contain.text", "118 ")
    })
    it('navigates by clicking kifu list', () => {
        selectRow(5).click();
        selectTesuu().should("have.value", 5);
        selectRow(118).click();
        selectTesuu().should("have.value", 118);
        selectRow(0).click();
        selectTesuu().should("have.value", 0);
    })
    it('navigates by scrolling kifu list', () => {
        kifuList().scrollTo(0, 100)
        selectTesuu().should("have.not.value", 0);
        kifuList().scrollTo(0, 8000)
        selectTesuu().should("have.value", 118);
        kifuList().scrollTo(0, 0)
        selectTesuu().should("have.value", 0);
    })
    it('downloads kifu', () => {
        dl().click()
        cy.window().its('open').should('be.called');
    })
    it('shows branches and can fork', () => {
        cy.visit("/examples/forked.html")
        goto(1)
        lastCellShouldBe(7, 6)

        goto(0)
        forklist().select("0")
        tesuuShouldBe(1)
        lastCellShouldBe(2, 6)

        forklist().select("0")
        tesuuShouldBe(2)
        lastCellShouldBe(8, 4)

        goto(0)
        goto(1)
        lastCellShouldBe(7, 6)

        // TODO thorough testing for forks
    })
    it('periodically checks updates for kifu', () => {
        cy.clock()
        cy.fixture("/jkfExample.json")
            .then(jkf => setJkfUntil(jkf, 0))

        cy.intercept("GET", "/examples/files/jkf/ryuou201409020101.jkf", req=>req.reply(response)).as("get")
        autoload().select("30")
        cy.tick(31000)
        cy.get("@get")

        cy.fixture("/jkfExample.json")
            .then(jkf => setJkfUntil(jkf, 1))
        cy.tick(31000)
        cy.get("@get")

        // TODO: Fix: It should follow the last board
        goto(1)

        cy.fixture("/jkfExample.json")
            .then(jkf => setJkfUntil(jkf, 2))
        cy.tick(31000)
        cy.get("@get")

        // TODO: test that it doesn't follow if current position is not the last one
    })
})
