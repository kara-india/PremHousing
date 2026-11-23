const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parsePremAccessCommand(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { error: 'Invalid request.' };
  }
  const reason = typeof input.reason === 'string' ? input.reason.trim() : '';
  if (reason.length < 8 || reason.length > 500) {
    return { error: 'A reason between 8 and 500 characters is required.' };
  }

  if (input.action === 'grant_staff' || input.action === 'revoke_staff') {
    if (typeof input.user_id !== 'string' || !UUID_PATTERN.test(input.user_id)) {
      return { error: 'A valid target user id is required.' };
    }
    return { command: { action: input.action, userId: input.user_id, reason } };
  }

  if (input.action === 'review_broker') {
    if (typeof input.organization_id !== 'string' || !UUID_PATTERN.test(input.organization_id)) {
      return { error: 'A valid organization id is required.' };
    }
    if (!['approved', 'rejected', 'suspended'].includes(input.review_status)) {
      return { error: 'Choose an allowed broker review status.' };
    }
    return { command: {
      action: input.action,
      organizationId: input.organization_id,
      reviewStatus: input.review_status,
      reason,
    } };
  }

  return { error: 'Unsupported access action.' };
}

export function canManagePremRole(actor, target) {
  if (!actor?.id || actor.app_metadata?.role !== 'admin') return false;
  if (!target?.id || actor.id === target.id) return false;
  if (target.app_metadata?.role === 'admin') return false;
  return target.app_metadata?.role == null || target.app_metadata.role === 'staff';
}
