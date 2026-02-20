export function websiteSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Mumbai Rentals",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function localBusinessSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Mumbai Rentals",
    url: baseUrl,
    telephone: "+91-7498369191",
    priceRange: "₹₹",
    areaServed: [
      { "@type": "City", name: "Malad West, Mumbai" },
      { "@type": "City", name: "Malad East, Mumbai" },
      { "@type": "City", name: "Kandivali West, Mumbai" },
      { "@type": "City", name: "Kandivali East, Mumbai" },
      { "@type": "City", name: "Borivali West, Mumbai" },
      { "@type": "City", name: "Borivali East, Mumbai" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mumbai",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-7498369191",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi", "Marathi"],
      contactOption: "TollFree",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "500",
      reviewCount: "142",
    },
    sameAs: [
      "https://instagram.com/ayushjha.creates",
      `https://wa.me/917498369191`,
    ],
  };
}

// Separate AggregateRating schema for homepage (gets ★ in Google results)
export function aggregateRatingSchema(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Mumbai Rentals — Western Suburbs Flat Finder",
    description:
      "Get a curated WhatsApp shortlist of verified rental flats in Malad, Kandivali, and Borivali within 10–15 minutes.",
    url: baseUrl,
    brand: { "@type": "Brand", name: "Mumbai Rentals" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      bestRating: "5",
      worstRating: "1",
      ratingCount: "500",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Free shortlist service. Brokerage disclosed upfront per listing.",
    },
  };
}

export function serviceSchema(baseUrl: string, areaSlug: string, areaName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Rental Homes in ${areaName}`,
    serviceType: "Residential Rental Assistance",
    description: `Find verified 1 BHK and 2 BHK rental flats in ${areaName}, Mumbai. Get a WhatsApp shortlist in 10–15 minutes.`,
    provider: {
      "@type": "RealEstateAgent",
      name: "Mumbai Rentals",
      url: baseUrl,
      telephone: "+91-7498369191",
    },
    areaServed: {
      "@type": "City",
      name: `${areaName}, Mumbai, Maharashtra, India`,
    },
    url: `${baseUrl}/${areaSlug}`,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "500",
      bestRating: "5",
    },
  };
}
