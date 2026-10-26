const FLOWS = new Set(['F01-create-search', 'F02-duplicate-id']);
const ENVIRONMENT = 'isolated-lab';

export function validatePlan(plan) {
  const expectedRefs = plan?.flowId === 'F01-create-search'
    ? ['AC-EMP-01', 'AC-EMP-02']
    : ['LAB-PBAAD-01', 'LAB-PBAAD-02'];
  if (!plan || !FLOWS.has(plan.flowId) || plan.environmentAlias !== ENVIRONMENT ||
      plan.sourceVersion !== 'SOURCE-PBAAD-v1' || !Array.isArray(plan.requirementRefs) ||
      expectedRefs.some(ref => !plan.requirementRefs.includes(ref)) ||
      plan.requirementRefs.some(ref => !expectedRefs.includes(ref)) ||
      typeof plan.runId !== 'string' || !plan.runId ||
      typeof plan.attemptId !== 'string' || !plan.attemptId) {
    throw new Error('Plan rejected before runner invocation');
  }
  return plan;
}

export function verdictFor(assertions) {
  if (!Array.isArray(assertions) || assertions.length === 0) return 'FAIL';
  for (const assertion of assertions) {
    if (assertion?.passed !== true) return 'FAIL';
  }
  return 'PASS';
}

function syntheticRunner(plan) {
  const id = `E2E-${plan.runId}-${plan.attemptId}`;
  // shortcut: in-memory fixtures stand in for PortalLite; replace after trainer provides the isolated-lab adapter.
  const records = plan.flowId === 'F01-create-search' ? [] : [{ id, department: 'HR' }];
  const create = record => {
    if (records.some(existing => existing.id === record.id)) return false;
    records.push(record);
    return true;
  };
  const originalDepartment = records[0]?.department;
  const created = plan.flowId === 'F01-create-search' && create({ id, department: 'QA' });
  const duplicateRejected = plan.flowId === 'F02-duplicate-id' && !create({ id, department: 'QA' });
  const exactMatches = records.filter(record => record.id === id);
  const assertions = plan.flowId === 'F01-create-search'
    ? [{ id: 'F01-CREATED', passed: created },
       { id: 'F01-ID', passed: exactMatches.length === 1 && exactMatches[0].id === id },
       { id: 'F01-DEPARTMENT', passed: exactMatches[0]?.department === 'QA' }]
    : [{ id: 'F02-DUPLICATE-REJECTED', passed: duplicateRejected },
       { id: 'F02-EXACT-ID-COUNT', passed: exactMatches.length === 1 },
       { id: 'F02-DEPARTMENT-UNCHANGED', passed: exactMatches[0]?.department === originalDepartment }];
  return { assertions, cleanup: 'SIMULATED' };
}

export function runRequest(request, planner) {
  const proposal = planner(request);
  const plan = validatePlan(proposal);
  const result = syntheticRunner(plan);
  return {
    mode: 'SIMULATED',
    runId: plan.runId,
    attemptId: plan.attemptId,
    sourceVersion: plan.sourceVersion,
    flowId: plan.flowId,
    assertions: result.assertions,
    cleanup: result.cleanup,
    verdict: verdictFor(result.assertions),
    limitations: ['Synthetic runner only; no app or lab was contacted.', 'Planner output was not evaluated as an actual model.']
  };
}

if (process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).href) {
  const report = runRequest('Run F01 in isolated-lab', () => ({
    flowId: 'F01-create-search', environmentAlias: ENVIRONMENT,
    sourceVersion: 'SOURCE-PBAAD-v1', requirementRefs: ['AC-EMP-01', 'AC-EMP-02'],
    runId: 'demo-001', attemptId: 'a1'
  }));
  console.log(JSON.stringify(report, null, 2));
}
