const commercialPropertyTypes = new Set(['Shop', 'Office', 'Commercial unit']);

/** Describe the safe, published-only search filters before applying them to Supabase. */
export function buildPublishedPropertyFilterSpecs(filters) {
  const specs = [['eq', 'status', 'published']];

  if (filters.transaction === 'Buy') specs.push(['eq', 'transaction_type', 'sale']);
  if (filters.transaction === 'Rent') specs.push(['eq', 'transaction_type', 'rent']);
  if (filters.transaction === 'Commercial') {
    specs.push(['eq', 'property_type', 'commercial']);
    specs.push(['eq', 'transaction_type', filters.commercialTransaction === 'rent' ? 'rent' : 'sale']);
  }

  if (filters.transaction !== 'Commercial' && commercialPropertyTypes.has(filters.propertyType)) {
    specs.push(['eq', 'property_type', 'commercial']);
  } else if (filters.transaction !== 'Commercial') {
    if (filters.propertyType === '1 BHK') specs.push(['eq', 'bedrooms', 1]);
    if (filters.propertyType === '2 BHK') specs.push(['eq', 'bedrooms', 2]);
    if (filters.propertyType === '3 BHK or larger') specs.push(['gte', 'bedrooms', 3]);
  }

  if (filters.locality && filters.locality !== 'Flexible / nearby') {
    specs.push(['ilike', 'locality.name', `%${filters.locality}%`]);
  }

  const maxPrice = Number(filters.budget);
  if (Number.isFinite(maxPrice) && maxPrice > 0) specs.push(['lte', 'price', maxPrice]);

  // Deposits are meaningful only for rental requirements. Ignore stale state
  // from a previous tab when the customer switches to buy or sell.
  const deposit = Number(filters.minimumDeposit);
  const rentalSearch = filters.transaction === 'Rent'
    || (filters.transaction === 'Commercial' && filters.commercialTransaction === 'rent');
  if (rentalSearch && Number.isFinite(deposit) && deposit > 0) {
    specs.push(['gte', 'deposit', deposit]);
  }

  const areaFrom = Number(filters.minimumArea);
  if (Number.isFinite(areaFrom) && areaFrom > 0) specs.push(['gte', 'area_sqft', areaFrom]);
  const areaTo = Number(filters.maximumArea);
  if (Number.isFinite(areaTo) && areaTo > 0) specs.push(['lte', 'area_sqft', areaTo]);
  if (filters.furnishing !== 'Any furnishing') specs.push(['eq', 'furnishing', filters.furnishing]);

  return specs;
}

export function applyPropertySearchFilters(query, filters) {
  return buildPublishedPropertyFilterSpecs(filters).reduce((current, [method, column, value]) => current[method](column, value), query);
}
