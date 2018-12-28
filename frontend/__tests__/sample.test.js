describe("sample test 101", () => {
  it("works as expected", () => {
    let age = 100;
    expect(age).toEqual(100);
  });

  it("handle ranges just fine", () => {
    const age = 200;
    expect(age).toBeGreaterThan(100);
  });

  it("makes a list dog names", () => {
    const dogs = ["snickers", "Hugo"];
    expect(dogs).toEqual(dogs);
    expect(dogs).toContain("Hugo");
  });
});
