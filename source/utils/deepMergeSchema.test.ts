import { deepMergeSchema } from "./deepMergeSchema";

describe("deepMergeSchema", () => {
  it("should merge two plain objects with non-overlapping keys", () => {
    const primary = { a: 1 };
    const secondary = { b: 2 };
    const result = deepMergeSchema(primary, secondary);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should recursively merge nested objects and favor primary in conflicts", () => {
    const primary = {
      nested: {
        name: "primaryName",
        settings: {
          debug: true,
          theme: "dark",
        },
      },
      version: 1,
    };
    const secondary = {
      nested: {
        name: "secondaryName", // conflict
        settings: {
          debug: false, // conflict
          featureX: true,
        },
      },
      extra: true,
    };
    const result = deepMergeSchema(primary, secondary);

    // 'name' and 'debug' should come from primary,
    // but 'featureX' and 'extra' should merge in.
    expect(result).toEqual({
      nested: {
        name: "primaryName",
        settings: {
          debug: true,
          theme: "dark",
          featureX: true,
        },
      },
      version: 1,
      extra: true,
    });
  });

  it("should add properties from secondary if not in primary", () => {
    const primary = { a: 1, b: { nested: 2 } };
    const secondary = { b: { other: 3 }, c: 4 };
    const result = deepMergeSchema(primary, secondary);
    expect(result).toEqual({
      a: 1,
      b: { nested: 2, other: 3 },
      c: 4,
    });
  });

  it("should return primary if it is a non-object and non-array and not undefined", () => {
    const primary = "primaryValue";
    const secondary = "secondaryValue";
    const result = deepMergeSchema(primary as any, secondary as any);
    // primary is a string; function should just return primary
    expect(result).toBe("primaryValue");
  });

  it("should return secondary if primary is undefined", () => {
    const primary = undefined;
    const secondary = 10;
    const result = deepMergeSchema(primary as any, secondary as any);
    // primary is undefined; function should return secondary
    expect(result).toBe(10);
  });

  it("should return primary if primary is null (since null !== undefined)", () => {
    const primary = null;
    const secondary = { a: 1 };
    const result = deepMergeSchema(primary as any, secondary);
    // primary is null, which is not undefined, so it takes precedence
    expect(result).toBeNull();
  });

  it("should combine arrays and remove duplicates", () => {
    const primary = [1, 2, 3];
    const secondary = [2, 3, 4];
    const result = deepMergeSchema(primary, secondary);
    // Merge into a unique set
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it("should return primary if one is array and the other is object or other type", () => {
    // primary (array) vs secondary (object)
    const primary = [1, 2];
    const secondary = { a: 3 };
    let result = deepMergeSchema(primary, secondary);
    expect(result).toBe(primary);

    // primary (object) vs secondary (array)
    const primaryObj = { a: 1 };
    const secondaryArr = [1, 2];
    result = deepMergeSchema(primaryObj, secondaryArr);
    expect(result).toBe(primaryObj);
  });

  it("should handle nested arrays within objects", () => {
    const primary = {
      list: [1, 2],
      config: {
        nestedList: [5, 6],
      },
    };
    const secondary = {
      list: [2, 3],
      config: {
        nestedList: [6, 7],
      },
    };
    const result = deepMergeSchema(primary, secondary);
    // top-level array merges => [1,2,3]
    // nested array merges => [5,6,7]
    expect(result).toEqual({
      list: [1, 2, 3],
      config: {
        nestedList: [5, 6, 7],
      },
    });
  });


});