import Image from "next/image";

export function SkateBagLogo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: size, height: size }}>
      <Image
        src="/app-icon.png"
        alt="SkateBag Logo"
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}
