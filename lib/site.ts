export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://arict.lk").replace(/\/$/, "");

export const SITE = {
  name: "ARICT",
  fullName: "Association of Rajarata Information & Communication Technology",
  description:
    "ARICT is a student-driven technology community at Rajarata University of Sri Lanka focused on innovation, collaboration, projects, events, leadership and student development.",
  university: "Rajarata University of Sri Lanka",
  locale: "en_LK",
  timeZone: "Asia/Colombo",
  utcOffset: "+05:30",
} as const;

export const PRIMARY_NAV = [
  { href: "/events", label: "Events" },
  { href: "/projects", label: "Projects" },
  { href: "/team", label: "Team" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
] as const;

export const FOOTER_NAV = [
  { href: "/", label: "Home" },
  ...PRIMARY_NAV,
  { href: "/join", label: "Join ARICT" },
] as const;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
