import { signInWithGoogle } from "@/lib/auth-actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 border-[20px] border-[#ff4d00]">
      <div className="w-full max-w-lg bg-white p-12 border-[10px] border-black shadow-[20px_20px_0px_rgba(255,77,0,0.5)] rotate-[-1deg]">
        {/* Logo / Brand */}
        <div className="mb-16 text-center rotate-[2deg]">
          <div className="bg-black text-white p-6 inline-block mb-4 zine-border">
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.8]">
              Skatebag
            </h1>
          </div>
          <p className="mt-4 text-xl font-black text-black tracking-widest uppercase italic underline decoration-[6px] decoration-[#ff4d00] underline-offset-8">
            What&apos;s in your bag? 🛹
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-6">
          <form action={signInWithGoogle}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-4 bg-black text-white font-black py-6 px-8 border-4 border-black hover:bg-[#ff4d00] transition-all text-xl tracking-tighter italic shadow-[8px_8px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <GoogleIcon />
              CONTINUE_WITH_GOOGLE
            </button>
          </form>
        </div>

        <div className="mt-16 pt-8 border-t-4 border-black">
          <p className="text-center text-[10px] font-black uppercase tracking-widest text-black leading-tight italic">
            BY_JOINING_YOU_AGREE_TO_LAND_EVERY_TRICK_OR_DIE_TRYING.
          </p>
        </div>
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
