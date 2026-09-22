const fs = require('fs');
const { SourceMapConsumer } = require('source-map');

const rawSourceMap = JSON.parse(fs.readFileSync('dist/assets/index-BSw_ccnX.js.map', 'utf8'));

SourceMapConsumer.with(rawSourceMap, null, consumer => {
  const frames = [
    { line: 328, column: 188687 },
    { line: 58, column: 3820 },
    { line: 58, column: 7440 },
    { line: 58, column: 6824 },
    { line: 67, column: 730 },
    { line: 328, column: 233417 }
  ];

  frames.forEach(f => {
    console.log(consumer.originalPositionFor(f));
  });
});
