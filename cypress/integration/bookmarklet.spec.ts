import {comment, forward1, forward10, selectTesuu} from "../utils";

describe("bookmarklet", () => {
    it("should replace flash", () => {
        cy.visit("/examples/kifu-for-flash-replace.html")
        comment().should("have.text", "コメント")
    })
    it("should replace flash swfobject", () => {
        cy.visit("/examples/kifu-for-flash-swfobject-replace.html")
        comment().should("have.text", "コメント")
    })
    it("should replace java applet", () => {
        cy.visit("/examples/kifu-for-java-replace.html")

        cy.get('.kifuforjs').first().within(() => {
            cy.get(`.kifuforjs-kifulist-inner`).find("div").should("have.length.above", 1)
            forward1().click()
            selectTesuu().should("have.value", 1)
        })

        cy.get('.kifuforjs').last().within(() => {
            cy.get(`.kifuforjs-kifulist-inner`).find("div").should("have.length.above", 1)
            forward10().click()
            selectTesuu().should("have.value", 10)
        })
    })
    it("should alert when nothing to replace", () => {
        const stub = cy.stub()
        cy.on ('window:alert', stub)

        cy.visit("/examples/nothing-to-replace.html")
            .then(() => {
                expect(stub).to.be.calledOnce;
            })
    })
})
