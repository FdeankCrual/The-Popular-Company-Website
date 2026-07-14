import Link from "next/link";
import { ArrowRight, Crosshair } from "lucide-react";

export default function HomeAuditTeaser() {
  return (
    <section className="py-20 px-6 md:px-12 bg-[#111] border-y border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-tpc-orange/5 blur-3xl opacity-50" />
      
      <div className="max-w-[1200px] mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-xl text-center md:text-left">
          <div className="inline-flex items-center justify-center p-3 bg-tpc-orange/10 rounded-full mb-6">
            <Crosshair className="w-6 h-6 text-tpc-orange" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Is your website <span className="text-tpc-orange">losing money?</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Don't guess. Let our elite human strategists ruthlessly analyze your digital presence. Get a brutal, precision CRO teardown of your website or social media profile delivered in 24 hours.
          </p>
        </div>

        <div className="flex-shrink-0">
          <Link 
            href="/audit"
            className="inline-flex items-center gap-4 bg-tpc-orange text-black px-8 py-5 rounded-full font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform shadow-[0_0_40px_rgba(242,95,51,0.3)]"
          >
            Request Free Audit <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
