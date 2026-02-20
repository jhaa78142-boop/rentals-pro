import React from "react";
import Reveal from "./Reveal";
import AreaGallery from "./AreaGallery";

type Area = {
  title: string;
  subtitle: string;
  img: string;
};

const AREAS: Area[] = [
  {
    title: "Borivali",
    subtitle: "High-rise living • Great connectivity",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Kandivali",
    subtitle: "Family-friendly • Parks & malls nearby",
    img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Malad",
    subtitle: "Premium towers • Fast access to metro",
    img: "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function AreaShowcase() {
  return (
    <section className="relative bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_10%,rgba(0,0,0,0.04),transparent_55%),radial-gradient(800px_circle_at_80%_30%,rgba(0,0,0,0.05),transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl px-4 py-12">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Explore premium buildings in your area
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              Curated rentals across Borivali, Kandivali, and Malad — verified options with
              transparent coordination.
            </p>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {AREAS.map((a, idx) => (
            <Reveal key={a.title} delayMs={idx * 120}>
              <article className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
                <div className="absolute inset-0">
                  <img
                    src={a.img}
                    alt={`${a.title} buildings`}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>

                <div className="relative flex min-h-[220px] flex-col justify-end p-5 text-white">
                  <h3 className="text-lg font-semibold tracking-tight">{a.title}</h3>
                  <p className="mt-1 text-xs text-white/85">{a.subtitle}</p>
                  <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs ring-1 ring-white/25 backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Verified inventory
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
              <AreaGallery />
      </div>
    </section>
  );
}
