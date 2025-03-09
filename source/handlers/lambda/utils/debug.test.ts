import { debug } from "./debug";

describe("debug function", () => {
  const originalDebugEnv = process.env.DEBUG;
  let consoleDebugSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    process.env.DEBUG = originalDebugEnv;
  });

  test("should call console.debug when process.env.DEBUG is truthy (\"true\")", () => {
    process.env.DEBUG = "true";
    const arg1 = "message";
    const arg2 = { key: "value" };
    debug(arg1, arg2);
    expect(consoleDebugSpy).toHaveBeenCalledWith(arg1, arg2);
  });

  test("should call console.debug when process.env.DEBUG is truthy (\"yes\") with multiple arguments", () => {
    process.env.DEBUG = "yes";
    const args = [1, "two", { three: 3 }];
    debug(...args);
    expect(consoleDebugSpy).toHaveBeenCalledWith(...args);
  });

  test("should call console.debug even with no arguments when process.env.DEBUG is truthy", () => {
    process.env.DEBUG = "1";
    debug();
    expect(consoleDebugSpy).toHaveBeenCalledWith();
  });

  test("should not call console.debug when process.env.DEBUG is falsy (undefined)", () => {
    process.env.DEBUG = undefined;
    debug("message", 123);
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  test("should not call console.debug when process.env.DEBUG is falsy (empty string)", () => {
    process.env.DEBUG = "";
    debug("another message");
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  test("should not call console.debug when process.env.DEBUG is falsy (null)", () => {
    process.env.DEBUG = null as any;
    debug("test null");
    expect(consoleDebugSpy).not.toHaveBeenCalled();
  });

  test("should call console.debug when process.env.DEBUG is a non-empty string that might look false-like (\"0\")", () => {
    process.env.DEBUG = "0";
    debug("test with 0");
    expect(consoleDebugSpy).toHaveBeenCalledWith("test with 0");
  });
});