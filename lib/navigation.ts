import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Library,
  CalendarDays,
  CircleHelp,
  FileText,
  Layers,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export type NavSection = {
  label: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Your study snapshot",
      },
    ],
  },
  {
    label: "Study",
    items: [
      {
        href: "/subjects",
        label: "Subjects",
        icon: BookOpen,
        description: "Courses and progress",
      },
      {
        href: "/specifications",
        label: "Specifications",
        icon: Library,
        description: "Boards and specs",
      },
      {
        href: "/notes",
        label: "Notes",
        icon: NotebookPen,
        description: "Condensed revision notes",
      },
      {
        href: "/flashcards",
        label: "Flashcards",
        icon: Layers,
        description: "Spaced repetition decks",
      },
      {
        href: "/practice",
        label: "Practice Questions",
        icon: CircleHelp,
        description: "Exam-style practice",
      },
      {
        href: "/past-papers",
        label: "Past Papers",
        icon: FileText,
        description: "Papers and mark schemes",
      },
      {
        href: "/ai-tutor",
        label: "AI Tutor",
        icon: Sparkles,
        description: "Guided explanations",
      },
    ],
  },
  {
    label: "Plan",
    items: [
      {
        href: "/planner",
        label: "Planner",
        icon: CalendarDays,
        description: "Your study week",
      },
      {
        href: "/progress",
        label: "Progress",
        icon: TrendingUp,
        description: "Mastery and trends",
      },
    ],
  },
  {
    label: "Workspace",
    items: [
      {
        href: "/settings",
        label: "Settings",
        icon: Settings,
        description: "Preferences and account",
      },
    ],
  },
];

export function getNavItem(pathname: string): NavItem {
  const allItems = navSections.flatMap((section) => section.items);

  return (
    allItems.find((item) => {
      if (item.href === "/") return pathname === "/";
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }) ?? allItems[0]
  );
}
