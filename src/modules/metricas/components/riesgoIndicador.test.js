import { createRiesgoBar, createRiesgoChip, createScoreCircle } from './riesgoIndicador.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

export function runTests() {
  console.log('Running tests for riesgoIndicador...');
  let passed = 0;
  let total = 0;

  try {
    total++;
    assert(createRiesgoBar(20).includes('bg-success'), 'createRiesgoBar(20) should contain bg-success');
    passed++;

    total++;
    assert(createRiesgoBar(50).includes('bg-warning'), 'createRiesgoBar(50) should contain bg-warning');
    passed++;

    total++;
    assert(createRiesgoBar(75).includes('bg-danger'), 'createRiesgoBar(75) should contain bg-danger');
    passed++;

    total++;
    const chipAlto = createRiesgoChip('alto');
    assert(chipAlto.includes('Alto') && (chipAlto.includes('bg-') || chipAlto.includes('text-')), 'createRiesgoChip("alto") should contain "Alto" and a color class');
    passed++;

    total++;
    assert(createRiesgoChip('bajo').includes('Bajo'), 'createRiesgoChip("bajo") should contain "Bajo"');
    passed++;

    total++;
    const circle = createScoreCircle(80);
    assert(typeof circle === 'string' && circle.trim().length > 0, 'createScoreCircle(80) should return non-empty HTML string');
    passed++;

    console.log(`✅ All ${passed}/${total} tests passed!`);
    return true;
  } catch (error) {
    console.error(`❌ ${error.message}`);
    console.log(`⚠️ ${passed}/${total} tests passed.`);
    return false;
  }
}

// To allow running via node directly
if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].endsWith('riesgoIndicador.test.js')) {
  runTests();
}
