import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './ListingModerationPanel.css';

function ListingModerationPanel({ properties, reviewerId, onReviewed }) {
  const pending = properties.filter((property) => property.review_status === 'pending');
  const [reasons, setReasons] = useState({});
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function review(property, status) {
    const reason = (reasons[property.id] ?? '').trim();
    if (status === 'rejected' && (reason.length < 8 || reason.length > 500)) {
      setError('A rejection reason between 8 and 500 characters is required.');
      return;
    }
    setBusyId(property.id);
    setError('');
    setNotice('');
    const { data, error: updateError } = await supabase
      .from('properties')
      .update({
        review_status: status,
        rejection_reason: status === 'rejected' ? reason : null,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', property.id)
      .eq('review_status', 'pending')
      .select('id')
      .maybeSingle();
    setBusyId('');
    if (updateError || !data) {
      setError('The listing review could not be saved. Refresh and check your staff access.');
      return;
    }
    setReasons((current) => ({ ...current, [property.id]: '' }));
    setNotice(`Listing marked ${status}. Approval does not publish the listing; use Edit to verify and publish it separately.`);
    onReviewed();
  }

  return (
    <section className="admin-panel listing-moderation-panel" aria-labelledby="listing-moderation-title">
      <div className="admin-panel-heading"><div><span className="eyebrow">LISTING REVIEW</span><h2 id="listing-moderation-title">Broker submissions ({pending.length} pending)</h2></div></div>
      {error && <p className="moderation-message moderation-error" role="alert">{error}</p>}
      {notice && <p className="moderation-message" role="status">{notice}</p>}
      {pending.length === 0 ? <p className="admin-inline-help">No broker listings are waiting for review.</p> : (
        <div className="moderation-list">
          {pending.map((property) => (
            <article className="moderation-item" key={property.id}>
              <div className="moderation-item-heading"><div><strong>{property.title}</strong><span>{property.locality?.name} · {property.transaction_type} · ₹{Number(property.price).toLocaleString('en-IN')}</span></div><span className="moderation-pending">Pending review</span></div>
              <p className="moderation-submitter">Submitted {new Date(property.created_at).toLocaleDateString('en-IN')} · reference {property.id.slice(0, 8)}</p>
              <label className="moderation-reason">Rejection feedback (required to reject)
                <textarea maxLength={500} minLength={8} rows={2} value={reasons[property.id] ?? ''} onChange={(event) => setReasons((current) => ({ ...current, [property.id]: event.target.value }))} />
              </label>
              <div className="moderation-actions">
                <button type="button" disabled={busyId === property.id} onClick={() => review(property, 'approved')}><Check size={14} /> Approve for publication</button>
                <button type="button" className="moderation-reject" disabled={busyId === property.id || (reasons[property.id] ?? '').trim().length < 8} onClick={() => review(property, 'rejected')}><X size={14} /> Return with feedback</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default ListingModerationPanel;
