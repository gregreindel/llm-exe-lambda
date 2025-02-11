import { lambdaEventType } from "@/utils/lambdaEventType";
import { getInputPayload } from "./getInputPayload";

// Mock lambdaEventType to control its output during tests
jest.mock('@/utils/lambdaEventType');

describe('getInputPayload', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should normalize API Gateway event', () => {
    const mockEvent = {
      body: JSON.stringify({ key: 'value' })
    };
    (lambdaEventType as jest.Mock).mockReturnValue('api-gateway');

    const result = getInputPayload(mockEvent);

    expect(result).toEqual({ key: 'value' });
    expect(lambdaEventType).toHaveBeenCalledWith(mockEvent);
  });

  it('should normalize S3 event', () => {
    const mockEvent = {
      Records: [{ s3: { bucket: 'my-bucket', key: 'my-key' } }]
    };
    (lambdaEventType as jest.Mock).mockReturnValue('s3');

    const result = getInputPayload(mockEvent);

    expect(result).toEqual({ bucket: 'my-bucket', key: 'my-key' });
    expect(lambdaEventType).toHaveBeenCalledWith(mockEvent);
  });

  it('should normalize SNS event', () => {
    const mockEvent = {
      Records: [{ Sns: { Message: 'Hello, SNS!' } }]
    };
    (lambdaEventType as jest.Mock).mockReturnValue('sns');

    const result = getInputPayload(mockEvent);

    expect(result).toEqual('Hello, SNS!');
    expect(lambdaEventType).toHaveBeenCalledWith(mockEvent);
  });

  it('should normalize SQS event', () => {
    const mockEvent = {
      Records: [{ body: 'Hello, SQS!' }]
    };
    (lambdaEventType as jest.Mock).mockReturnValue('sqs');

    const result = getInputPayload(mockEvent);

    expect(result).toEqual('Hello, SQS!');
    expect(lambdaEventType).toHaveBeenCalledWith(mockEvent);
  });

  it('should normalize Bedrock event', () => {
    const mockEvent = {
      agent: { input: { key: 'value' } }
    };
    (lambdaEventType as jest.Mock).mockReturnValue('bedrock');

    const result = getInputPayload(mockEvent);

    expect(result).toEqual({ key: 'value' });
    expect(lambdaEventType).toHaveBeenCalledWith(mockEvent);
  });

  it('should return the event unchanged if type is unknown', () => {
    const mockEvent = { some: 'data' };
    (lambdaEventType as jest.Mock).mockReturnValue('unknown');

    const result = getInputPayload(mockEvent);

    expect(result).toEqual(mockEvent);
    expect(lambdaEventType).toHaveBeenCalledWith(mockEvent);
  });
});
