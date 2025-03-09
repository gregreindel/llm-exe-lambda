import { extractHbsAttributeNamesFromString } from "./extractHbsAttributeNamesFromString";

describe("extractHbsAttributeNamesFromString", () => {
  it("should return an empty array when given an empty programBody", () => {
    const result = extractHbsAttributeNamesFromString([]);
    expect(result).toEqual([]);
  });

  it("should extract attribute name from a MustacheStatement", () => {
    const programBody = [
      { type: "MustacheStatement", path: { original: "attr1" } },
    ];
    const result = extractHbsAttributeNamesFromString(programBody);
    expect(result).toEqual(["attr1"]);
  });

  it("should ignore statements that are not MustacheStatement or BlockStatement", () => {
    const programBody = [
      { type: "OtherStatement", data: "ignore" },
      { type: "MustacheStatement", path: { original: "attr1" } },
    ];
    const result = extractHbsAttributeNamesFromString(programBody);
    expect(result).toEqual(["attr1"]);
  });

  it("should extract attribute names from a BlockStatement with no inverse", () => {
    const programBody = [
      {
        type: "BlockStatement",
        program: {
          body: [{ type: "MustacheStatement", path: { original: "attr2" } }],
        },
        inverse: null,
      },
    ];
    const result = extractHbsAttributeNamesFromString(programBody);
    expect(result).toEqual(["attr2"]);
  });

  it("should extract attribute names from a BlockStatement with an inverse", () => {
    const programBody = [
      {
        type: "BlockStatement",
        program: {
          body: [{ type: "MustacheStatement", path: { original: "attr3" } }],
        },
        inverse: {
          body: [{ type: "MustacheStatement", path: { original: "attr4" } }],
        },
      },
    ];
    const result = extractHbsAttributeNamesFromString(programBody);
    expect(result).toEqual(["attr3", "attr4"]);
  });

  it("should extract attribute names recursively from nested BlockStatements", () => {
    const programBody = [
      { type: "MustacheStatement", path: { original: "attr1" } },
      {
        type: "BlockStatement",
        program: {
          body: [
            { type: "MustacheStatement", path: { original: "attr2" } },
            {
              type: "BlockStatement",
              program: {
                body: [
                  { type: "MustacheStatement", path: { original: "attr3" } },
                ],
              },
              inverse: {
                body: [
                  { type: "MustacheStatement", path: { original: "attr4" } },
                ],
              },
            },
          ],
        },
        inverse: {
          body: [{ type: "MustacheStatement", path: { original: "attr5" } }],
        },
      },
    ];
    const result = extractHbsAttributeNamesFromString(programBody);
    expect(result).toEqual(["attr1", "attr2", "attr3", "attr4", "attr5"]);
  });

  it("should return an empty array when BlockStatement has empty bodies", () => {
    const programBody = [
      {
        type: "BlockStatement",
        program: { body: [] },
        inverse: { body: [] },
      },
    ];
    const result = extractHbsAttributeNamesFromString(programBody);
    expect(result).toEqual([]);
  });

  it("should throw an error if a MustacheStatement is missing the path property", () => {
    const programBody = [{ type: "MustacheStatement" }];
    expect(() => extractHbsAttributeNamesFromString(programBody)).toThrow();
  });


  it("should throw an error when the input is not an array", () => {
    // @ts-ignore: testing non-array input
    expect(() => extractHbsAttributeNamesFromString(null)).toThrow();
    // @ts-ignore: testing non-array input
    expect(() => extractHbsAttributeNamesFromString("not an array")).toThrow();
  });
});
