import { trailingSlashIt, unLeadingSlashIt, unTrailingSlashIt } from '@/utils/slashes';

describe('unTrailingSlashIt', () => {
  it('removes the trailing slash from a string', () => {
    expect(unTrailingSlashIt('example/')).toBe('example');
  });

  it('returns the original string if it does not end with a slash', () => {
    expect(unTrailingSlashIt('example')).toBe('example');
  });

  it('returns an empty string if the input is undefined', () => {
    expect(unTrailingSlashIt(undefined)).toBe('');
  });

  it('returns an empty string if the input is an empty string', () => {
    expect(unTrailingSlashIt('')).toBe('');
  });
});

describe('trailingSlashIt', () => {
  it('adds a trailing slash to a string', () => {
    expect(trailingSlashIt('example')).toBe('example/');
  });

  it('returns the original string if it already ends with a slash', () => {
    expect(trailingSlashIt('example/')).toBe('example/');
  });

  it('returns a slash if the input is undefined', () => {
    expect(trailingSlashIt(undefined)).toBe('/');
  });

  it('returns a slash if the input is an empty string', () => {
    expect(trailingSlashIt('')).toBe('/');
  });
});


describe("unLeadingSlashIt", () => {
  it('removes the leading slash if present', () => {
    const result = unLeadingSlashIt("/example");
    expect(result).toBe("example");
  });

  it('returns the same string if no leading slash is present', () => {
    const result = unLeadingSlashIt("example");
    expect(result).toBe("example");
  });

  it('returns an empty string if input is undefined', () => {
    const result = unLeadingSlashIt(undefined);
    expect(result).toBe("");
  });

  it('returns an empty string if input is an empty string', () => {
    const result = unLeadingSlashIt("");
    expect(result).toBe("");
  });
});