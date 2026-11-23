import { useEffect, useState } from 'react';
import { Check, Clock3, ShieldAlert, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './BrokerAccessPanel.css';

function BrokerAccessPanel({ role }) {
  const [organizations, setOrganizations] = useState([]);
  const [activity, setActivity] = useState([]);
  const [reasons, setReasons] = useState({});
  const [staffUserId, setStaffUserId] = useState('');
  const [staffReason, setStaffReason] = useState('');
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function load(isActive = () => true) {
    const [organizationResult, activityResult] = await Promise.all([
      supabase.from('prem_broker_organizations').select('id,name,maharera_number,contact_email,contact_phone,review_status,created_by,created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('prem_listing_activity').select('id,organization_id,property_id,actor_user_id,action,previous_status,next_status,occurred_at,property:properties(title),organization:prem_broker_organizations(name)').order('occurred_at', { ascending: false }).limit(30),
    ]);
    if (!isActive()) return;
    if (organizationResult.error || activityResult.error) {
      setError('Broker applications or listing activity could not be loaded. Check Phase 1 migrations and staff access.');
      return;
    }
    setOrganizations(organizationResult.data ?? []);
    setActivity(activityResult.data ?? []);
    setError('');
  }

  useEffect(() => {
    let active = true;
    async function refresh() {
      await load(() => active);
    }
    refresh().catch(() => { if (active) setError('Broker access data could not be loaded.'); });
    return () => { active = false; };
  }, []);

  async function review(organization, reviewStatus) {
    if (role !== 'admin') return;
    setBusyId(organization.id);
    setError('');
    setMessage('');
    const reason = (reasons[organization.id] ?? '').trim();
    const { error: reviewError } = await supabase.functions.invoke('manage-prem-access', {
      body: { action: 'review_broker', organization_id: organization.id, review_status: reviewStatus, reason },
    });
    setBusyId('');
    if (reviewError) {
      setError('Review could not be saved. Confirm the admin role, function deployment, and a reason of at least 8 characters.');
      return;
    }
    setReasons((current) => ({ ...current, [organization.id]: '' }));
    setMessage(`“${organization.name}” marked ${reviewStatus}.`);
    await load();
  }

  async function changeStaffRole(action) {
    if (role !== 'admin') return;
    setBusyId('staff-role');
    setError('');
    setMessage('');
    const { error: roleError } = await supabase.functions.invoke('manage-prem-access', {
      body: { action, user_id: staffUserId.trim(), reason: staffReason.trim() },
    });
    setBusyId('');
    if (roleError) {
      setError('Staff access could not be updated. Confirm the account ID, admin role, and reason.');
      return;
    }
    setStaffUserId('');
    setStaffReason('');
    setMessage(action === 'grant_staff' ? 'Staff access granted and recorded.' : 'Staff access revoked and recorded.');
  }

  return (
    <section className="admin-panel broker-access-panel" aria-labelledby="broker-access-title">
      <div className="admin-panel-heading"><div><span className="eyebrow">BROKER ACCESS</span><h2 id="broker-access-title">Applications &amp; listing activity</h2></div><span className="broker-panel-count"><Clock3 size={14} /> {organizations.filter((item) => item.review_status === 'pending').length} pending</span></div>
      {error && <p className="broker-panel-message broker-panel-error" role="alert"><ShieldAlert size={14} /> {error}</p>}
      {message && <p className="broker-panel-message" role="status">{message}</p>}
      {role === 'admin' && <div className="broker-staff-access"><strong>Manage staff access</strong><p>Use the account UUID from Supabase Auth. Admin accounts cannot be changed here.</p><div><input aria-label="Account UUID for staff access" value={staffUserId} onChange={(event) => setStaffUserId(event.target.value)} placeholder="Auth user UUID" /><input aria-label="Reason for staff role change" minLength={8} maxLength={500} value={staffReason} onChange={(event) => setStaffReason(event.target.value)} placeholder="Reason (8–500 characters)" /></div><div><button type="button" disabled={busyId === 'staff-role' || staffUserId.trim().length !== 36 || staffReason.trim().length < 8} onClick={() => changeStaffRole('grant_staff')}>Grant staff</button><button type="button" className="broker-reject" disabled={busyId === 'staff-role' || staffUserId.trim().length !== 36 || staffReason.trim().length < 8} onClick={() => changeStaffRole('revoke_staff')}>Revoke staff</button></div></div>}
      <div className="broker-application-list">
        {organizations.length === 0 ? <p className="admin-inline-help">No brokerage applications have been submitted.</p> : organizations.map((organization) => (
          <article className="broker-application" key={organization.id}>
            <div className="broker-application-heading"><div><strong>{organization.name}</strong><span>{organization.contact_email || 'No email'}{organization.contact_phone ? ` · ${organization.contact_phone}` : ''}</span></div><span className={`broker-status broker-status-${organization.review_status}`}>{organization.review_status}</span></div>
            <p>MahaRERA {organization.maharera_number} · Application {new Date(organization.created_at).toLocaleDateString('en-IN')} · Account {organization.created_by.slice(0, 8)}…</p>
            {organization.review_status === 'pending' && <p className="broker-verification-note">Verify the MahaRERA number before approving this brokerage.</p>}
            {role === 'admin' && <div className="broker-review-actions">
              <input aria-label={`Review reason for ${organization.name}`} minLength={8} maxLength={500} value={reasons[organization.id] ?? ''} placeholder="Reason for decision (required)" onChange={(event) => setReasons((current) => ({ ...current, [organization.id]: event.target.value }))} />
              <button type="button" disabled={busyId === organization.id || (reasons[organization.id] ?? '').trim().length < 8} onClick={() => review(organization, 'approved')}><Check size={14} /> Approve</button>
              <button type="button" className="broker-reject" disabled={busyId === organization.id || (reasons[organization.id] ?? '').trim().length < 8} onClick={() => review(organization, organization.review_status === 'approved' ? 'suspended' : 'rejected')}><X size={14} /> {organization.review_status === 'approved' ? 'Suspend' : 'Reject'}</button>
            </div>}
          </article>
        ))}
      </div>
      <div className="broker-activity-heading"><h3>Recent listing activity</h3><span>Latest 30 events</span></div>
      {activity.length === 0 ? <p className="admin-inline-help">No broker listing changes have been recorded yet.</p> : <div className="broker-activity-list">{activity.map((item) => <article key={item.id}><span>{item.action.replaceAll('_', ' ')}</span><span>{item.property?.title ?? `Property ${item.property_id.slice(0, 8)}…`} · {item.organization?.name ?? `Account ${item.actor_user_id.slice(0, 8)}…`}</span><time dateTime={item.occurred_at}>{new Date(item.occurred_at).toLocaleString('en-IN')}</time></article>)}</div>}
    </section>
  );
}

export default BrokerAccessPanel;
