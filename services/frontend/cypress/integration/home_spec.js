describe("Home", function () {
  before(function () {
    cy.visit("http://localhost:8080/");
  });

  it("has a title", function () {
    cy.title().should("eq", "HRRR Smoke Vis [EXPERIMENTAL]");
    cy.get("h1").contains("HRRR Smoke");
  });

  it("is labelled experimental", function () {
    cy.contains("Experimental");
  });

  it("has a checkbox for showing counties", function () {
    cy.get("#showCounties")
      .should("have.attr", "type", "checkbox")
      .and("not.have.attr", "checked");

    cy.get("label[for='showCounties']")
      .contains("Show Counties");
  });
});
