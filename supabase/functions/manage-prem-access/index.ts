import { createClient } from 'npm:@supabase/supabase-js@2.119.2';
import { canManagePremRole, parsePremAccessCommand } from './premAccessPolicy.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed.' });

  const authorization = request.headers.get('Authorization') ?? '';
  if (!/^Bearer\s+\S+$/i.test(authorization)) {
    return respond(401, { error: 'Sign in with a PREM admin account.' });
  }

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  const serverKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SECRET_KEY');
  if (!projectUrl || !publishableKey || !serverKey) {
    console.error('PREM access function is missing a required server configuration value.');
    return respond(503, { error: 'PREM access management is not configured.' });
  }

  const userClient = createClient(projectUrl, publishableKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const actor = userData.user;
  if (userError || !actor) return respond(401, { error: 'Your session could not be verified.' });
  if (actor.app_metadata?.role !== 'admin') {
    return respond(403, { error: 'Trusted PREM admin access is required.' });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return respond(400, { error: 'Request body must be valid JSON.' });
  }
  const parsed = parsePremAccessCommand(payload);
  if (parsed.error || !parsed.command) return respond(400, { error: parsed.error ?? 'Invalid request.' });

  const adminClient = createClient(projectUrl, serverKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  if (parsed.command.action === 'review_broker') {
    const { error } = await adminClient.rpc('prem_admin_review_broker_organization', {
      p_actor_id: actor.id,
      p_organization_id: parsed.command.organizationId,
      p_review_status: parsed.command.reviewStatus,
      p_reason: parsed.command.reason,
    });
    if (error) {
      console.error('Broker organization review failed.', error.code ?? 'unknown_error');
      return respond(400, { error: 'PREM could not save this broker review. Check the organization state and try again.' });
    }
    return respond(200, { ok: true, action: parsed.command.action, status: parsed.command.reviewStatus });
  }

  const { data: targetResult, error: targetError } = await adminClient.auth.admin.getUserById(parsed.command.userId);
  const target = targetResult.user;
  if (targetError || !target) return respond(404, { error: 'The selected PREM account was not found.' });
  if (!canManagePremRole(actor, target)) {
    return respond(403, { error: 'This account cannot receive or lose the staff role through this action.' });
  }

  const granting = parsed.command.action === 'grant_staff';
  const currentRole = target.app_metadata?.role;
  if ((granting && currentRole === 'staff') || (!granting && currentRole == null)) {
    return respond(200, { ok: true, action: parsed.command.action, unchanged: true });
  }

  const previousAppMetadata = target.app_metadata ?? {};
  const nextAppMetadata = { ...previousAppMetadata };
  if (granting) nextAppMetadata.role = 'staff';
  else delete nextAppMetadata.role;

  const { error: updateError } = await adminClient.auth.admin.updateUserById(target.id, {
    app_metadata: nextAppMetadata,
  });
  if (updateError) {
    console.error('PREM staff role update failed.', updateError.code ?? 'unknown_error');
    return respond(500, { error: 'PREM could not update this staff role.' });
  }

  const { error: auditError } = await adminClient.from('prem_access_audit').insert({
    action: granting ? 'staff_granted' : 'staff_revoked',
    actor_user_id: actor.id,
    subject_user_id: target.id,
    reason: parsed.command.reason,
  });
  if (auditError) {
    const { error: rollbackError } = await adminClient.auth.admin.updateUserById(target.id, {
      app_metadata: previousAppMetadata,
    });
    console.error('PREM role audit write failed; rollback attempted.', rollbackError?.code ?? auditError.code ?? 'unknown_error');
    return respond(500, { error: 'PREM could not record the access change; the update was rolled back when possible.' });
  }

  return respond(200, { ok: true, action: parsed.command.action, role: granting ? 'staff' : null });
});
