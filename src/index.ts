import fs from 'fs';
import path from 'path';

// Validate the file exists at the specified path
export async function validateFilePath(filePath: string) {
  try {
    const stat = await fs.promises.stat(path.join(__dirname, filePath));

    return Boolean(stat);
  } catch {
    return false;
  }
}

// Read the contents of the CSV
export async function readCSV(filePath: string) {
  const fileExists = await validateFilePath(filePath);

  if (!fileExists) {
    throw new Error('File does not exist');
  }

  const fileContents = await fs.promises.readFile(
    path.join(__dirname, filePath)
  );

  return fileContents.toString();
}

export function splitByLine(input: string): Array<string> {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

// What are the heads of the CSV?
export function getHeaders(line: string): Array<string> {
  return line.split(',').filter((item) => item.trim().length > 0);
}

// Map over CSV lines and generate a new array of objects
export function mapCSV(csvLines: string[]): Array<Object> {
  const [headerLine, ...remainingLines] = csvLines;

  const headers = getHeaders(headerLine);

  return remainingLines.map((line) => {
    const values = line.split(',');

    return headers.reduce((obj: NodeJS.Dict<string | number>, key, i) => {
      if (key === 'id') {
        obj[key] = parseInt(values[i], 10);
      } else {
        obj[key] = values[i];
      }

      return obj;
    }, {});
  });
}

// Output a JSON file with the data
export async function outputJSON(filePath: string, data: Object) {
  const fileExists = await validateFilePath(filePath);

  if (fileExists) {
    throw new Error('File already exists');
  }

  await fs.promises.writeFile(
    path.join(__dirname, filePath),
    JSON.stringify(data, null, 2)
  );
}
