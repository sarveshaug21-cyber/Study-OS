"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isDemoMode } from "@/lib/env";
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (isDemoMode()) return <div className="card p-6"><h1 className="text-lg font-semibold">{mode === "login" ? "Log in" : "Sign up"}</h1><p className="mt-2 text-sm text-ink-muted">Supabase is not configured, so authentication is unavailable. The app remains in demo mode. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> to enable it.</p><Link className="btn-primary mt-4 inline-flex" href="/">Continue in demo mode</Link></div>;
  async function submit(e: React.FormEvent) { e.preventDefault(); setBusy(true); setError(null); try { const supabase = createSupabaseBrowserClient(); if (mode === "login") { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; } else { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; } router.push("/"); } catch (err) { setError(err instanceof Error ? err.message : "Authentication failed"); } finally { setBusy(false); } }
  return (<form onSubmit={submit} className="card space-y-4 p-6"><h1 className="text-lg font-semibold">{mode === "login" ? "Log in" : "Sign up"}</h1>{error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}<div><label className="label" htmlFor="email">Email</label><input id="email" className="input" type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></div><div><label className="label" htmlFor="password">Password</label><input id="password" className="input" type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} /></div><button className="btn-primary w-full" disabled={busy}>{busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button><p className="text-center text-sm text-ink-muted">{mode === "login" ? <>No account? <Link className="font-semibold text-brand-700" href="/auth/signup">Sign up</Link></> : <>Have an account? <Link className="font-semibold text-brand-700" href="/auth/login">Log in</Link></>}</p><p className="text-center text-sm"><Link className="font-semibold text-brand-700" href="/auth/reset-password">Forgot password?</Link></p></form>);
}
