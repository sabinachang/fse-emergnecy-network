const { removeStopWords } = require('../messageStopWords');

test('should filter out stop words if presented', async () => {
  expect(removeStopWords('able banana dolla')).toEqual('banana dolla');
});
