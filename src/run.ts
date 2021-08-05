import { readCSV, splitByLine, mapCSV, outputJSON } from './';

(async () => {
  const csv = await readCSV('../orders.csv');

  const csvLines = splitByLine(csv);

  const outputObject = mapCSV(csvLines);

  await outputJSON('../orders.json', outputObject);

  console.log('Done');
})();
