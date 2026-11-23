import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import './LeadsPanel.css';

const statuses = ['new', 'contacted', 'qualified', 'closed', 'archived'];

async function fetchRecentLeads() {
  if (!supabase) return { data: null, error: new Error('Supabase is not configured.') };
  return supabase
    .from('leads')
    .select('id,name,phone,requirement,message,status,created_at,property:properties(title,locality:localities(name))')
    .order('created_at', { ascending: false })
    .limit(100);
}

function LeadsPanel() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error: queryError } = await fetchRecentLeads();
    if (queryError) {
      setError('Could not load enquiries. Confirm your staff access and database policies.');
      setLoading(false);
      return;
    }
    setLeads(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    fetchRecentLeads().then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError('Could not load enquiries. Confirm your staff access and database policies.');
      else setLeads(data ?? []);
      setLoading(false);
    }).catch(() => {
      if (active) {
        setError('Could not load enquiries. Please try again.');
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  async function updateStatus(lead, status) {
    setBusyId(lead.id);
    setError('');
    setNotice('');
    const { data, error: updateError } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', lead.id)
      .select('id,status')
      .maybeSingle();
    setBusyId('');
    if (updateError || !data) {
      setError('Could not update this enquiry. Your staff access may have changed.');
      return;
    }
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: data.status } : item));
    setNotice('Enquiry status updated.');
  }

  return (
    <section className="admin-panel leads-panel" aria-labelledby="leads-panel-title">
      <div className="admin-panel-heading">
        <div><span className="eyebrow">CUSTOMER ENQUIRIES</span><h2 id="leads-panel-title">Recent enquiries</h2></div>
        <button className="leads-refresh" type="button" onClick={loadLeads} disabled={loading} aria-label="Refresh enquiries"><RefreshCw size={15} /> Refresh</button>
      </div>
      <p className="leads-privacy-note">Customer contact details are visible to PREM staff for enquiry follow-up. Showing the latest 100; exports are disabled.</p>
      {error && <p className="leads-message leads-error" role="alert">{error}</p>}
      {notice && <p className="leads-message" role="status">{notice}</p>}
      {loading ? <p className="admin-inline-help" role="status">Loading enquiries…</p>
        : leads.length === 0 ? <p className="admin-inline-help">No customer enquiries have been received.</p>
          : <div className="leads-list">
            {leads.map((lead) => (
              <article className="lead-card" key={lead.id}>
                <div className="lead-card-heading">
                  <div><strong>{lead.name}</strong><a href={`tel:${lead.phone}`}>{lead.phone}</a></div>
                  <label>Follow-up status
                    <select aria-label={`Follow-up status for ${lead.name}`} value={lead.status} disabled={busyId === lead.id} onChange={(event) => updateStatus(lead, event.target.value)}>
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                </div>
                <p className="lead-requirement">{lead.requirement}</p>
                {lead.property?.title && <p className="lead-property">Interested in {lead.property.title}{lead.property.locality?.name ? ` · ${lead.property.locality.name}` : ''}</p>}
                {lead.message && <p className="lead-message">{lead.message}</p>}
                <time dateTime={lead.created_at}>{new Date(lead.created_at).toLocaleString('en-IN')}</time>
              </article>
            ))}
          </div>}
    </section>
  );
}

export default LeadsPanel;
