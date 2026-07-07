"use client";
import Header from "../components/Header";
import Cursor from "../Cursor";
import { ArrowUpRight } from "lucide-react";

const services = [
  {
    id: "01",
    title: "Social Media Management",
    description: "We take over your accounts completely. From daily posting to community management, we turn your Instagram into a sales channel, not just a photo gallery.",
    features: ["Content Calendar Strategy", "Reels & Static Design", "Community Management", "Monthly Growth Reports"]
  },
  {
    id: "02",
    title: "Performance Ads",
    description: "Stop boosting posts blindly. We run data-driven ad campaigns on Meta (Facebook/Instagram) and Google to generate high-quality leads and actual sales.",
    features: ["Lead Generation Funnels", "E-commerce Sales (ROAS)", "Retargeting Campaigns", "A/B Testing Creatives"]
  },
  {
    id: "03",
    title: "Video Production",
    description: "In 2026, if you don't have video, you don't have a brand. We shoot cinema-grade content that stops the scroll and holds attention.",
    features: ["4K Video Shoots", "Product Commercials", "Corporate Brand Films", "Viral Reels Editing"]
  },
  {
    id: "04",
    title: "Influencer Marketing", // <--- UPDATED THIS SECTION
    description: "Don't just pay for followers; pay for influence. We connect your brand with vetted creators in Udaipur and Rajasthan who have genuine trust with their audience.",
    features: ["Creator Vetting & Selection", "Campaign Strategy", "Reels & Story Integrations", "Performance Tracking"]
  }
];

export default function ServicesPage() {
  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black">
      <Cursor />
      <Header />

      {/* Hero Section */}
      <section className="pt-40 px-6 md:px-12 pb-20">
        <h1 className="text-[12vw] md:text-[8vw] font-bold leading-none tracking-tighter mb-8 text-center md:text-left">
          OUR <span className="text-tpc-orange">EXPERTISE.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl leading-relaxed text-center md:text-left">
          We don't do "everything." We do the four things that actually grow revenue in the modern digital landscape.
        </p>
      </section>

      {/* Services List */}
      <section className="px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 gap-20">
          {services.map((service) => (
            <div key={service.id} className="group border-t border-white/20 pt-12 flex flex-col md:flex-row justify-between gap-10 hover:border-tpc-orange transition-colors duration-500">
              
              {/* Number & Title */}
              <div className="md:w-1/3">
                <span className="text-tpc-orange font-mono text-sm mb-4 block">{service.id}</span>
                <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-500 transition-all">
                  {service.title}
                </h2>
              </div>

              {/* Description & Features */}
              <div className="md:w-1/2">
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  {service.description}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-gray-500 group-hover:text-white transition-colors">
                      <div className="w-1.5 h-1.5 bg-tpc-orange rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <div className="mt-10">
                    <button className="flex items-center gap-2 border-b border-white pb-1 text-sm font-bold uppercase tracking-widest hover:text-tpc-orange hover:border-tpc-orange transition-colors">
                        Book This Service <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>
    </main>
  );
}