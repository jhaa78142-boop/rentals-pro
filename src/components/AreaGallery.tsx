import React, { useMemo, useState } from "react";
import { useEscapeKey, useFocusTrap, useLockBodyScroll } from "../lib/hooks";
import Reveal from "./Reveal";

type AreaKey = "Borivali" | "Kandivali" | "Malad";

type Img = { src: string; alt: string };

const GALLERY: Record<AreaKey, { blurb: string; tags: string[]; images: Img[]; range: string }> = {
  Borivali: {
    blurb: "High-rise towers, great connectivity, and plenty of family-friendly pockets.",
    tags: ["Near metro", "Family-friendly", "Verified towers"],
    range: "₹35k–₹85k",
    images: [
      { src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80", alt: "Borivali high-rise skyline" },
      { src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80", alt: "Modern apartment living room" },
      { src: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2b63?auto=format&fit=crop&w=1600&q=80", alt: "Apartment bedroom" },
      { src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80", alt: "Balcony city view" },
    ],
  },
  Kandivali: {
    blurb: "Balanced lifestyle — parks, malls, and great options for families and professionals.",
    tags: ["Parks", "Malls nearby", "Quiet lanes"],
    range: "₹32k–₹75k",
    images: [
      { src: "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80", alt: "Kandivali residential towers" },
      { src: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80", alt: "Open plan living room" },
      { src: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80", alt: "Kitchen and dining" },
      { src: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1600&q=80", alt: "Cozy interior" },
    ],
  },
  Malad: {
    blurb: "Premium buildings with strong metro access — ideal for fast commutes and modern living.",
    tags: ["Premium", "Metro access", "Modern interiors"],
    range: "₹38k–₹95k",
    images: [
      { src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=80", alt: "Malad premium building exterior" },
      { src: "https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1600&q=80", alt: "Minimal living room" },
      { src: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80", alt: "Bedroom interior" },
      { src: "https://images.unsplash.com/photo-1505691723518-36a5ac3b2b63?auto=format&fit=crop&w=1600&q=80", alt: "Apartment room" },
    ],
  },
};

export default function AreaGallery() {
  const [active, setActive] = useState<AreaKey>("Borivali");
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const isOpen = !!lightbox;
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  useLockBodyScroll(isOpen);
  useEscapeKey(isOpen, () => setLightbox(null));

  const data = useMemo(() => GALLERY[active], [active]);

  return (
    <section className="mt-10">
      <Reveal>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Area explorer</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-zinc-900">
              Borivali • Kandivali • Malad
            </h3>
            <p className="mt-1 text-sm text-zinc-600">{data.blurb}</p>
          </div>

          <div className="inline-flex rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
            {(["Borivali", "Kandivali", "Malad"] as AreaKey[]).map((k) => {
              const is = k === active;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setActive(k)}
                  className={[
                    "rounded-2xl px-4 py-2 text-sm font-semibold transition",
                    is ? "bg-zinc-900 text-white shadow" : "text-zinc-700 hover:bg-zinc-100",
                  ].join(" ")}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="grid grid-cols-2 gap-2 p-2">
              {data.images.slice(0, 4).map((im) => (
                <button
                  key={im.src}
                  type="button"
                  onClick={() => setLightbox(im)}
                  className="group relative overflow-hidden rounded-2xl"
                  aria-label="Open photo"
                >
                  <img
                    src={im.src}
                    alt={im.alt}
                    className="h-[150px] w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delayMs={120}>
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-zinc-900">Typical rent range</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">{data.range}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {data.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-zinc-900/5 px-3 py-1 text-xs font-semibold text-zinc-700 ring-1 ring-zinc-200"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-zinc-50 p-4 ring-1 ring-zinc-200">
              <p className="text-sm font-semibold text-zinc-900">Pro tip</p>
              <p className="mt-1 text-sm text-zinc-700">
                Share your exact move-in timeline and furnishing preference — we shortlist faster and avoid mismatch.
              </p>
            </div>
          </div>
        </Reveal>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setLightbox(null)} />
          <div ref={modalRef} tabIndex={-1} className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-black shadow-2xl">
              <div className="flex items-center justify-between gap-3 bg-black/60 p-3">
                <p className="text-sm font-semibold text-white">{lightbox.alt}</p>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
                >
                  Close
                </button>
              </div>
              <img src={lightbox.src} alt={lightbox.alt} decoding="async" fetchPriority="high" className="max-h-[78vh] w-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
