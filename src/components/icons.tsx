import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 15,
  height: 15,
  viewBox: "0 0 20 20",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export function IconVueGlobale() {
  return (
    <svg {...base}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="12" y="3" width="5" height="5" rx="1.2" />
      <rect x="12" y="10" width="5" height="7" rx="1.2" />
      <rect x="3" y="12" width="7" height="5" rx="1.2" />
    </svg>
  );
}

export function IconProjets() {
  return (
    <svg {...base}>
      <rect x="3" y="4" width="14" height="3.2" rx="1" />
      <rect x="3" y="8.4" width="14" height="3.2" rx="1" />
      <rect x="3" y="12.8" width="14" height="3.2" rx="1" />
    </svg>
  );
}

export function IconCalendrier() {
  return (
    <svg {...base}>
      <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
      <path d="M3 8.5h14" />
      <path d="M7 3v3M13 3v3" />
    </svg>
  );
}

export function IconRoadmap() {
  return (
    <svg {...base}>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="2.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconObjectifs() {
  return (
    <svg {...base}>
      <circle cx="10" cy="10" r="7" />
      <circle cx="10" cy="10" r="3.6" />
    </svg>
  );
}

export function IconBacklog() {
  return (
    <svg {...base}>
      <path d="M10 3l7 7-7 7-7-7z" />
    </svg>
  );
}

export function IconRecherche() {
  return (
    <svg {...base}>
      <circle cx="8.8" cy="8.8" r="5.3" />
      <path d="M16.5 16.5l-3.6-3.6" />
    </svg>
  );
}

export function IconParametres() {
  return (
    <svg {...base}>
      <circle cx="10" cy="10" r="2.6" />
      <path d="M10 2.5v2.4M10 15.1v2.4M17.5 10h-2.4M4.9 10H2.5M15.1 4.9l-1.7 1.7M6.6 13.4l-1.7 1.7M15.1 15.1l-1.7-1.7M6.6 6.6L4.9 4.9" />
    </svg>
  );
}

export function IconRoutine() {
  return (
    <svg {...base}>
      <path d="M16 10a6 6 0 1 1-1.8-4.3" />
      <path d="M16 3v3.2h-3.2" />
      <path d="M7 10.3l1.8 1.8L13 8" />
    </svg>
  );
}

export function IconFinances() {
  return (
    <svg {...base}>
      <rect x="2.5" y="6" width="15" height="10.5" rx="2" />
      <path d="M2.5 9.2h15" />
      <circle cx="13.5" cy="12.8" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconGuide() {
  return (
    <svg {...base}>
      <path d="M10 5.8c-1.6-1.1-3.7-1.6-6.3-1.3v10.2c2.6-.3 4.7.2 6.3 1.3c1.6-1.1 3.7-1.6 6.3-1.3V4.5c-2.6-.3-4.7.2-6.3 1.3z" />
      <path d="M10 5.8v10.2" />
    </svg>
  );
}

export function IconPremierLancement() {
  return (
    <svg {...base}>
      <circle cx="10" cy="10" r="7" strokeDasharray="2.4 3" />
    </svg>
  );
}
