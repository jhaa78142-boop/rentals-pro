import React from "react";

type Props = { className?: string };

export function SearchIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M16.6 16.6 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function EyeIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

export function KeyIcon({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7.5 14.5a5.5 5.5 0 1 1 3.9-9.4 5.5 5.5 0 0 1-3.9 9.4Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M11 11.2 21 11.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18.5 11.2v3M16.2 11.2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}


export function ShieldCheck({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 2 20 6v6c0 5-3.5 9.4-8 10-4.5-.6-8-5-8-10V6l8-4Z" stroke="currentColor" strokeWidth="2" />
      <path d="m8.5 12 2.2 2.2L15.8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function Clock({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function BadgeCheck({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 2 15 5l4 .5-1.5 3.7L19 13l-4 .8L12 22 9 13.8 5 13l1.5-3.8L5 5.5 9 5l3-3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="m9.2 12 1.9 1.9 3.7-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function MessageCircle({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M21 12a8.5 8.5 0 0 1-8.5 8.5c-1.3 0-2.5-.2-3.6-.7L3 21l1.2-5.9c-.5-1.1-.7-2.3-.7-3.6A8.5 8.5 0 0 1 12 3.5 8.5 8.5 0 0 1 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}
