import test from 'node:test';
import assert from 'node:assert/strict';
import { canManagePremRole, parsePremAccessCommand } from '../supabase/functions/manage-prem-access/premAccessPolicy.js';

const admin = { id: '00000000-0000-4000-8000-000000000505', app_metadata: { role: 'admin' } };
const target = { id: '00000000-0000-4000-8000-000000000506', app_metadata: {} };

test('parses a staff grant command with normalized audit reason', () => {
  assert.deepEqual(parsePremAccessCommand({
    action: 'grant_staff', user_id: target.id, reason: '  PREM staff onboarding  ',
  }), { command: { action: 'grant_staff', userId: target.id, reason: 'PREM staff onboarding' } });
});

test('rejects malformed, unsupported, and underspecified access commands', () => {
  assert.ok(parsePremAccessCommand({ action: 'grant_staff', user_id: 'bad', reason: 'long enough reason' }).error);
  assert.ok(parsePremAccessCommand({ action: 'grant_admin', user_id: target.id, reason: 'long enough reason' }).error);
  assert.ok(parsePremAccessCommand({ action: 'revoke_staff', user_id: target.id, reason: 'short' }).error);
});

test('parses only allowed brokerage review decisions', () => {
  const result = parsePremAccessCommand({
    action: 'review_broker', organization_id: target.id, review_status: 'approved', reason: 'Documents reviewed',
  });
  assert.equal(result.command.reviewStatus, 'approved');
  assert.ok(parsePremAccessCommand({
    action: 'review_broker', organization_id: target.id, review_status: 'pending', reason: 'Documents reviewed',
  }).error);
});

test('only a trusted admin can change another non-admin account to or from staff', () => {
  assert.equal(canManagePremRole(admin, target), true);
  assert.equal(canManagePremRole({ ...admin, app_metadata: {}, user_metadata: { role: 'admin' } }, target), false);
  assert.equal(canManagePremRole({ ...admin, app_metadata: { role: 'staff' } }, target), false);
  assert.equal(canManagePremRole(admin, { ...target, app_metadata: { role: 'admin' } }), false);
  assert.equal(canManagePremRole(admin, { ...target, app_metadata: { role: 'customer' } }), false);
  assert.equal(canManagePremRole(admin, { ...admin }), false);
});
