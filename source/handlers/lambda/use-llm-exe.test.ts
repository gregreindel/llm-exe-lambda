import { getInputPayload } from "./utils/getInputPayload";
import { getLlmExeHandlerInput } from "./utils/getLlmExeHandlerInput";
import { isInputValid } from "./utils/assertPayloadIsValid";
import { LlmExeHandler } from "./use-llm-exe";
import { getOutputPayload } from "./utils/getOutputPayload";
import { inputTextOutputJson } from "@/utils/inputTextOutputJson";
import { inputTextOutputStringList } from "@/utils/inputTextOutputStringList";
import { inputTextOutputString } from "@/utils/inputTextOutputString";

jest.mock("./utils/getInputPayload");
jest.mock("./utils/getOutputPayload");
jest.mock("./utils/getLlmExeHandlerInput");
jest.mock("./utils/assertPayloadIsValid");
jest.mock("@/utils/inputTextOutputJson");
jest.mock("@/utils/inputTextOutputString");
jest.mock("@/utils/inputTextOutputStringList");

describe("LlmExeHandler", () => {
  const mockEvent = { key: "value" };
  const mockPayload = { payloadKey: "payloadValue" };
  const mockHandlerInput = {
    message: "testMessage",
    output: "string",
    providor: "openai",
    model: "testModel",
    data: {}
  };

  const inputTextOutputStringMock = inputTextOutputString as jest.Mock;
  const inputTextOutputStringListMock = inputTextOutputStringList as jest.Mock;
  const inputTextOutputJsonMock = inputTextOutputJson as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    (getInputPayload as jest.Mock).mockReturnValue(mockPayload);
    (getLlmExeHandlerInput as jest.Mock).mockResolvedValue(mockHandlerInput);
    (isInputValid as unknown as jest.Mock).mockReturnValue(true);
  });

  it("should call getInputPayload with event", async () => {
    await LlmExeHandler(mockEvent);

    expect(getInputPayload).toHaveBeenCalledWith(mockEvent);
  });

  it("should call getLlmExeHandlerInput with payload", async () => {
    await LlmExeHandler(mockEvent);

    expect(getLlmExeHandlerInput).toHaveBeenCalledWith(mockPayload);
  });

  it("should process JSON output correctly", async () => {
    mockHandlerInput.output = "json";

    const mockResponse = { responseKey: "responseValue" };
    (inputTextOutputJsonMock as jest.Mock).mockResolvedValue(mockResponse);

    await LlmExeHandler(mockEvent);

    expect(inputTextOutputJsonMock).toHaveBeenCalledWith("testMessage", {
      providor: "openai.chat.v1",
      model: "testModel",
      data: {},
      schema: {},
      debug: false,
    });

    expect(getOutputPayload).toHaveBeenCalledWith(mockEvent, mockResponse);
  });

  it("should process list output correctly", async () => {
    mockHandlerInput.output = "list";

    const mockResponse = ["response1", "response2"];
    inputTextOutputStringListMock.mockReturnValue(mockResponse);

    await LlmExeHandler(mockEvent);

    expect(inputTextOutputStringListMock).toHaveBeenCalledWith("testMessage", {
      providor: "openai.chat.v1",
      model: "testModel",
      data: {},
      debug: false,
    });

    expect(getOutputPayload).toHaveBeenCalledWith(mockEvent, mockResponse);
  });

  it("should handle errors and return them as output", async () => {
    const error = new Error("Test Error");

    (getLlmExeHandlerInput as jest.Mock).mockRejectedValue(error);

    const result = await LlmExeHandler(mockEvent);

    expect(getOutputPayload).toHaveBeenCalledWith(mockEvent, error);
    expect(result).toBe(undefined);
  });

  it("should not proceed further if input is invalid", async () => {
    (isInputValid as unknown as  jest.Mock).mockReturnValue(false);

    await LlmExeHandler(mockEvent);

    expect(inputTextOutputJsonMock).not.toHaveBeenCalled();
    expect(inputTextOutputStringListMock).not.toHaveBeenCalled();
    expect(inputTextOutputStringMock).not.toHaveBeenCalled();
  });
});