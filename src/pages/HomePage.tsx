import React, { useState } from "react";
import Navbar from "../components/Navbar";
import ScrollProgress from "../components/ScrollProgress";
import Hero from "../components/Hero";
import TrustStrip from "../components/TrustStrip";
import LivePulse from "../components/LivePulse";
import UrgencyBanner from "../components/UrgencyBanner";
import NeighborhoodIntel from "../components/NeighborhoodIntel";
import AreaComparison from "../components/AreaComparison";
import AffordabilityCalculator from "../components/AffordabilityCalculator";
import ProcessTimeline from "../components/ProcessTimeline";
import SocialProofWall from "../components/SocialProofWall";
import LeadForm from "../features/lead-form/LeadForm";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import WhatsAppFab from "../components/WhatsAppFab";
import SmartCtaBar from "../components/SmartCtaBar";
import LeadResume from "../features/lead-resume/LeadResume";
import ChatbotWidget from "../components/ChatbotWidget";
import WaveDivider from "../components/WaveDivider";
import EnvBanner from "../components/EnvBanner";
import ShareWidget from "../components/ShareWidget";
import ExitIntent from "../components/ExitIntent";

export default function HomePage() {
  const [phone10, setPhone10] = useState<string>("");

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-950">
      {/* Ambient background — static blobs, no animation = better perf */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-3xl" />
        <div className="absolute top-[40vh] -left-32 h-[460px] w-[460px] rounded-full bg-sky-500/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-500/6 blur-3xl" />
      </div>

      <UrgencyBanner />
      <ScrollProgress />
      <Navbar />

      <div className="pt-16 sm:pt-28">

        {/* 1. Hero + Trust */}
        <section id="top">
          <Hero />
          <TrustStrip />
        </section>

        {/* 2. Live activity ticker */}
        <LivePulse />

        <WaveDivider className="-mt-2 sm:-mt-6" />

        {/* 3. Neighbourhood intelligence */}
        <section id="areas">
          <NeighborhoodIntel />
        </section>

        <WaveDivider flip className="-mt-2" />

        {/* 4. Area comparison — new feature */}
        <section id="compare">
          <AreaComparison />
        </section>

        <WaveDivider className="-mt-2" />

        {/* 5. Budget calculator */}
        <section id="calculator">
          <AffordabilityCalculator />
        </section>

        <WaveDivider flip className="-mt-2" />

        {/* 6. How it works */}
        <section id="how">
          <ProcessTimeline />
        </section>

        <WaveDivider className="-mt-2" />

        {/* 7. Social proof */}
        <section id="testimonials">
          <SocialProofWall />
        </section>

        <WaveDivider flip className="-mt-2" />

        {/* 8. Lead form */}
        <section id="lead" className="relative">
          <div className="absolute top-4 right-3 sm:top-6 sm:right-8 z-10">
            <ShareWidget />
          </div>
          <LeadForm onPhoneChange={setPhone10} />
        </section>

        <WaveDivider className="-mt-2" />

        {/* 9. FAQ */}
        <section id="faq">
          <FAQ />
        </section>

        {/* 10. Footer with extra bottom pad on mobile */}
        <div className="pb-32 md:pb-0">
          <Footer />
        </div>
      </div>

      {/* Floating / overlay components */}
      <LeadResume />
      <ChatbotWidget phone10={phone10} />
      <WhatsAppFab phone10={phone10} />
      <SmartCtaBar phone10={phone10} />
      <ExitIntent />
      <EnvBanner />
    </div>
  );
}
