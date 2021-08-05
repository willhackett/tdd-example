import path from 'path';

const statFn = jest.fn();
const readFileFn = jest.fn();
const writeFileFn = jest.fn();

jest.mock('fs', () => ({
  promises: {
    stat: statFn,
    readFile: readFileFn,
    writeFile: writeFileFn,
  },
}));

import {
  validateFilePath,
  readCSV,
  splitByLine,
  getHeaders,
  mapCSV,
  outputJSON,
} from '../';

describe('src/index', () => {
  describe('validateFilePath', () => {
    beforeEach(() => {
      statFn.mockClear();
    });

    test('should return true if the file exists', async () => {
      statFn.mockReturnValueOnce(Promise.resolve({}));

      const fileExists = await validateFilePath(
        './someFileThatShouldExist.txt'
      );

      expect(fileExists).toBe(true);
    });

    test('should return false if the file does not exist', async () => {
      statFn.mockReturnValueOnce(
        Promise.reject(new Error('File does not exist'))
      );

      const fileExists = await validateFilePath(
        './someFileThatShouldNotExist.txt'
      );

      expect(fileExists).toBe(false);
    });
  });

  describe('readCSV', () => {
    beforeEach(() => {
      statFn.mockClear();
      readFileFn.mockClear();
    });
    test('should read the contents of acsv file', async () => {
      statFn.mockReturnValueOnce(Promise.resolve({}));
      readFileFn.mockReturnValueOnce(Promise.resolve('csv contents'));

      const csvContents = await readCSV('./someFileThatShouldExist.csv');

      expect(csvContents).toBe('csv contents');
    });
    test('should throw an error if the file does not exist', async () => {
      statFn.mockReturnValueOnce(
        Promise.reject(new Error('File does not exist'))
      );

      try {
        await readCSV('./someFileThatShouldNotExist.csv');
      } catch (e) {
        expect(e.message).toBe('File does not exist');
      }
    });
  });

  describe('splitByLine', () => {
    test('should take a multiline input and return it in an array', () => {
      const input = `this is a
      multiline
      input`;

      const output = ['this is a', 'multiline', 'input'];

      expect(splitByLine(input)).toEqual(output);
    });
    test('should take a multiline input with extra empty lines and return an array', () => {
      const input = `
      this is a
      multiline
      input
      
`;

      const output = ['this is a', 'multiline', 'input'];

      expect(splitByLine(input)).toEqual(output);
    });
    test('should handle an empty string', () => {
      const input = '';

      const output: string[] = [];

      expect(splitByLine(input)).toEqual(output);
    });
  });
  describe('getHeaders', () => {
    test('should return a list of the headers', () => {
      const input = 'a,b,c,d';

      const output = ['a', 'b', 'c', 'd'];

      expect(getHeaders(input)).toEqual(output);
    });
  });
  describe('mapCSV', () => {
    test('should map the rows of the CSV to the values in the header row', () => {
      const input = ['a,b,c,d', 'some,data,goes,here'];

      const output = [
        {
          a: 'some',
          b: 'data',
          c: 'goes',
          d: 'here',
        },
      ];

      expect(mapCSV(input)).toEqual(output);
    });
    test('should map the rows of the CSV to the values in the header row', () => {
      const input = ['id,b,c,d', '1234,data,goes,here'];

      const output = [
        {
          id: 1234,
          b: 'data',
          c: 'goes',
          d: 'here',
        },
      ];

      expect(mapCSV(input)).toEqual(output);
    });
  });
  describe('outputJSON', () => {
    beforeEach(() => {
      statFn.mockClear();
      writeFileFn.mockClear();
    });
    test('should call fs.promises.writeFile with the JSON payload', async () => {
      expect(writeFileFn).not.toHaveBeenCalled();
      statFn.mockRejectedValueOnce(new Error('File exists'));

      const payload = {
        a: 'b',
      };

      await outputJSON('./someFileThatShouldExist.json', payload);

      expect(writeFileFn).toHaveBeenCalledWith(
        path.join(__dirname, '../someFileThatShouldExist.json'),
        JSON.stringify(payload, null, 2)
      );
    });
    test('should throw an error if the file already exists', async () => {
      expect(writeFileFn).not.toHaveBeenCalled();
      statFn.mockResolvedValueOnce(true);

      try {
        await outputJSON('./someFileThatShouldExist.json', {});
      } catch (e) {
        expect(e.message).toBe('File already exists');
      }
    });
  });
});
