import { getOutputPayload } from './getOutputPayload';
import { lambdaEventType } from '@/utils/lambdaEventType';

jest.mock('@/utils/lambdaEventType', () => ({
  lambdaEventType: jest.fn(),
}));

describe('getOutputPayload', () => {
  const lambdaEventTypeMock = lambdaEventType as jest.MockedFunction<typeof lambdaEventType>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when event type is api-gateway', () => {
    beforeEach(() => {
      lambdaEventTypeMock.mockReturnValue('api-gateway');
    });

    it('returns a response with a 500 status code if an error is passed', () => {
      const error = new Error('Something went wrong');
      const event = {};
      const response = getOutputPayload(event, error);
      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify({ error: 'Something went wrong' }),
      });
    });

    it('returns a response with a 500 status code if response is undefined', () => {
      const event = {};
      const response = getOutputPayload(event, undefined);
      expect(response).toEqual({
        statusCode: 500,
        body: JSON.stringify({ error: 'Unknown error' }),
      });
    });

    it('returns a response with a 200 status code and stringified body if response is an object', () => {
      const event = {};
      const responseBody = { message: 'Success' };
      const response = getOutputPayload(event, responseBody);
      expect(response).toEqual({
        statusCode: 200,
        body: JSON.stringify(responseBody),
      });
    });

    it('returns a response with a 200 status code and body if response is a string', () => {
      const event = {};
      const responseBody = 'Success';
      const response = getOutputPayload(event, responseBody);
      expect(response).toEqual({
        statusCode: 200,
        body: responseBody,
      });
    });
  });

  describe('when event type is bedrock', () => {
    beforeEach(() => {
      lambdaEventTypeMock.mockReturnValue('bedrock');
    });

    it('returns the response directly', () => {
      const event = {};
      const response = { data: 'bedrock response' };
      const result = getOutputPayload(event, response);
      expect(result).toEqual(response);
    });
  });

  describe('when event type is unknown', () => {
    beforeEach(() => {
      lambdaEventTypeMock.mockReturnValue('unknown');
    });

    it('throws the error if response is an instance of Error', () => {
      const event = {};
      const error = new Error('Unknown error');
      expect(() => getOutputPayload(event, error)).toThrow('Unknown error');
    });

    it('returns the response directly if it is not an Error', () => {
      const event = {};
      const response = { data: 'unknown event response' };
      const result = getOutputPayload(event, response);
      expect(result).toEqual(response);
    });
  });
});