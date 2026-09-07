import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { runKotcV2ProductionSimulation } from './lib/kotcV2Simulator.js';

function integerList(value:any, min:number, max:number) {
  if (value == null) return null;
  const raw = Array.isArray(value) ? value : [value];
  const values = raw.map(Number);
  if (values.some((item) => !Number.isInteger(item) || item < min || item > max)) {
    throw new Error(`Values must be whole numbers from ${min} to ${max}.`);
  }
  return [...new Set(values)];
}

Deno.serve(async (req) => {
  const startedAt = new Date().toISOString();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Platform admin access required for the production KOTC simulator.' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const rounds = body.rounds == null ? 9 : Number(body.rounds);
    if (!Number.isInteger(rounds) || rounds < 1 || rounds > 50) {
      return Response.json({ error: 'rounds must be a whole number from 1 to 50.' }, { status: 400 });
    }

    const playerCounts = integerList(body.playerCounts ?? body.numPlayers, 4, 18);
    const courtLimits = integerList(body.courtLimits ?? body.numCourts, 1, 4);
    const result = runKotcV2ProductionSimulation({ rounds, playerCounts, courtLimits });
    const completedAt = new Date().toISOString();

    // Test evidence is persisted when a tenant/club scope is explicitly supplied.
    if (body.tenantId && body.clubId) {
      await base44.asServiceRole.entities.KotcEngineTestRun.create({
        tenant_id: String(body.tenantId),
        club_id: String(body.clubId),
        engine_version: result.engineVersion,
        rules_version: result.rulesVersion,
        test_suite: 'Gate 2.5 production integrated simulator',
        status: result.passed ? 'pass' : 'fail',
        started_at: startedAt,
        completed_at: completedAt,
        scenario_count: result.scenarioCount,
        failure_count: result.failureCount,
        details_json: JSON.stringify({
          roundsPerSteadyScenario: result.roundsPerSteadyScenario,
          steadyScenarioCount: result.steadyScenarioCount,
          checkCount: result.checkCount,
          failedChecks: result.failedChecks,
        }),
      });
    }

    return Response.json({
      passed: result.passed,
      engineVersion: result.engineVersion,
      rulesVersion: result.rulesVersion,
      roundsPerSteadyScenario: result.roundsPerSteadyScenario,
      steadyScenarioCount: result.steadyScenarioCount,
      scenarioCount: result.scenarioCount,
      checkCount: result.checkCount,
      failureCount: result.failureCount,
      failedChecks: result.failedChecks,
      runs: body.includeRuns ? result.runs : undefined,
    }, { status: result.passed ? 200 : 409 });
  } catch (error) {
    return Response.json({ error: error?.message || 'Unexpected KOTC simulator error' }, { status: 500 });
  }
});
