export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Hobwise",
    url: "https://hobwise.com",
    logo: "https://hobwise.com/assets/icons/hobwise-icon.png",
    description:
      "All-in-one restaurant and hospitality management platform for managing menus, reservations, orders, and payments",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bouvardia Court Ota Iku Street Off Gbangbala Street",
      addressLocality: "Ikate Lekki",
      addressRegion: "Lagos",
      addressCountry: "NG",
    },
    contactPoint: {
      "@type": "ContactPoint",
      email: "hello@hobwise.com",
      contactType: "Customer Service",
      availableLanguage: ["English"],
    },
    sameAs: [
      // Add your actual social media URLs here
      "https://twitter.com/hobwise",
      "https://facebook.com/hobwise",
      "https://linkedin.com/company/hobwise",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Hobwise",
    url: "https://hobwise.com",
    description:
      "Restaurant and hospitality management platform for modern businesses",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://hobwise.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function SoftwareApplicationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Hobwise",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NGN",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
    description:
      "Restaurant and hospitality management software for managing menus, reservations, orders, and payments",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}