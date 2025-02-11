import { lambdaEventType } from "./lambdaEventType";

describe('lambdaEventType', () => {
  it('identifies an API Gateway event', () => {
    const event = { httpMethod: 'GET', path: '/example' };
    expect(lambdaEventType(event)).toBe('api-gateway');
  });

  it('identifies an S3 event', () => {
    const event = { Records: [{ eventSource: 'aws:s3' }] };
    expect(lambdaEventType(event)).toBe('s3');
  });

  it('identifies an SNS event', () => {
    const event = { Records: [{ EventSource: 'aws:sns' }] };
    expect(lambdaEventType(event)).toBe('sns');
  });

  it('identifies an SQS event', () => {
    const event = { Records: [{ eventSource: 'aws:sqs' }] };
    expect(lambdaEventType(event)).toBe('sqs');
  });

  it('identifies a Bedrock event', () => {
    const event = { agent: 'someAgent' };
    expect(lambdaEventType(event)).toBe('bedrock');
  });

  it('returns "unknown" for an unrecognized event', () => {
    const event = { unknownProperty: 'unknownValue' };
    expect(lambdaEventType(event)).toBe('unknown');
  });

  it('returns "unknown" for an empty event', () => {
    const event = {};
    expect(lambdaEventType(event)).toBe('unknown');
  });

  it('returns "unknown" for undefined input', () => {
    expect(lambdaEventType(undefined as any)).toBe('unknown');
  });

  it('returns "unknown" for null input', () => {
    expect(lambdaEventType(null as any)).toBe('unknown');
  });
});