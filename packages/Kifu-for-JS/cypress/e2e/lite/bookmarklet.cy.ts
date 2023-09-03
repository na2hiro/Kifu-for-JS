import { forwardLite } from "./utils";
import { comment } from "../common/utils";

const expectedComment =
    "第３５回将棋日本シリーズ・ＪＴプロ公式戦はトーナメント形式で行われる。\n渡辺二冠は一回戦シード、佐藤九段は一回戦で郷田真隆九段に勝利して、本局を迎えた。";
describe("bookmarklet", () => {
    it("should replace flash", () => {
        cy.visit("/examples/kifu-for-flash-replace.html");
        comment().should("have.text", expectedComment);
    });
    it("should replace flash swfobject", () => {
        cy.visit("/examples/kifu-for-flash-swfobject-replace.html");
        comment().should("have.text", expectedComment);
    });
    it("should replace java applet", () => {
        cy.visit("/examples/kifu-for-java-replace.html");

        cy.get(".kifuforjs-lite")
            .first()
            .within(() => {
                cy.get(`.kifuforjs-kifulist`).find("div[role=option]").should("have.length", 5);
                forwardLite().click();
                cy.get(`.kifuforjs-kifulist`).find("div[role=option][aria-selected=true]").should("contain.text", "1");
            });

        cy.get(".kifuforjs-lite")
            .last()
            .within(() => {
                cy.get(`.kifuforjs-kifulist`).find("div").should("have.length.above", 1);
                forwardLite().click();
                forwardLite().click();
                cy.get(`.kifuforjs-kifulist`).find("div[role=option][aria-selected=true]").should("contain.text", "2");
            });
    });
    it("should alert when nothing to replace", () => {
        const stub = cy.stub();
        cy.on("window:alert", stub);
        cy.on("uncaught:exception", (err) => false); // ignore

        cy.visit("/examples/nothing-to-replace.html").then(() => {
            // eslint-disable-next-line jest/valid-expect
            expect(stub).to.be.calledOnce;
        });
    });
});
