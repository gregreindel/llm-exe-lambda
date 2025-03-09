import { lambdaGetParameter } from "@/clients/ssm";
import { withKey } from "./keychain";

jest.mock("@/clients/ssm", () => ({
  lambdaGetParameter: jest.fn(),
}));

describe("withKey function", () => {
  const mockKeyName = "mockKeyName";
  const mockKeyValue = "mockKeyValue";

  const lambdaGetParameterMock = lambdaGetParameter as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    lambdaGetParameterMock.mockReset()
  });

  it("fetches key using lambdaGetParameter if key does not exist in keychain", async () => {
    lambdaGetParameterMock.mockResolvedValueOnce(mockKeyValue);

    const value = await withKey(mockKeyName);

    expect(lambdaGetParameterMock).toHaveBeenCalledWith(`Secret/${mockKeyName}`);
    expect(value).toBe(mockKeyValue);
  });

  it("retries fetching key up to MAX_TRIES if key is not retrieved", async () => {
    lambdaGetParameterMock.mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(() => withKey("none")).rejects.toThrow("Unable to get key");

    expect(lambdaGetParameterMock).toHaveBeenCalledTimes(4);
  });

  it("throws an error if key is not obtained after MAX_TRIES", async () => {
    lambdaGetParameterMock.mockResolvedValue(null).mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(null);

    await expect(withKey("none")).rejects.toThrow("Unable to get key");

    expect(lambdaGetParameterMock).toHaveBeenCalledTimes(4);
  });


  it("returns existing key from chain if it is already set", async () => {
    // First, set the key directly in the chain
    await withKey(mockKeyName); // This call sets it internally
    // Clear mock so we can confirm it's not called again
    lambdaGetParameterMock.mockClear();
  
    const value = await withKey(mockKeyName);
  
    expect(lambdaGetParameterMock).not.toHaveBeenCalled();
    expect(value).toBe(mockKeyValue);
  });


});