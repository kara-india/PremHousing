import { ArrowRight, BedDouble, MapPin, Ruler } from 'lucide-react';
import './PropertyResults.css';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function formatPrice(property) {
  const price = currency.format(property.price);
  return property.transaction_type === 'rent' ? `${price} / month` : price;
}

function PropertyResults({ state, properties, onEnquire }) {
  if (state === 'idle') return null;

  return (
    <section className="property-results" id="property-results" aria-live="polite" aria-busy={state === 'loading'}>
      <div className="property-results-heading">
        <div>
          <span className="eyebrow">PUBLISHED INVENTORY</span>
          <h2>{state === 'loading' ? 'Checking current options…' : 'Property matches'}</h2>
        </div>
        {state === 'ready' && <span className="property-result-count">{properties.length} {properties.length === 1 ? 'match' : 'matches'}</span>}
      </div>

      {state === 'loading' && <p className="property-results-message">Searching verified listings.</p>}
      {state === 'error' && <p className="property-results-message" role="alert">We couldn’t load listings just now. Please try again or contact our team.</p>}
      {state === 'ready' && properties.length === 0 && (
        <p className="property-results-message">No published listings match these filters yet. Contact our team and we’ll check current availability.</p>
      )}

      {state === 'ready' && properties.length > 0 && (
        <div className="property-result-grid">
          {properties.map((property) => (
            <article className="property-result-card" key={property.id}>
              <div className="property-result-image" aria-hidden="true">
                {property.image_urls?.[0]
                  ? <img src={property.image_urls[0]} alt="" loading="lazy" />
                  : <span>Photos available on request</span>}
              </div>
              <div className="property-result-body">
                <span className="property-result-kind">
                  {property.property_type === 'commercial' ? 'Commercial' : property.transaction_type === 'sale' ? 'For sale' : 'For rent'}
                </span>
                <h3>{property.title}</h3>
                <p className="property-result-location"><MapPin size={14} /> {property.locality?.name}</p>
                <strong className="property-result-price">{formatPrice(property)}</strong>
                <div className="property-result-facts">
                  {property.bedrooms > 0 && <span><BedDouble size={14} /> {property.bedrooms} BHK</span>}
                  {property.area_sqft && <span><Ruler size={14} /> {Number(property.area_sqft).toLocaleString('en-IN')} sq ft</span>}
                  {property.deposit > 0 && <span>Deposit {currency.format(property.deposit)}</span>}
                </div>
                <button className="property-result-cta" type="button" onClick={() => onEnquire(property)}>
                  Ask about this property <ArrowRight size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default PropertyResults;
