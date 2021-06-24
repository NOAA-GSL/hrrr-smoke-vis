describe("Home", function () {
  before(function () {
    cy.visit("http://localhost:3000/");
  });

  it("has a title", function () {
    cy.title().should("eq", "HRRR Smoke Vis [EXPERIMENTAL]");
    cy.get("h1").contains("HRRR Smoke Vis");
  });

  it("is labelled experimental", function () {
    cy.contains("Experimental");
  });

  it("displays a placeholder message", function () {
    cy.contains("Coming soon!");
  });
});
