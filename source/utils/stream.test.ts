import { Readable } from 'stream';
import { streamToString, streamToObject } from '@/utils/stream';

const createMockStream = (data: any) => {
  const stream = new Readable({
    read() {}
  });
  stream.push(data);
  stream.push(null); // Signifies the end of the stream
  return stream;
};

describe('streamToString', () => {
  it('successfully converts a stream to a string', async () => {
    const testString = 'Hello, world!';
    const mockStream = createMockStream(testString);
    const result = await streamToString(mockStream);
    expect(result).toEqual(testString);
  });

  it('handles stream error', () => {
    const mockStream = new Readable({
      read() {
        this.emit('error', new Error('Stream error'));
      }
    });

    expect(streamToString(mockStream)).rejects.toEqual(new Error('Stream error'));
  });
});

describe('streamToObject', () => {
  it('successfully converts a JSON stream to an object', async () => {
    const testObject = { hello: 'world' };
    const mockStream = createMockStream(JSON.stringify(testObject));
    await expect(streamToObject(mockStream)).resolves.toEqual(testObject);
  });

  it('handles stream error', () => {
    const mockStream = new Readable({
      read() {
        this.emit('error', new Error('Stream error'));
      }
    });

    expect(streamToObject(mockStream)).rejects.toThrow('Stream error');
  });
});
