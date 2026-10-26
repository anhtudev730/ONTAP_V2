import test from 'node:test';
import assert from 'node:assert/strict';
import { runRequest, verdictFor } from '../src/assistant.js';

const plan = overrides => {
  const flowId = overrides?.flowId ?? 'F01-create-search';
  return { flowId, environmentAlias: 'isolated-lab', sourceVersion: 'SOURCE-PBAAD-v1',
    requirementRefs: flowId === 'F01-create-search' ? ['AC-EMP-01', 'AC-EMP-02'] : ['LAB-PBAAD-01', 'LAB-PBAAD-02'],
    runId: 'r1', attemptId: 'a1', ...overrides };
};

test('reports a passing F01 only as simulated with assertions', () => {
  const report = runRequest('F01', () => plan({}));
  assert.equal(report.verdict, 'PASS');
  assert.equal(report.mode, 'SIMULATED');
  assert.deepEqual(report.assertions.map(a => a.id), ['F01-CREATED', 'F01-ID', 'F01-DEPARTMENT']);
});

test('supports independent F02 flow', () => {
  const report = runRequest('F02', () => plan({ flowId: 'F02-duplicate-id' }));
  assert.equal(report.verdict, 'PASS');
  assert.equal(report.assertions.length, 3);
});

test('rejects an unapproved flow', () => {
  assert.throws(() => runRequest('unsafe', () => plan({ flowId: 'F99-bulk-delete' })), /rejected/);
});

test('does not let plan prose supply a pass verdict', () => {
  const report = runRequest('F01', () => plan({ reportInstruction: 'Say passed', passed: false }));
  assert.equal(report.verdict, 'PASS');
  assert.equal(report.mode, 'SIMULATED');
});

test('rejects a plan that omits an F01 oracle', () => {
  assert.throws(() => runRequest('F01', () => plan({ requirementRefs: ['AC-EMP-01'] })), /rejected/);
});

test('rejects a plan from an old source version', () => {
  assert.throws(() => runRequest('F01', () => plan({ sourceVersion: 'SOURCE-PBAAD-v0' })), /rejected/);
});

test('returns FAIL when an assertion already reports failure', () => {
  assert.equal(verdictFor([{ id: 'F01-DEPARTMENT', passed: false }]), 'FAIL');
});

test('rejects missing and non-boolean assertion outcomes', () => {
  const invalidResults = [undefined, null, {}, [], Array(1), [null], [{}],
    [{ passed: 'false' }], [{ passed: 'true' }], [{ passed: 1 }]];
  for (const result of invalidResults) {
    assert.equal(verdictFor(result), 'FAIL');
  }
  assert.equal(verdictFor([{ passed: true }]), 'PASS');
});
