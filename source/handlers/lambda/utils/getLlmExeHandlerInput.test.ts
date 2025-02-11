import { getS3ObjectAsJsonWithLocal } from "@/utils/getS3ObjectAsJsonWithLocal";
import { getLlmExeHandlerInput } from "./getLlmExeHandlerInput";

jest.mock("@/utils/getS3ObjectAsJsonWithLocal");

describe("getLlmExeHandlerInput", () => {
  const getS3ObjectAsJsonWithLocalMock = getS3ObjectAsJsonWithLocal as jest.MockedFunction<
    typeof getS3ObjectAsJsonWithLocal
  >;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns defaults merged with S3 data when the 'key' is present in event", async () => {
    const mockEvent = { key: "testKey", version: "1.0" };
    const mockS3Data = { output: "json", data: "testData" };

    getS3ObjectAsJsonWithLocalMock.mockResolvedValueOnce(mockS3Data);

    const result = await getLlmExeHandlerInput(mockEvent);

    expect(getS3ObjectAsJsonWithLocalMock).toHaveBeenCalledWith(
      "testKey.1.0.json"
    );
    expect(result).toEqual({ output: "json", data: "testData" });
  });

  it("returns defaults with S3 data using 'latest' when version is not present", async () => {
    const mockEvent = { key: "testKey" };
    const mockS3Data = { output: "json", data: "testData" };

    getS3ObjectAsJsonWithLocalMock.mockResolvedValueOnce(mockS3Data);

    const result = await getLlmExeHandlerInput(mockEvent);

    expect(getS3ObjectAsJsonWithLocalMock).toHaveBeenCalledWith(
      "testKey.latest.json"
    );
    expect(result).toEqual({ output: "json", data: "testData" });
  });

  it("returns defaults merged with event data when 'key' is not present", async () => {
    const mockEvent = { data: "testData" };

    const result = await getLlmExeHandlerInput(mockEvent);

    expect(result).toEqual({ output: "string", data: "testData" });
    expect(getS3ObjectAsJsonWithLocalMock).not.toHaveBeenCalled();
  });

  it("returns only defaults when event is empty and 'key' is not present", async () => {
    const mockEvent = {};

    const result = await getLlmExeHandlerInput(mockEvent);

    expect(result).toEqual({ output: "string" });
    expect(getS3ObjectAsJsonWithLocalMock).not.toHaveBeenCalled();
  });
});