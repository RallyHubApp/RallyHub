/** Preset Finish is an optional timed exhibition phase, never ladder movement. */
export const PRESET_FINISH_LIMIT = 2;
export function validatePresetFinish(presets, participantIds, courtCount = 4) {
  const errors = [];
  if (!Array.isArray(presets) || presets.length < 1 || presets.length > PRESET_FINISH_LIMIT) return ['Provide one or two preset rounds.'];
  const eligible = new Set(participantIds.map(String));
  presets.forEach((preset, index) => {
    const prefix = `Preset ${index + 1}`;
    if (!Number.isInteger(Number(preset.minutes)) || Number(preset.minutes) < 1 || Number(preset.minutes) > 60) errors.push(`${prefix}: duration must be 1–60 minutes.`);
    if (!Array.isArray(preset.courts) || preset.courts.length !== courtCount) { errors.push(`${prefix}: assign all ${courtCount} courts.`); return; }
    const ids = [];
    preset.courts.forEach((court, i) => {
      if (!Array.isArray(court.A) || court.A.length !== 2 || !Array.isArray(court.B) || court.B.length !== 2) errors.push(`${prefix}, Court ${i+1}: two players per team required.`);
      ids.push(...(court.A || []), ...(court.B || []));
    });
    if (new Set(ids.map(String)).size !== ids.length) errors.push(`${prefix}: duplicate player assignment.`);
    if (ids.some(id => !eligible.has(String(id)))) errors.push(`${prefix}: an unavailable player is assigned.`);
    const benched = participantIds.filter(id => !ids.map(String).includes(String(id)));
    if (benched.length > 0 && Number(preset.minutes) > 10) errors.push(`${prefix}: ${benched.length} players would sit out for ${preset.minutes} minutes (host warning).`);
  });
  return errors;
}
export function makePresetFinish(participantIds, count = 2, minutes = 15, courtCount = 4) {
  const ids = participantIds.map(String);
  return Array.from({length: Math.min(PRESET_FINISH_LIMIT, Math.max(1, count))}, (_, index) => {
    const order = index === 0 ? ids : [...ids.slice(2), ...ids.slice(0, 2)];
    return {minutes, courts: Array.from({length: courtCount}, (_, court) => ({A: order.slice(court*4, court*4+2), B: order.slice(court*4+2, court*4+4)}))};
  });
}
