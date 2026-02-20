import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import Hero from "../components/Hero";
import TrustStrip from "../components/TrustStrip";
import LivePulse from "../components/LivePulse";
import NeighborhoodIntel from "../components/NeighborhoodIntel";
import ProcessTimeline from "../components/ProcessTimeline";
import SocialProofWall from "../components/SocialProofWall";
import AffordabilityCalculator from "../components/AffordabilityCalculator";
import LeadForm from "../features/lead-form/LeadForm";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import WhatsAppFab from "../components/WhatsAppFab";
import SmartCtaBar from "../components/SmartCtaBar";
import LeadResume from "../features/lead-resume/LeadResume";
import ChatbotWidget from "../components/ChatbotWidget";
import WaveDivider from "../components/WaveDivider";
import UrgencyBanner from "../components/UrgencyBanner";
import ExitIntent from "../components/ExitIntent";
import { useLeadDraft, type Area } from "../state/leadDraft";
import { localBusinessSchema, serviceSchema, websiteSchema, aggregateRatingSchema } from "../seo/schema";
import { Helmet } from "react-helmet-async";

type Props = {
  slug: "malad" | "kandivali" | "borivali";
  defaultArea: Area;
  title: string;
  description: string;
};

export default function AreaLandingPage({ slug, defaultArea, title, description }: Props) {
  const [phone10, setPhone10] = useState<string>("");
  const { setDraft } = useLeadDraft();

  useEffect(() => {
    setDraft({ area: defaultArea });
  }, [defaultArea, setDraft]);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mumbairentals.in";
  const jsonLd = useMemo(() => [
    websiteSchema(baseUrl),
    localBusinessSchema(baseUrl),
    serviceSchema(baseUrl, slug, title.replace("Flats for Rent in ", "").split(" —")[0]),
    aggregateRatingSchema(baseUrl),
  ], [baseUrl, slug, title]);

  return (
    <div className="relative min-h-screen bg-slate-950">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${baseUrl}/${slug}`} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={`${baseUrl}/${slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute top-[40vh] -left-32 h-[460px] w-[460px] rounded-full bg-sky-500/8 blur-3xl" />
      </div>

      <UrgencyBanner />
      <ScrollProgress />
      <Navbar />

      <div className="pt-16 sm:pt-28">
        <section id="top">
          <Hero forcedHeadline={title} forcedSubhead={description} forcedAreaLabel={defaultArea} />
          <TrustStrip />
        </section>

        <LivePulse />
        <WaveDivider className="-mt-2" />

        <section id="areas">
          <NeighborhoodIntel />
        </section>

        <WaveDivider flip className="-mt-2" />

        <section id="calculator">
          <AffordabilityCalculator />
        </section>

        <WaveDivider className="-mt-2" />

        <section id="how">
          <ProcessTimeline />
        </section>

        <WaveDivider flip className="-mt-2" />

        <section id="testimonials">
          <SocialProofWall />
        </section>

        <WaveDivider className="-mt-2" />

        <section id="lead">
          <LeadForm onPhoneChange={setPhone10} />
        </section>

        <WaveDivider flip className="-mt-2" />

        <section id="faq">
          <FAQ />
        </section>

        <div className="pb-32 md:pb-0">
          <Footer />
        </div>
      </div>

      <LeadResume />
      <ChatbotWidget phone10={phone10} />
      <WhatsAppFab phone10={phone10} />
      <SmartCtaBar phone10={phone10} />
      <ExitIntent />
    </div>
  );
}
