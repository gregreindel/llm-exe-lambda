import pick = require("lodash.pick");
import { getInputAllowedProperties } from "./getInputAllowedProperties";

jest.mock("lodash.pick", () => {
  return jest.fn((obj: Record<string, any>, props: string[]) => {
    const result: Record<string, any> = {};
    props.forEach((prop) => {
      if (prop in obj) {
        result[prop] = obj[prop];
      }
    });
    return result;
  });
});

describe("getInputAllowedProperties", () => {
  const allowedProperties = [
    "provider",
    "model",
    "message",
    "output",
    "schema",
    "data",
  ];

  beforeEach(() => {
    (pick as jest.Mock).mockClear();
  });

  it("should return only the allowed properties when input has extra keys", () => {
    const input = {
      provider: "providerValue",
      model: "modelValue",
      message: "hello world",
      output: 123,
      schema: { key: "value" },
      data: [1, 2, 3],
      extra: "should not be included",
      anotherExtra: 456,
    };

    const expected = {
      provider: "providerValue",
      model: "modelValue",
      message: "hello world",
      output: 123,
      schema: { key: "value" },
      data: [1, 2, 3],
    };

    const result = getInputAllowedProperties(input);
    expect(result).toEqual(expected);
    expect(pick).toHaveBeenCalledWith(input, allowedProperties);
  });

  it("should return an empty object when input has no allowed properties", () => {
    const input = { notAllowed: "value", extra: 42 };
    const expected = {};
    const result = getInputAllowedProperties(input);
    expect(result).toEqual(expected);
    expect(pick).toHaveBeenCalledWith(input, allowedProperties);
  });

  it("should return only the allowed properties when some are missing", () => {
    const input = { provider: "providerValue", extra: "should be ignored", data: "some data" };
    const expected = { provider: "providerValue", data: "some data" };
    const result = getInputAllowedProperties(input);
    expect(result).toEqual(expected);
    expect(pick).toHaveBeenCalledWith(input, allowedProperties);
  });

  it("should return allowed properties even if their values are undefined", () => {
    const input = { provider: undefined, model: "modelValue", random: "ignored" };
    const expected = { provider: undefined, model: "modelValue" };
    const result = getInputAllowedProperties(input);
    expect(result).toEqual(expected);
    expect(pick).toHaveBeenCalledWith(input, allowedProperties);
  });

  it("should return an empty object if input object is empty", () => {
    const input = {};
    const expected = {};
    const result = getInputAllowedProperties(input);
    expect(result).toEqual(expected);
    expect(pick).toHaveBeenCalledWith(input, allowedProperties);
  });
});