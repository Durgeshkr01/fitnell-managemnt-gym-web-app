export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const adminNav: NavItem[] = [
  { label: "Today's Summary", href: "/admin", icon: "📊" },
  { label: "Trainers", href: "/admin/trainers", icon: "🧑‍🏫" },
  { label: "Members", href: "/admin/members", icon: "👥" },
  { label: "Attendance", href: "/admin/attendance", icon: "✅" },
  { label: "Payment History", href: "/admin/payments", icon: "💳" },
  { label: "Enquiry 📩", href: "/admin/enquiry", icon: "📩" },
  { label: "Broadcast & Cards", href: "/admin/broadcast-cards", icon: "📣" },
];

export const trainerNav: NavItem[] = [
  { label: "Dashboard", href: "/trainer", icon: "🏠" },
  { label: "Members", href: "/trainer/members", icon: "👥" },
  { label: "Attendance", href: "/trainer/attendance", icon: "✅" },
  { label: "Broadcast", href: "/trainer/broadcast-cards", icon: "📣" },
];
