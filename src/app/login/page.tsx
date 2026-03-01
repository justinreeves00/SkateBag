import { signInWithGoogle, signInWithMagicLink } from "@/lib/auth-actions";
import { SkateBagLogo } from "@/components/Logo";

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message as string;
  const error = searchParams.error as string;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[#020617]">
      {/* Aurora Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-900/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />

      <div className="w-full max-w-md relative z-10 space-y-12">
        {/* Logo / Brand */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-white text-black mb-4 shadow-2xl shadow-emerald-500/20 transform -rotate-3 transition-transform hover:rotate-0 duration-500">
            <SkateBagLogo size={56} />
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
              Skatebag
            </h1>
            <p className="text-emerald-400/60 font-bold tracking-[0.4em] uppercase text-[10px]">
              What&apos;s in your bag? 🛹
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="aurora-card p-10 rounded-[3rem] space-y-8">
          {message === "check_email" && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black text-center uppercase tracking-widest leading-relaxed">
              ACCESS_LINK SENT. CHECK YOUR INBOX.
            </div>
          )}
          {error && (
            <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black text-center uppercase tracking-widest leading-relaxed">
              {error === "magic_link_failed" ? "LINK_DISPATCH_FAILURE" : 
               error === "google_failed" ? "AUTH_SEQUENCE_TERMINATED" : 
               decodeURIComponent(error).toUpperCase()}
            </div>
          )}

          <div className="space-y-4">
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-5 px-8 rounded-2xl hover:bg-emerald-400 transition-all text-[11px] tracking-[0.2em] uppercase shadow-xl hover:scale-[1.02] active:scale-95"
              >
                <GoogleIcon />
                Login via Google
              </button>
            </form>

            <div className="flex items-center gap-5 py-4">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em]">Direct Access</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <form action={signInWithMagicLink} className="space-y-4">
              <input
                name="email"
                type="email"
                placeholder="USER_EMAIL@DOMAIN.COM"
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xs font-mono text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/40 transition-all"
              />
              <button
                type="submit"
                className="w-full bg-white/5 text-slate-300 border border-white/10 font-black py-5 px-8 rounded-2xl hover:bg-white hover:text-black transition-all text-[11px] tracking-[0.2em] uppercase hover:scale-[1.02] active:scale-95"
              >
                Request Magic Link
              </button>
            </form>
          </div>
          
          <p className="text-center text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Biometric sync enabled. Multi-device support.
          </p>
        </div>

        <div className="text-center">
          <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[0.3em]">
            Database v1.0.4 // Connection Secured
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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
