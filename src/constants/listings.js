export const listings = [
  {
    id: 'lodha-aqua-luxury',
    title: 'Lodha Aqua Luxury Apartments',
    location: 'Dahisar East, near Mira Road',
    price: '₹ 1.2 Cr onwards',
    bhk: '2 BHK',
    area: '950 sq ft',
    description: 'Experience resort-style living at Lodha Aqua. These spacious apartments feature world-class amenities and premium finishes.',
    highlights: [
      'Resort-style swimming pool',
      'Fully equipped gymnasium',
      'Landscaped gardens',
      '24/7 high-level security',
      'Ample car parking space'
    ],
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video
    tag: 'Best Deal',
    status: 'Available'
  },
  {
    id: 'jp-north-garden-city',
    title: 'JP North Garden City',
    location: 'Vinay Nagar, Mira Road East',
    price: '₹ 85 Lakhs',
    bhk: '1 BHK',
    area: '650 sq ft',
    description: 'JP North Garden City offers a unique living experience with its massive open spaces and curated garden-themed amenities.',
    highlights: [
      '15+ lifestyle amenities',
      'Massive garden area',
      'Upcoming metro connectivity',
      'Children play area',
      'Clubhouse with indoor games'
    ],
    images: [
      'https://images.unsplash.com/photo-1582407947304-fd86f028f716?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video
    tag: 'Ready to Move',
    status: 'Available'
  },
  {
    id: 'kanakia-queens',
    title: 'Kanakia Queens',
    location: 'Beverly Park, Mira Road',
    price: '₹ 25,000 / month',
    bhk: '2 BHK',
    area: '850 sq ft',
    description: 'Looking for a premium rental? Kanakia Queens is one of the most sought-after projects in Beverly Park with excellent maintenance.',
    highlights: [
      'Semi-furnished with quality fittings',
      'Easy access to markets and schools',
      'Gated community with security',
      'Regular water and power supply',
      'Intercom facility'
    ],
    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video
    tag: 'Rent',
    status: 'Available'
  },
  {
    id: 'unique-aurum',
    title: 'Unique Aurum',
    location: 'Poonam Garden, Mira Road',
    price: '₹ 1.5 Cr',
    bhk: '3 BHK',
    area: '1200 sq ft',
    description: 'Spacious 3 BHK in the premium Poonam Garden area. Perfect for large families seeking a blend of luxury and convenience.',
    highlights: [
      'Spacious living and dining area',
      'East-West entry (Vastu compliant)',
      'Close to major supermarkets',
      'Excellent ventilation',
      'Dedicated parking slot'
    ],
    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ],
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video
    tag: 'Investment',
    status: 'Available'
  }
];

export const generateSocialPost = (listing) => {
  const caption = `${listing.bhk} in ${listing.location} at ${listing.price} 🔥\n\n${listing.description.substring(0, 100)}...\n\n✅ ${listing.highlights.slice(0, 3).join('\n✅ ')}\n\nDM or WhatsApp to book FREE site visit.`;
  const hashtags = `#MiraRoad #MumbaiRealEstate #${listing.bhk.replace(' ', '')} #PropertyForSale #HomeBuyers #PremHousing`;
  const cta = "Click link or WhatsApp now";
  
  return { caption, hashtags, cta };
};
