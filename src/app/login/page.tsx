import { signInWithGoogle, signInWithMagicLink } from "@/lib/auth-actions";
import { SkateBagLogo } from "@/components/Logo";

export default async function LoginPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const message = searchParams.message as string;
  const error = searchParams.error as string;

  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden bg-[var(--background)]">
      {/* Industrial Accents */}
      <div className="absolute top-0 left-0 w-full h-24 bg-black border-b-8 border-[var(--safety-orange)] -skew-y-2 origin-top-left" />
      <div className="absolute bottom-0 right-0 w-full h-24 bg-black border-t-8 border-[var(--caution-yellow)] skew-y-2 origin-bottom-right" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Logo / Brand */}
        <div className="text-center space-y-4">
          <div className="inline-block p-4 bg-white border-8 border-black shadow-[12px_12px_0px_#000] rotate-[-3deg] transition-transform hover:rotate-0 duration-500">
            <SkateBagLogo size={100} />
          </div>
          <div className="space-y-0">
            <h1 className="text-7xl font-black tracking-tighter text-white uppercase italic drop-shadow-[6px_6px_0px_#000]">
              Skatebag
            </h1>
            <p className="text-[var(--safety-orange)] font-black tracking-[0.4em] uppercase text-[12px] bg-black px-4 py-1 w-fit mx-auto">
              What&apos;s in your bag? 🛹
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white border-8 border-black p-10 shadow-[16px_16px_0px_#000] space-y-8 rotate-[1deg]">
          {message === "check_email" && (
            <div className="p-4 bg-[var(--caution-yellow)] border-4 border-black text-black text-xs font-black text-center uppercase tracking-widest leading-relaxed">
              ACCESS_LINK SENT. CHECK YOUR INBOX.
            </div>
          )}
          {error && (
            <div className="p-4 bg-black border-4 border-[var(--safety-orange)] text-[var(--safety-orange)] text-xs font-black text-center uppercase tracking-widest leading-relaxed">
              {error === "magic_link_failed" ? "LINK_DISPATCH_FAILURE" : 
               error === "google_failed" ? "AUTH_SEQUENCE_TERMINATED" : 
               decodeURIComponent(error).toUpperCase()}
            </div>
          )}

          <div className="space-y-4">
            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-4 bg-[var(--safety-orange)] text-white font-black py-5 px-8 border-4 border-black shadow-[6px_6px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm tracking-widest uppercase active:scale-95"
              >
                <GoogleIcon />
                Login via Google
              </button>
            </form>

            <div className="flex items-center gap-4 py-2">
              <div className="h-1 flex-1 bg-black" />
              <span className="text-[10px] text-black font-black uppercase tracking-widest bg-white px-2">Manual Access</span>
              <div className="h-1 flex-1 bg-black" />
            </div>

            <form action={signInWithMagicLink} className="space-y-4">
              <input
                name="email"
                type="email"
                placeholder="USER_EMAIL@DOMAIN.COM"
                required
                className="w-full bg-slate-100 border-4 border-black px-6 py-5 text-xs font-black text-black placeholder-slate-400 focus:outline-none focus:bg-[var(--caution-yellow)] transition-all uppercase tracking-widest"
              />
              <button
                type="submit"
                className="w-full bg-black text-white font-black py-5 px-8 border-4 border-black shadow-[6px_6px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-sm tracking-widest uppercase active:scale-95"
              >
                Request Magic Link
              </button>
            </form>
          </div>
          
          <p className="text-center text-[10px] text-slate-500 font-black uppercase tracking-widest leading-relaxed italic">
            Industrial grade security enabled.
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] text-white font-black uppercase tracking-widest bg-black px-4 py-1 w-fit mx-auto">
            Database v1.0.5 // Link Secure
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
