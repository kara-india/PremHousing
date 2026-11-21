import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BedDouble, MapPin, Ruler, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { whatsappUrl } from '../../lib/whatsapp';
import './PropertyDetailPage.css';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function PropertyDetailPage() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!supabase) {
        setState('error');
        return;
      }

      setState('loading');
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id,title,property_type,transaction_type,price,deposit,area_sqft,bedrooms,bathrooms,furnishing,description,features,image_urls,address,verified_at,locality:localities!inner(name,city,region)')
          .eq('id', propertyId)
          .eq('status', 'published')
          .maybeSingle();

        if (!active) return;
        if (error) {
          setState('error');
          return;
        }
        if (!data) {
          setState('not-found');
          return;
        }

        setProperty(data);
        setState('ready');
      } catch {
        if (active) setState('error');
      }
    }

    loadProperty();
    return () => { active = false; };
  }, [propertyId]);

  useEffect(() => {
    document.title = property ? `${property.title} | PREM` : 'Property details | PREM';
    return () => { document.title = 'PREM | Property & Real Estate Market in Mira-Bhayandar'; };
  }, [property]);

  if (state !== 'ready') {
    const message = state === 'loading'
      ? 'Loading published property details…'
      : state === 'not-found'
        ? 'This listing is unavailable or has not been published.'
        : 'We couldn’t load this listing. Please try again or contact our team.';

    return (
      <main className="property-detail-shell">
        <header className="property-detail-header">
          <Link className="property-detail-brand" to="/">PREM<span>.</span></Link>
          <Link className="property-detail-back" to="/#properties"><ArrowLeft size={15} /> Back to search</Link>
        </header>
        <section className="property-detail-state" aria-live="polite" aria-busy={state === 'loading'}>
          <span className="eyebrow">PROPERTY DETAILS</span>
          <h1>{state === 'loading' ? 'One moment' : state === 'not-found' ? 'Listing not found' : 'Details unavailable'}</h1>
          <p role={state === 'error' ? 'alert' : undefined}>{message}</p>
          <Link className="button button-dark" to="/#properties">Browse property search <ArrowRight size={16} /></Link>
        </section>
      </main>
    );
  }

  const enquiryMessage = `Hello PREM, I’m interested in ${property.title} in ${property.locality?.name ?? 'Mira-Bhayandar'}. Please confirm current availability and share more details.`;

  return (
    <main className="property-detail-shell">
      <header className="property-detail-header">
        <Link className="property-detail-brand" to="/">PREM<span>.</span></Link>
        <Link className="property-detail-back" to="/#properties"><ArrowLeft size={15} /> Back to search</Link>
      </header>

      <article className="property-detail-content">
        <div className="property-detail-photo">
          {property.image_urls?.[0]
            ? <img src={property.image_urls[0]} alt={`Property: ${property.title}`} />
            : <span>Verified photos are available on request</span>}
        </div>
        <div className="property-detail-copy">
          <span className="eyebrow">{property.property_type === 'commercial' ? 'COMMERCIAL PROPERTY' : property.transaction_type === 'sale' ? 'RESIDENTIAL · FOR SALE' : 'RESIDENTIAL · FOR RENT'}</span>
          <h1>{property.title}</h1>
          <p className="property-detail-location"><MapPin size={16} /> {property.address ? `${property.address}, ` : ''}{property.locality?.name}, {property.locality?.city}</p>
          <strong className="property-detail-price">
            {currency.format(property.price)}{property.transaction_type === 'rent' ? ' / month' : ''}
          </strong>

          <div className="property-detail-facts">
            {property.bedrooms > 0 && <span><BedDouble size={16} /> {property.bedrooms} BHK</span>}
            {property.area_sqft && <span><Ruler size={16} /> {Number(property.area_sqft).toLocaleString('en-IN')} sq ft</span>}
            {property.bathrooms > 0 && <span>{property.bathrooms} bathrooms</span>}
            {property.furnishing && <span>{property.furnishing}</span>}
            {property.deposit > 0 && <span>Deposit {currency.format(property.deposit)}</span>}
          </div>

          <div className="property-detail-section">
            <h2>About this property</h2>
            <p>{property.description || 'No description has been provided for this listing.'}</p>
          </div>

          {property.features?.length > 0 && (
            <div className="property-detail-section">
              <h2>Features</h2>
              <ul>{property.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            </div>
          )}

          <p className="property-detail-verified"><ShieldCheck size={15} /> Listing verified {property.verified_at ? new Date(property.verified_at).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : ''}. Please confirm current availability with our team.</p>
          <a className="button button-gold property-detail-contact" href={whatsappUrl(enquiryMessage)} target="_blank" rel="noreferrer">
            Ask about this property <ArrowRight size={16} />
          </a>
        </div>
      </article>
    </main>
  );
}

export default PropertyDetailPage;
