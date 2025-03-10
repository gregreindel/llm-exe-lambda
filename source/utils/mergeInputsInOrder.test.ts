import { mergeInputsInOrder } from "./mergeInputsInOrder";

describe("mergeInputsInOrder", () => {
  it("should return an empty object when both inputs are empty objects", () => {
    const initial = {};
    const newInput = {};
    const result = mergeInputsInOrder(initial, newInput);
    expect(result).toEqual({});
  });

  it("should merge objects with no overlapping keys", () => {
    const initial = { a: 1 };
    const newInput = { b: 2 };
    const result = mergeInputsInOrder(initial, newInput);
    // newInput keys appear first, then initial
    expect(result).toEqual({ b: 2, a: 1 });
  });

  it("should favor the initial object for overlapping keys", () => {
    const initial = { a: 999, c: 3 };
    const newInput = { a: 1, b: 2 };
    const result = mergeInputsInOrder(initial, newInput);
    // Since we do Object.assign({}, newInput, initial),
    // 'initial' overwrites 'newInput' on conflict
    expect(result).toEqual({ a: 999, b: 2, c: 3 });
  });

  it("should handle an empty newInput", () => {
    const initial = { a: 1, b: 2 };
    const newInput = {};
    const result = mergeInputsInOrder(initial, newInput);
    // Nothing in newInput, so order is still initial's keys
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should handle an empty initial", () => {
    const initial = {};
    const newInput = { x: 10, y: 20 };
    const result = mergeInputsInOrder(initial, newInput);
    // Just newInput plus empty initial
    expect(result).toEqual({ x: 10, y: 20 });
  });

  it("should throw an error when any input is null", () => {
    expect(() => mergeInputsInOrder(null as any, { a: 1 })).toThrow();
    expect(() => mergeInputsInOrder({ a: 1 }, null as any)).toThrow();
  });

  it("should handle a string as newInput (tricky case)", () => {
    // Object.assign treats strings like an object of characters
    const initial = { a: 1 };
    const newInput = "hello";
    expect(() => mergeInputsInOrder(initial, newInput as any)).toThrow();

  });
});