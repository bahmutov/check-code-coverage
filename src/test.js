const test = require('ava');
const {getCoverageBadge, getCoverageFromText} = require('.').badge

test('parses 100%', t => {
  const text = getCoverageBadge(100)
  const pct = getCoverageFromText(text)
  t.is(pct, 100, '100%')
});

test('parses 99%', t => {
  const text = getCoverageBadge(99)
  const pct = getCoverageFromText(text)
  t.is(pct, 99, '99%')
});

test('parses 99.99%', t => {
  const text = getCoverageBadge(99.99)
  const pct = getCoverageFromText(text)
  t.is(pct, 99.99, '99.99%')
});

test('parses 60%', t => {
  const text = getCoverageBadge(60)
  const pct = getCoverageFromText(text)
  t.is(pct, 60, '60%')
});

test('parses 2%', t => {
  const text = getCoverageBadge(2)
  const pct = getCoverageFromText(text)
  t.is(pct, 2, '2%')
});

test('parses 100.0%', t => {
  const text = getCoverageBadge(100.0)
  const pct = getCoverageFromText(text)
  t.is(pct, 100, '100.0%')
});

test('parses 80.25%', t => {
  const text = getCoverageBadge(80.25)
  const pct = getCoverageFromText(text)
  t.is(pct, 80.25, '80.25%')
});

test('parses 32.5%', t => {
  const text = getCoverageBadge(32.5)
  const pct = getCoverageFromText(text)
  t.is(pct, 32.5, '32.5%')
});

test('parses 2.5%', t => {
  const text = getCoverageBadge(2.5)
  const pct = getCoverageFromText(text)
  t.is(pct, 2.5, '2.5%')
});
