import { signInWithGoogle, signInWithMagicLink } from "@/lib/auth-actions";
import { SkateBagLogo } from "@/components/Logo";

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message as string;
  const error = searchParams.error as string;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-black">
      {/* Cyber Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[var(--board-accent)]/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#f59e0b]/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />

      <div className="w-full max-w-md relative z-10 space-y-12">
        {/* Logo / Brand */}
        <div className="text-center space-y-6">
          <SkateBagLogo size={120} className="inline-block mb-4 shadow-lg shadow-black/30 transform -rotate-3 transition-transform hover:rotate-0 duration-500" />
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
              Skatebag
            </h1>
            <p className="text-[var(--board-accent)]/80 font-black tracking-[0.4em] uppercase text-[10px]">
              What&apos;s in your bag? 🛹
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="cyber-card p-10 rounded-2xl space-y-8">
          {message === "check_email" && (
            <div className="p-5 rounded-lg bg-[var(--board-accent)]/10 border border-[var(--board-accent)]/20 text-[var(--board-accent)] text-[10px] font-black text-center uppercase tracking-widest leading-relaxed shadow-lg shadow-black/30">
              ACCESS_LINK SENT. CHECK YOUR INBOX.
            </div>
          )}
          {error && (
            <div className="p-5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black text-center uppercase tracking-widest leading-relaxed">
              {error === "magic_link_failed" ? "Login sequence failed" : 
               error === "google_failed" ? "External auth failed" : 
               decodeURIComponent(error).toUpperCase()}
            </div>
          )}

          <div className="space-y-4">
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-4 bg-[var(--board-accent)] text-black font-black py-5 px-8 rounded-lg hover:brightness-110 transition-all text-[11px] tracking-[0.2em] uppercase shadow-lg shadow-black/30 hover:scale-[1.02] active:scale-95"
              >
                <GoogleIcon />
                Sign in with Google
              </button>
            </form>

            <div className="flex items-center gap-5 py-4">
              <div className="h-px flex-1 bg-[var(--surface-muted)]" />
              <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em]">Manual Sign-In</span>
              <div className="h-px flex-1 bg-[var(--surface-muted)]" />
            </div>

            <form action={signInWithMagicLink} className="space-y-4">
              <input
                name="email"
                type="email"
                placeholder="USER_EMAIL@DOMAIN.COM"
                required
                className="w-full bg-[var(--surface-muted)] border border-[var(--border)] rounded-lg px-6 py-5 text-xs font-black text-white placeholder-slate-800 focus:outline-none focus:ring-4 focus:ring-[var(--board-accent)]/10 focus:border-[var(--board-accent)]/40 transition-all uppercase tracking-widest"
              />
              <button
                type="submit"
                className="w-full bg-[var(--surface-muted)] text-slate-500 border border-[var(--border)] font-black py-5 px-8 rounded-lg hover:bg-[var(--board-accent)] hover:text-black transition-all text-[11px] tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95"
              >
                Send Magic Link
              </button>
            </form>
          </div>
          
          <p className="text-center text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] leading-relaxed italic">
            Pro Skater Authentication
          </p>
        </div>

        <div className="text-center">
          <p className="text-[9px] text-slate-800 font-black uppercase tracking-[0.3em]">
            Database v1.0.4 // Connection Secured
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="currentColor"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor"
      />
    </svg>
  );
}
