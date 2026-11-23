import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, FilePlus2, LogOut, Pencil, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth/useAuth.js';
import { supabase } from '../../lib/supabase.js';
import './BrokerListingsPage.css';

const listingProjection = 'id,title,status,property_type,transaction_type,price,deposit,area_sqft,bedrooms,review_status,rejection_reason,created_at,updated_at,locality:localities!inner(name)';
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const blankForm = { title: '', locality_id: '', property_type: 'residential', transaction_type: 'sale', price: '', deposit: '', area_sqft: '', bedrooms: '' };

function brokerAccessState(memberships) {
  if (!memberships.length) return 'unregistered';
  if (memberships.some(({ membership_status, organization }) => membership_status === 'suspended' || organization?.review_status === 'suspended')) return 'suspended';
  if (memberships.some(({ membership_status, organization }) => membership_status === 'rejected' || organization?.review_status === 'rejected')) return 'rejected';
  if (memberships.some(({ membership_status, organization }) => membership_status === 'active' && organization?.review_status === 'approved')) return 'active';
  return 'pending';
}

function membershipMessage(state) {
  if (state === 'unregistered') return 'Submit your brokerage details from your PREM account before you can manage listings.';
  if (state === 'pending') return 'Your brokerage or team membership is awaiting PREM review. Listing tools will appear after approval.';
  if (state === 'rejected') return 'Your brokerage or team membership was not approved. Contact PREM if you need help with the decision.';
  if (state === 'suspended') return 'Broker listing access is suspended. Contact PREM to review your account status.';
  return '';
}

function optionalNumber(value) {
  return value === '' ? null : Number(value);
}

function BrokerListingsPage() {
  const { session, loading: authLoading, signOut } = useAuth();
  const user = session?.user ?? null;
  const userId = user?.id;
  const [pageState, setPageState] = useState('loading');
  const [memberships, setMemberships] = useState([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('');
  const [localities, setLocalities] = useState([]);
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const approvedMemberships = useMemo(() => memberships.filter(({ membership_status, organization }) => (
    membership_status === 'active' && organization?.review_status === 'approved'
  )), [memberships]);
  const selectedMembership = approvedMemberships.find(({ organization_id }) => organization_id === selectedOrganizationId) ?? null;
  const accessState = brokerAccessState(memberships);

  useEffect(() => {
    if (authLoading) return undefined;
    if (!userId) { setPageState('signed-out'); return undefined; }
    if (!supabase) { setPageState('unavailable'); return undefined; }

    let active = true;
    async function loadBrokerAccess() {
      setPageState('loading');
      setError('');
      const { data: account, error: accountError } = await supabase
        .from('prem_accounts')
        .select('account_type')
        .eq('user_id', userId)
        .maybeSingle();
      if (!active) return;
      if (accountError) { setPageState('error'); return; }
      if (account?.account_type !== 'broker') { setPageState('not-broker'); return; }

      const { data: membershipRows, error: membershipError } = await supabase
        .from('prem_broker_memberships')
        .select('organization_id,membership_role,membership_status')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (!active) return;
      if (membershipError) { setPageState('error'); return; }

      const ids = [...new Set((membershipRows ?? []).map((row) => row.organization_id))];
      let organizations = [];
      if (ids.length) {
        const { data, error: organizationError } = await supabase
          .from('prem_broker_organizations')
          .select('id,name,review_status')
          .in('id', ids);
        if (!active) return;
        if (organizationError) { setPageState('error'); return; }
        organizations = data ?? [];
      }

      const organizationById = new Map(organizations.map((organization) => [organization.id, organization]));
      const nextMemberships = (membershipRows ?? []).map((row) => ({ ...row, organization: organizationById.get(row.organization_id) ?? null }));
      setMemberships(nextMemberships);
      const nextApproved = nextMemberships.filter(({ membership_status, organization }) => membership_status === 'active' && organization?.review_status === 'approved');
      setSelectedOrganizationId((current) => nextApproved.some(({ organization_id }) => organization_id === current) ? current : nextApproved[0]?.organization_id ?? '');
      setPageState('ready');
    }

    loadBrokerAccess().catch(() => { if (active) setPageState('error'); });
    return () => { active = false; };
  }, [authLoading, userId]);

  useEffect(() => {
    if (!selectedMembership || !supabase) return undefined;
    let active = true;
    async function loadListings() {
      setError('');
      const [propertyResult, localityResult] = await Promise.all([
        supabase.from('properties').select(listingProjection)
          .eq('broker_organization_id', selectedMembership.organization_id)
          .in('status', ['draft', 'published'])
          .order('updated_at', { ascending: false })
          .limit(100),
        supabase.from('localities').select('id,name').order('name'),
      ]);
      if (!active) return;
      if (propertyResult.error || localityResult.error) {
        setError('We could not load this brokerage’s listings. Refresh the page or contact PREM if the problem continues.');
        return;
      }
      setProperties(propertyResult.data ?? []);
      setLocalities(localityResult.data ?? []);
      setForm((current) => current.locality_id ? current : { ...current, locality_id: localityResult.data?.[0]?.id ?? '' });
    }
    loadListings().catch(() => { if (active) setError('We could not load this brokerage’s listings. Please refresh and try again.'); });
    return () => { active = false; };
  }, [refreshKey, selectedMembership]);

  function resetForm() {
    setEditingId('');
    setForm({ ...blankForm, locality_id: localities[0]?.id ?? '' });
    setNotice('');
    setError('');
  }

  function beginEdit(property) {
    if (property.status !== 'draft' || property.review_status === 'approved') return;
    setEditingId(property.id);
    setNotice('');
    setError('');
    setForm({
      title: property.title,
      locality_id: localities.find(({ name }) => name === property.locality?.name)?.id ?? '',
      property_type: property.property_type,
      transaction_type: property.transaction_type,
      price: String(property.price ?? ''),
      deposit: property.deposit == null ? '' : String(property.deposit),
      area_sqft: property.area_sqft == null ? '' : String(property.area_sqft),
      bedrooms: property.bedrooms == null ? '' : String(property.bedrooms),
    });
    document.getElementById('broker-listing-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function saveListing(event) {
    event.preventDefault();
    if (!supabase || !user || !selectedMembership) return;
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 0) { setError('Enter a valid non-negative price.'); return; }
    if (form.area_sqft && (!Number.isFinite(Number(form.area_sqft)) || Number(form.area_sqft) <= 0)) { setError('Enter an area greater than zero, or leave it blank.'); return; }
    if (form.bedrooms && (!Number.isInteger(Number(form.bedrooms)) || Number(form.bedrooms) < 0)) { setError('Enter a valid bedroom count, or leave it blank.'); return; }
    if (form.transaction_type !== 'rent' && form.deposit) { setError('Deposit is only available for rental listings.'); return; }

    const payload = {
      title: form.title.trim(),
      locality_id: form.locality_id,
      property_type: form.property_type,
      transaction_type: form.transaction_type,
      price,
      deposit: form.transaction_type === 'rent' ? optionalNumber(form.deposit) : null,
      area_sqft: optionalNumber(form.area_sqft),
      bedrooms: optionalNumber(form.bedrooms),
      source_name: 'Broker submitted',
      status: 'draft',
    };
    if (!payload.title || !payload.locality_id) { setError('Enter a listing title and choose a locality.'); return; }

    setSaving(true);
    setNotice('');
    setError('');
    try {
      const result = editingId
        ? await supabase.from('properties').update(payload)
          .eq('id', editingId)
          .eq('broker_organization_id', selectedMembership.organization_id)
          .eq('status', 'draft')
          .select('id')
          .maybeSingle()
        : await supabase.from('properties').insert({
          ...payload,
          submitted_by: user.id,
          broker_organization_id: selectedMembership.organization_id,
        }).select('id').single();
      if (result.error || !result.data) {
        setError('The listing could not be saved. Your access or listing status may have changed; refresh and try again.');
        return;
      }
      setNotice(editingId ? 'Changes submitted for PREM review. The listing is pending review.' : 'Draft submitted to PREM for review.');
      resetForm();
      setRefreshKey((key) => key + 1);
    } catch {
      setError('The listing could not be saved. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    try {
      const { error: signOutError } = await signOut();
      if (signOutError) setError('Could not sign out. Please try again.');
    } catch {
      setError('Could not sign out. Please try again.');
    }
  }

  const canManage = pageState === 'ready' && selectedMembership;

  return <main className="broker-listings-shell">
    <header className="broker-listings-header">
      <Link className="broker-listings-brand" to="/">PREM<span>.</span></Link>
      {user && <button type="button" className="broker-listings-signout" onClick={handleSignOut}><LogOut size={15} /> Sign out</button>}
    </header>
    <div className="broker-listings-main">
      <Link className="broker-listings-back" to="/account"><ArrowLeft size={15} /> PREM account</Link>
      <div className="broker-listings-title"><span className="eyebrow">BROKER WORKSPACE</span><h1>Your PREM listings</h1><p>Create drafts and track PREM’s review of your brokerage inventory.</p></div>

      {error && <p className="broker-listings-message error" role="alert">{error}</p>}
      {notice && <p className="broker-listings-message" role="status"><Check size={15} /> {notice}</p>}
      {pageState === 'loading' && <section className="broker-listings-state" role="status" aria-live="polite">Checking broker access…</section>}
      {pageState === 'unavailable' && <section className="broker-listings-state" role="alert"><h2>Broker workspace unavailable</h2><p>PREM account services are not configured in this deployment.</p></section>}
      {pageState === 'signed-out' && <section className="broker-listings-state"><h2>Sign in to continue</h2><p>This workspace is available to PREM broker accounts.</p><Link className="broker-listings-button" to="/auth?next=%2Fbroker%2Flistings">Sign in</Link></section>}
      {pageState === 'not-broker' && <section className="broker-listings-state"><h2>Broker account required</h2><p>This account is not registered as a PREM broker.</p><Link className="broker-listings-button" to="/account">Review account type</Link></section>}
      {pageState === 'error' && <section className="broker-listings-state" role="alert"><h2>Could not verify broker access</h2><p>Refresh the page. If the problem continues, contact PREM support.</p></section>}
      {pageState === 'ready' && !selectedMembership && <section className="broker-listings-state"><span className={`broker-membership-state ${accessState}`}>{accessState}</span><h2>{accessState === 'unregistered' ? 'Register your brokerage' : 'Broker access not active'}</h2><p>{membershipMessage(accessState)}</p><Link className="broker-listings-button" to="/account">Open PREM account</Link></section>}

      {canManage && <>
        {approvedMemberships.length > 1 && <label className="broker-listings-org">Brokerage<select value={selectedOrganizationId} onChange={(event) => setSelectedOrganizationId(event.target.value)}>{approvedMemberships.map(({ organization_id, organization }) => <option key={organization_id} value={organization_id}>{organization?.name ?? 'Brokerage'}</option>)}</select></label>}
        <section className="broker-listings-panel" aria-labelledby="broker-listings-title">
          <div className="broker-listings-panel-heading"><div><span className="eyebrow">INVENTORY</span><h2 id="broker-listings-title">Listings for {selectedMembership.organization?.name}</h2></div><span>{properties.length} shown</span></div>
          {properties.length === 0
            ? <p className="broker-listings-empty">No draft or published listings are attached to this brokerage yet.</p>
            : <div className="broker-listings-list">{properties.map((property) => {
              const reviewStatus = property.review_status ?? 'not_required';
              return <article className="broker-listing-card" key={property.id}>
                <div className="broker-listing-card-head"><div><span className="broker-listing-locality">{property.locality?.name} · {property.transaction_type}</span><h3>{property.title}</h3></div><div className="broker-listing-badges"><span className={`broker-listing-badge ${property.status}`}>{property.status}</span><span className={`broker-listing-badge review-${reviewStatus}`}>{reviewStatus}</span></div></div>
                <p className="broker-listing-facts">{property.property_type} · {currency.format(property.price)}{property.transaction_type === 'rent' ? ' / month' : ''}{property.bedrooms != null ? ` · ${property.bedrooms} BHK` : ''}{property.area_sqft ? ` · ${Number(property.area_sqft).toLocaleString('en-IN')} sq ft` : ''}</p>
                {reviewStatus === 'rejected' && property.rejection_reason && <p className="broker-listing-rejection"><strong>PREM feedback</strong>{property.rejection_reason}</p>}
                {reviewStatus === 'pending' && <p className="broker-listing-review-note">PREM is reviewing this draft. You can update it while review is pending.</p>}
                {reviewStatus === 'approved' && property.status === 'draft' && <p className="broker-listing-review-note">Approved by PREM. Only PREM staff can publish this listing.</p>}
                {property.status === 'draft' && reviewStatus !== 'approved' && <button className="broker-listing-edit" type="button" onClick={() => beginEdit(property)}><Pencil size={14} /> {reviewStatus === 'rejected' ? 'Edit and resubmit' : 'Edit draft'}</button>}
              </article>;
            })}</div>}
        </section>

        <section className="broker-listings-panel broker-listings-form-panel" id="broker-listing-form" aria-labelledby="broker-form-title">
          <div className="broker-listings-panel-heading"><div><span className="eyebrow">{editingId ? 'UPDATE DRAFT' : 'NEW SUBMISSION'}</span><h2 id="broker-form-title">{editingId ? 'Edit and submit for review' : 'Create a draft listing'}</h2></div>{editingId && <button type="button" className="broker-listing-cancel" onClick={resetForm}>Cancel</button>}</div>
          <p className="broker-listings-form-note">Saving submits your draft to PREM review. PREM staff verifies and publishes approved listings.</p>
          <form className="broker-listings-form" onSubmit={saveListing}>
            <label className="broker-form-wide">Listing title<input required minLength={3} maxLength={180} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
            <label>Locality<select required value={form.locality_id} onChange={(event) => setForm({ ...form, locality_id: event.target.value })}><option value="">Choose locality</option>{localities.map((locality) => <option key={locality.id} value={locality.id}>{locality.name}</option>)}</select></label>
            <label>Property type<select value={form.property_type} onChange={(event) => setForm({ ...form, property_type: event.target.value })}><option value="residential">Residential</option><option value="commercial">Commercial</option></select></label>
            <label>For<select value={form.transaction_type} onChange={(event) => setForm({ ...form, transaction_type: event.target.value })}><option value="sale">Sale</option><option value="rent">Rent</option></select></label>
            <label>Price (₹{form.transaction_type === 'rent' ? ' / month' : ''})<input required type="number" min="0" step="1000" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
            {form.transaction_type === 'rent' && <label>Deposit (₹)<input type="number" min="0" step="1000" value={form.deposit} onChange={(event) => setForm({ ...form, deposit: event.target.value })} /></label>}
            <label>Area (sq ft)<input type="number" min="0.01" step="0.01" value={form.area_sqft} onChange={(event) => setForm({ ...form, area_sqft: event.target.value })} /></label>
            {form.property_type === 'residential' && <label>Bedrooms<input type="number" min="0" max="99" step="1" value={form.bedrooms} onChange={(event) => setForm({ ...form, bedrooms: event.target.value })} /></label>}
            <div className="broker-form-wide broker-listings-actions"><button className="broker-listings-button" type="submit" disabled={saving || !localities.length}>{saving ? 'Submitting…' : <><Save size={15} /> {editingId ? 'Resubmit for review' : <><FilePlus2 size={15} /> Submit draft</>}</>}</button><span>Review state is controlled by PREM.</span></div>
          </form>
        </section>
      </>}
    </div>
  </main>;
}

export default BrokerListingsPage;
