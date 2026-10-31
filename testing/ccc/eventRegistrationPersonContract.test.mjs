import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('EventRegistration supports explicit optional Person link without changing existing required fields', () => {
  const schema = JSON.parse(readFileSync(new URL('../../base44/entities/EventRegistration.jsonc', import.meta.url), 'utf8'));
  assert.equal(schema.properties.person_id.type, 'string');
  assert.equal(schema.required.includes('person_id'), false);
  for (const field of ['tenant_id', 'club_id', 'event_id', 'full_name', 'email', 'registration_status']) assert.ok(schema.required.includes(field), field);
});
