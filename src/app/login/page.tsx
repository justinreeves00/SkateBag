import { signInWithGoogle, signInWithMagicLink } from "@/lib/auth-actions";

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message as string;
  const error = searchParams.error as string;

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />

      <div className="w-full max-w-md relative z-10 space-y-12">
        {/* Logo / Brand */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white text-black mb-4 shadow-2xl">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 11h2a2 2 0 0 1 2 2v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3a2 2 0 0 1 2-2h2"/>
              <circle cx="7" cy="11" r="2"/><circle cx="17" cy="11" r="2"/>
              <path d="M6 15h12"/>
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white uppercase italic">
            Skatebag
          </h1>
          <p className="text-slate-400 font-medium tracking-widest uppercase text-sm">
            What&apos;s in your bag? 🛹
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="glass p-8 rounded-[2.5rem] border-white/10 space-y-6">
          {message === "check_email" && (
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold text-center uppercase tracking-widest">
              Check your email for the magic link!
            </div>
          )}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center uppercase tracking-widest">
              {error === "magic_link_failed" ? "Failed to send magic link" : "Authentication failed"}
            </div>
          )}

          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-4 bg-white text-black font-bold py-5 px-8 rounded-2xl hover:bg-slate-100 transition-all text-sm tracking-widest uppercase shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          <form action={signInWithMagicLink} className="space-y-4">
            <input
              name="email"
              type="email"
              placeholder="Enter your email..."
              required
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-5 px-8 rounded-2xl hover:bg-blue-500 transition-all text-sm tracking-widest uppercase shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Send Magic Link
            </button>
          </form>
          
          <p className="text-center text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Sync your progress across all devices
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            The definitive trick database
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
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
