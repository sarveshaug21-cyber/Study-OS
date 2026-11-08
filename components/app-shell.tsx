"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Menu,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Avatar } from "@/components/ui";
import { demoUser } from "@/lib/demo-data";
import { getNavItem, navSections } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="space-y-6">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {section.label}
          </p>
          <ul className="mt-2 space-y-0.5">
            {section.items.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-100",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-7 w-7 place-items-center rounded-lg transition",
                        active
                          ? "bg-brand-500/20 text-brand-200"
                          : "text-slate-500 group-hover:text-slate-300",
                      )}
                    >
                      <Icon aria-hidden="true" size={16} strokeWidth={2.1} />
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {active && (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-brand-300"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-night">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_25%_0%,rgba(122,85,242,0.28),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="relative flex h-16 shrink-0 items-center px-5">
        <Logo />
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 pb-6 pt-2 no-scrollbar">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="relative shrink-0 border-t border-white/10 p-3">
        <div className="mb-2 flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-[0.7rem] text-slate-400">
          <Sparkles aria-hidden="true" size={13} className="text-brand-300" />
          <span>Demo workspace · static data</span>
        </div>
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-white/5"
        >
          <Avatar initials={demoUser.initials} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-white">
              {demoUser.name}
            </span>
            <span className="block truncate text-xs text-slate-400">
              {demoUser.yearGroup} · {demoUser.school}
            </span>
          </span>
          <ChevronRight
            aria-hidden="true"
            size={15}
            className="text-slate-500"
          />
        </Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const current = getNavItem(pathname);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    const panel = mobilePanelRef.current;
    const trigger = mobileTriggerRef.current;
    panel?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      trigger?.focus();
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-dvh">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-night/60 backdrop-blur-sm"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            ref={mobilePanelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 w-[min(19rem,88vw)] shadow-2xl focus:outline-none"
          >
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
              aria-label="Close navigation menu"
            >
              <X aria-hidden="true" size={18} />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-paper/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1500px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              ref={mobileTriggerRef}
              type="button"
              onClick={() => setMobileOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-ink-soft shadow-sm transition hover:bg-slate-50 lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu aria-hidden="true" size={19} />
            </button>

            <div className="flex items-center gap-2 lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 text-white">
                <Sparkles aria-hidden="true" size={15} />
              </span>
              <span className="text-sm font-semibold tracking-tight">
                Study<span className="text-brand-600">OS</span>
              </span>
            </div>

            <div className="hidden min-w-0 items-center gap-2 text-sm lg:flex">
              <span className="text-ink-muted">Workspace</span>
              <ChevronRight
                aria-hidden="true"
                size={14}
                className="text-slate-400"
              />
              <span className="truncate font-semibold text-ink">
                {current.label}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search
                  aria-hidden="true"
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search subjects, notes, papers…"
                  aria-label="Search subjects, notes and papers"
                  className="h-10 w-64 rounded-xl border border-slate-200 bg-white pl-9 pr-16 text-sm shadow-sm transition placeholder:text-slate-400 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-100 xl:w-80"
                />
                <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[0.65rem] font-medium text-slate-500">
                  ⌘K
                </kbd>
              </div>

              <button
                type="button"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-ink-soft shadow-sm transition hover:bg-slate-50"
                aria-label="Notifications, 3 unread"
              >
                <Bell aria-hidden="true" size={18} />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              <Link
                href="/settings"
                className="hidden items-center gap-2.5 rounded-xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:bg-slate-50 sm:flex"
              >
                <Avatar initials={demoUser.initials} />
                <span className="hidden text-left xl:block">
                  <span className="block text-xs font-semibold leading-4 text-ink">
                    {demoUser.name}
                  </span>
                  <span className="block text-[0.68rem] leading-4 text-ink-muted">
                    {demoUser.yearGroup}
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto max-w-[1500px] px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
