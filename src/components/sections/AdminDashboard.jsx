import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth/useAuth.js';
import './AdminDashboard.css';

const emptyForm = {
  title: '',
  locality_id: '',
  property_type: 'residential',
  transaction_type: 'sale',
  address: '',
  price: '',
  deposit: '',
  area_sqft: '',
  bedrooms: '',
  bathrooms: '',
  furnishing: '',
  description: '',
  builder: '',
  property_age_years: '',
  gated: false,
  source_name: 'Owner submitted',
  source_url: '',
  features: '',
  image_urls: '',
  publish: false,
  verifyNow: false,
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function optionalNumber(value) {
  return value === '' ? null : Number(value);
}

function splitLines(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function AdminDashboard() {
  const { session, loading: authReady, role, isStaff, signOut } = useAuth();
  const [localities, setLocalities] = useState([]);
  const [newLocalityName, setNewLocalityName] = useState('');
  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!supabase || !isStaff) return undefined;
    let active = true;

    async function loadDashboard() {
      setErrorMessage('');
      const [localityResult, propertyResult] = await Promise.all([
        supabase.from('localities').select('id,name').order('name'),
        supabase.from('properties').select('id,title,status,price,transaction_type,property_type,locality_id,address,deposit,area_sqft,bedrooms,bathrooms,furnishing,description,builder,property_age_years,gated,source_name,source_url,features,image_urls,verified_at,published_at,created_at,locality:localities(name)').order('created_at', { ascending: false }).limit(100),
      ]);
      if (!active) return;
      if (localityResult.error || propertyResult.error) {
        setErrorMessage('Could not load the admin data. Check your staff role and database policies.');
        return;
      }
      setLocalities(localityResult.data ?? []);
      setProperties(propertyResult.data ?? []);
      if (localityResult.data?.[0]) {
        setForm((current) => current.locality_id ? current : { ...current, locality_id: localityResult.data[0].id });
      }
    }

    loadDashboard().catch(() => {
      if (active) setErrorMessage('Could not load the admin data. Please try again.');
    });
    return () => { active = false; };
  }, [isStaff, refreshKey]);

  async function handleCreateLocality(event) {
    event.preventDefault();
    if (!supabase) return;
    const name = newLocalityName.trim();
    const slug = slugify(name);
    if (!name || !slug) {
      setErrorMessage('Enter a locality name using English letters or numbers.');
      return;
    }

    setBusy(true);
    setNotice('');
    setErrorMessage('');
    const { data, error } = await supabase.from('localities').insert({ name, slug }).select('id,name').single();
    setBusy(false);
    if (error) {
      setErrorMessage('Could not add the locality. It may already exist, or your account may not have staff access.');
      return;
    }
    setLocalities((current) => [...current, data].sort((a, b) => a.name.localeCompare(b.name)));
    setForm((current) => ({ ...current, locality_id: data.id }));
    setNewLocalityName('');
    setNotice('Locality added.');
  }

  async function handleSignOut() {
    try {
      const { error } = await signOut();
      if (error) setErrorMessage('Could not sign out. Please try again.');
    } catch {
      setErrorMessage('Could not sign out. Check your connection and try again.');
    }
  }

  function beginEdit(property) {
    setEditingId(property.id);
    setNotice('');
    setErrorMessage('');
    setForm({
      ...emptyForm,
      title: property.title,
      locality_id: property.locality_id,
      property_type: property.property_type,
      transaction_type: property.transaction_type,
      address: property.address ?? '',
      price: property.price,
      deposit: property.deposit ?? '',
      area_sqft: property.area_sqft ?? '',
      bedrooms: property.bedrooms ?? '',
      bathrooms: property.bathrooms ?? '',
      furnishing: property.furnishing ?? '',
      description: property.description ?? '',
      builder: property.builder ?? '',
      property_age_years: property.property_age_years ?? '',
      gated: property.gated ?? false,
      source_name: property.source_name,
      source_url: property.source_url ?? '',
      features: (property.features ?? []).join('\n'),
      image_urls: (property.image_urls ?? []).join('\n'),
      publish: property.status === 'published',
      verifyNow: false,
    });
    document.getElementById('admin-property-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, locality_id: localities[0]?.id ?? '' });
    setNotice('');
    setErrorMessage('');
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!supabase) return;
    if (form.publish && !form.verifyNow) {
      setErrorMessage('Confirm that you verified this property with its owner before publishing.');
      return;
    }

    const imageUrls = splitLines(form.image_urls);
    if (imageUrls.some((url) => !/^https:\/\//i.test(url))) {
      setErrorMessage('Property photo links must use HTTPS.');
      return;
    }

    setBusy(true);
    setNotice('');
    setErrorMessage('');
    const now = new Date().toISOString();
    const payload = {
      title: form.title.trim(),
      locality_id: form.locality_id,
      property_type: form.property_type,
      transaction_type: form.transaction_type,
      status: form.publish ? 'published' : 'draft',
      address: form.address.trim() || null,
      price: Number(form.price),
      deposit: optionalNumber(form.deposit),
      area_sqft: optionalNumber(form.area_sqft),
      bedrooms: optionalNumber(form.bedrooms),
      bathrooms: optionalNumber(form.bathrooms),
      furnishing: form.furnishing || null,
      description: form.description.trim() || null,
      builder: form.builder.trim() || null,
      property_age_years: optionalNumber(form.property_age_years),
      gated: form.gated,
      source_name: form.source_name.trim(),
      source_url: form.source_url.trim() || null,
      features: splitLines(form.features),
      image_urls: imageUrls,
      verified_at: form.publish ? now : null,
      published_at: form.publish ? now : null,
      updated_at: now,
    };

    const request = editingId
      ? supabase.from('properties').update(payload).eq('id', editingId).select('id').maybeSingle()
      : supabase.from('properties').insert(payload).select('id').single();
    const { data: savedProperty, error } = await request;
    setBusy(false);
    if (error || !savedProperty) {
      setErrorMessage('Could not save the property. Confirm your staff role, required fields, and RLS policies.');
      return;
    }

    setNotice(form.publish ? 'Property published.' : 'Draft saved.');
    setForm({ ...emptyForm, locality_id: form.locality_id });
    setEditingId(null);
    setRefreshKey((current) => current + 1);
  }

  async function handleDelete(property) {
    if (role !== 'admin' || !supabase || !window.confirm(`Delete “${property.title}”?`)) return;
    setBusy(true);
    const { data: deletedProperty, error } = await supabase.from('properties').delete().eq('id', property.id).select('id').maybeSingle();
    setBusy(false);
    if (error || !deletedProperty) {
      setErrorMessage('Could not delete this property. Only admins can delete listings.');
      return;
    }
    setNotice('Property deleted.');
    setRefreshKey((current) => current + 1);
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="admin-brand" to="/">PREM<span>.</span></Link>
        <Link className="admin-back" to="/"><ArrowLeft size={15} /> Back to site</Link>
      </header>

      {!supabase && <section className="admin-message"><h1>Admin setup needed</h1><p>Set the Vite Supabase URL and publishable key in the local environment before signing in.</p></section>}
      {supabase && !authReady && <section className="admin-message" aria-live="polite">Checking sign-in…</section>}
      {supabase && authReady && !session && (
        <section className="admin-login">
          <span className="eyebrow">STAFF ACCESS</span>
          <h1>Sign in to manage listings</h1>
          <p>Property publishing is restricted to authorized PREM staff.</p>
          <Link className="button button-dark" to="/auth?next=%2Fadmin">Continue to staff sign-in</Link>
        </section>
      )}
      {supabase && authReady && session && !isStaff && (
        <section className="admin-message">
          <h1>Staff role required</h1>
          <p>This account is signed in but does not have a trusted `app_metadata.role` of `staff` or `admin`.</p>
          <button className="button button-dark" type="button" onClick={handleSignOut}>Sign out <LogOut size={15} /></button>
        </section>
      )}
      {supabase && authReady && session && isStaff && (
        <div className="admin-content">
          <div className="admin-title-row">
            <div><span className="eyebrow">LISTING MANAGEMENT</span><h1>Property admin</h1><p>Signed in as {session.user.email} · {role}</p></div>
            <button className="admin-signout" type="button" onClick={handleSignOut}><LogOut size={15} /> Sign out</button>
          </div>

          {(errorMessage || notice) && <p className={errorMessage ? 'admin-banner admin-banner-error' : 'admin-banner'} role={errorMessage ? 'alert' : 'status'}>{errorMessage || notice}</p>}

          <section className="admin-panel" id="admin-property-form">
            <div className="admin-panel-heading"><div><span className="eyebrow">{editingId ? 'EDIT LISTING' : 'ADD LISTING'}</span><h2>{editingId ? 'Update property details' : 'Create a property record'}</h2></div>{editingId && <button type="button" className="admin-text-button" onClick={resetForm}>Cancel edit</button>}</div>
            <form className="admin-locality-form" onSubmit={handleCreateLocality}>
              <label>Add locality<input required maxLength={100} value={newLocalityName} onChange={(event) => setNewLocalityName(event.target.value)} placeholder="e.g. Mira Road East" /></label>
              <button className="button button-dark" type="submit" disabled={busy}><Plus size={15} /> Add locality</button>
            </form>
            {localities.length === 0 ? <p className="admin-inline-help">Add a locality above, then create a draft or publish a verified property.</p> : (
              <form className="admin-property-form" onSubmit={handleSave}>
                <label className="admin-wide">Property title<input required maxLength={140} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
                <label>Locality<select required value={form.locality_id} onChange={(event) => setForm({ ...form, locality_id: event.target.value })}><option value="">Choose locality</option>{localities.map((locality) => <option key={locality.id} value={locality.id}>{locality.name}</option>)}</select></label>
                <label>Property type<select value={form.property_type} onChange={(event) => setForm({ ...form, property_type: event.target.value })}><option value="residential">Residential</option><option value="commercial">Commercial</option></select></label>
                <label>Transaction<select value={form.transaction_type} onChange={(event) => setForm({ ...form, transaction_type: event.target.value })}><option value="sale">Sale</option><option value="rent">Rent</option><option value="lease">Lease</option></select></label>
                <label className="admin-wide">Address<input maxLength={300} value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} /></label>
                <label>Price (₹)<input required type="number" min="0" step="1000" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label>
                <label>Deposit (₹)<input type="number" min="0" step="1000" value={form.deposit} onChange={(event) => setForm({ ...form, deposit: event.target.value })} /></label>
                <label>Area (sq ft)<input type="number" min="0" step="1" value={form.area_sqft} onChange={(event) => setForm({ ...form, area_sqft: event.target.value })} /></label>
                <label>Bedrooms<input type="number" min="0" max="99" value={form.bedrooms} onChange={(event) => setForm({ ...form, bedrooms: event.target.value })} /></label>
                <label>Bathrooms<input type="number" min="0" max="99" value={form.bathrooms} onChange={(event) => setForm({ ...form, bathrooms: event.target.value })} /></label>
                <label>Furnishing<select value={form.furnishing} onChange={(event) => setForm({ ...form, furnishing: event.target.value })}><option value="">Not specified</option><option value="unfurnished">Unfurnished</option><option value="semi-furnished">Semi-furnished</option><option value="furnished">Furnished</option></select></label>
                <label>Builder<input value={form.builder} onChange={(event) => setForm({ ...form, builder: event.target.value })} /></label>
                <label>Property age (years)<input type="number" min="0" max="999" value={form.property_age_years} onChange={(event) => setForm({ ...form, property_age_years: event.target.value })} /></label>
                <label>Source name<input required value={form.source_name} onChange={(event) => setForm({ ...form, source_name: event.target.value })} /></label>
                <label>Source URL<input type="url" value={form.source_url} onChange={(event) => setForm({ ...form, source_url: event.target.value })} placeholder="https://…" /></label>
                <label className="admin-wide">Description<textarea rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
                <label>Features, one per line<textarea rows={4} value={form.features} onChange={(event) => setForm({ ...form, features: event.target.value })} /></label>
                <label>Photo URLs, one per line<textarea rows={4} value={form.image_urls} onChange={(event) => setForm({ ...form, image_urls: event.target.value })} placeholder="https://…" /></label>
                <label className="admin-checkbox"><input type="checkbox" checked={form.gated} onChange={(event) => setForm({ ...form, gated: event.target.checked })} /> Gated community</label>
                <label className="admin-checkbox"><input type="checkbox" checked={form.publish} onChange={(event) => setForm({ ...form, publish: event.target.checked })} /> Publish this listing</label>
                {form.publish && <label className="admin-checkbox admin-verify"><input type="checkbox" checked={form.verifyNow} onChange={(event) => setForm({ ...form, verifyNow: event.target.checked })} /> I verified the details and current availability with the owner or authorized agent now.</label>}
                <div className="admin-form-actions admin-wide"><button className="button button-dark" type="submit" disabled={busy || localities.length === 0}>{busy ? 'Saving…' : <><Save size={15} /> {editingId ? 'Save changes' : 'Save property'}</>}</button></div>
              </form>
            )}
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading"><div><span className="eyebrow">INVENTORY</span><h2>Properties ({properties.length})</h2></div></div>
            {properties.length === 0 ? <p className="admin-inline-help">No property records yet. Add a verified listing above or create a draft.</p> : (
              <div className="admin-list">
                {properties.map((property) => (
                  <article className="admin-list-row" key={property.id}>
                    <div><strong>{property.title}</strong><span>{property.locality?.name} · {property.transaction_type} · ₹{Number(property.price).toLocaleString('en-IN')} · {property.status}</span></div>
                    <div className="admin-row-actions"><button type="button" onClick={() => beginEdit(property)}><Pencil size={14} /> Edit</button>{role === 'admin' && <button type="button" className="admin-delete" disabled={busy} onClick={() => handleDelete(property)}><Trash2 size={14} /> Delete</button>}</div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminDashboard;
