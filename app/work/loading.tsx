export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] bg-tpc-black flex flex-col items-center justify-center">
      {/* Glowing TPC Orange Dot */}
      <div className="relative flex justify-center items-center">
        <div className="absolute w-20 h-20 rounded-full bg-tpc-orange/20 animate-ping" />
        <div className="absolute w-12 h-12 rounded-full bg-tpc-orange/40 animate-pulse" />
        <div className="w-6 h-6 rounded-full bg-tpc-orange shadow-[0_0_20px_rgba(255,107,53,0.8)]" />
      </div>
      
      {/* Loading Text */}
      <div className="mt-12 text-white font-mono text-[10px] tracking-[0.5em] uppercase opacity-60">
        Authenticating Data
      </div>
      
      {/* Loading Bar */}
      <div className="mt-4 w-48 h-[1px] bg-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full w-1/3 bg-tpc-orange animate-[slide_1.5s_ease-in-out_infinite]" />
      </div>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
