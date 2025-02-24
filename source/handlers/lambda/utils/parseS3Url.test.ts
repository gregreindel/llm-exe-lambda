import { parseS3Url } from "./parseS3Url";

describe("parseS3Url", () => {
  it("throws an error if the URL does not start with 's3://'", () => {
    expect(() => parseS3Url("http://example.com")).toThrowError(
      "Invalid S3 URL: must start with 's3://'"
    );
  });

  it("throws an error if the bucket name is missing", () => {
    expect(() => parseS3Url("s3://")).toThrowError(
      "Invalid S3 URL: bucket name is missing"
    );
    expect(() => parseS3Url("s3:///mykey")).toThrowError(
      "Invalid S3 URL: bucket name is missing"
    );
  });

  it("parses a valid S3 URL with only bucket and no key", () => {
    const result = parseS3Url("s3://my-bucket");
    expect(result).toEqual({ bucket: "my-bucket", key: "" });
  });

  it("parses a valid S3 URL with bucket and key", () => {
    const result = parseS3Url("s3://my-bucket/path/to/object.txt");
    expect(result).toEqual({
      bucket: "my-bucket",
      key: "path/to/object.txt",
    });
  });

  it("parses a valid S3 URL with bucket, key, and additional slashes", () => {
    const result = parseS3Url("s3://bucket/dir/subdir/file.txt");
    expect(result).toEqual({
      bucket: "bucket",
      key: "dir/subdir/file.txt",
    });
  });

  it("parses a valid S3 URL that includes a query string without versionId", () => {
    const result = parseS3Url("s3://bucket/key?foo=bar&baz=qux");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key",
    });
  });

  it("parses a valid S3 URL that includes a versionId query parameter", () => {
    const result = parseS3Url("s3://bucket/key?versionId=abc123");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key",
      version: "abc123",
    });
  });

  it("parses a valid S3 URL that includes multiple query parameters and versionId is not the first", () => {
    const result = parseS3Url("s3://bucket/key?foo=bar&versionId=xyz789&baz=qux");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key",
      version: "xyz789",
    });
  });

  it("handles a URL with query string but empty query parameter value for versionId", () => {
    const result = parseS3Url("s3://bucket/key?versionId=");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key",
    });
  });

  it("handles a URL with a question mark but no query parameters", () => {
    const result = parseS3Url("s3://bucket/key?");
    expect(result).toEqual({
      bucket: "bucket",
      key: "key",
    });
  });
});