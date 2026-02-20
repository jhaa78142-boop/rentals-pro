import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LeadDraftProvider, useLeadDraft } from "./state/leadDraft";
import { ThemeProvider } from "./lib/theme";
import HomePage from "./pages/HomePage";
import AreaLandingPage from "./pages/AreaLandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import ExitIntent from "./components/ExitIntent";
import Seo from "./seo/Seo";
import { localBusinessSchema, websiteSchema, aggregateRatingSchema } from "./seo/schema";
import { track } from "./lib/track";
import { getAbVariant } from "./lib/ab";
import { parsePrefillFromUrl } from "./lib/urlPrefill";

function QueryPrefill() {
  const loc = useLocation();
  const { setDraft } = useLeadDraft();
  useEffect(() => {
    const { patch, autoScroll } = parsePrefillFromUrl(window.location.href);
    if (Object.keys(patch).length > 0) setDraft({ ...patch, _prefillTs: Date.now() });
    if (autoScroll) {
      setTimeout(() => {
        document.getElementById("lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  }, [loc.pathname, loc.search, setDraft]);
  return null;
}

function GlobalPageView() {
  const loc = useLocation();
  useEffect(() => {
    track("page_view", { path: loc.pathname + loc.search, abVariant: getAbVariant() });
  }, [loc.pathname, loc.search]);
  return null;
}

export default function App() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mumbairentals.in";
  const homeJsonLd = [websiteSchema(baseUrl), localBusinessSchema(baseUrl), aggregateRatingSchema(baseUrl)];

  return (
    <HelmetProvider>
      <ThemeProvider>
        <LeadDraftProvider>
          <BrowserRouter>
            <GlobalPageView />
            <QueryPrefill />
            <ExitIntent />
            <Routes>
              <Route
                path="/"
                element={
                  <>
                    <Seo
                      title="Mumbai Rentals | Malad, Kandivali, Borivali — Verified Flats"
                      description="Find verified rental homes in Malad, Kandivali, and Borivali. Share your budget and preferences to get a WhatsApp shortlist in 10–15 minutes. No spam."
                      canonicalPath="/"
                      ogImagePath="/og-mumbai.png"
                      jsonLd={homeJsonLd}
                    />
                    <HomePage />
                  </>
                }
              />
              <Route
                path="/malad"
                element={
                  <AreaLandingPage
                    slug="malad"
                    defaultArea="Malad West"
                    title="Flats for Rent in Malad — Verified 1 & 2 BHK"
                    description="Verified rentals in Malad East & West. Budget ₹28k–₹80k. Share your requirements and get a WhatsApp shortlist in 10–15 minutes."
                  />
                }
              />
              <Route
                path="/kandivali"
                element={
                  <AreaLandingPage
                    slug="kandivali"
                    defaultArea="Kandivali West"
                    title="Flats for Rent in Kandivali — Verified 1 & 2 BHK"
                    description="Verified rentals in Kandivali East & West. Budget ₹30k–₹75k. Get a curated WhatsApp shortlist and same-day visit scheduling."
                  />
                }
              />
              <Route
                path="/borivali"
                element={
                  <AreaLandingPage
                    slug="borivali"
                    defaultArea="Borivali West"
                    title="Flats for Rent in Borivali — Verified 1 & 2 BHK"
                    description="Verified rentals in Borivali East & West. Budget ₹32k–₹90k. Share your move-in date and get a shortlist on WhatsApp within 15 minutes."
                  />
                }
              />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </LeadDraftProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
