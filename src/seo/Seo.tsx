import React from "react";
import { Helmet } from "react-helmet-async";

export type SeoProps = {
  title: string;
  description: string;
  canonicalPath?: string; // e.g. "/malad"
  ogImagePath?: string;   // e.g. "/og.jpg" (in /public)
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
};

function absUrl(path: string) {
  // Works on client in production; in dev it's localhost.
  const origin = typeof window !== "undefined" ? window.location.origin : "https://example.com";
  return new URL(path, origin).toString();
}

export default function Seo({ title, description, canonicalPath, ogImagePath, jsonLd }: SeoProps) {
  const canonical = canonicalPath ? absUrl(canonicalPath) : undefined;
  const ogImage = ogImagePath ? absUrl(ogImagePath) : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {canonical ? <link rel="canonical" href={canonical} /> : null}

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonical ? <meta property="og:url" content={canonical} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage ? <meta name="twitter:image" content={ogImage} /> : null}

      {jsonLd ? (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      ) : null}
    </Helmet>
  );
}
