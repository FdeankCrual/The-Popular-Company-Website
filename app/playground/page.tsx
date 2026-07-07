"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Cursor from "../Cursor";
import { RefreshCw, Sparkles, Wand2, Calculator, Lock, Unlock, Smartphone, ArrowRight, AlertTriangle } from "lucide-react";

// --- 🔐 CONFIGURATION ---
const ACCESS_CODE = "0102"; 
const WHATSAPP_NUMBER = "916367547753";

// --- 📱 VISUAL: FLOATING SOCIAL GRID (Background) ---
const SocialGrid = () => {
    // A single scrolling feed inside a phone screen
    const ScrollingFeed = ({ speed, delay }: { speed: number, delay: number }) => (
        <div className="relative w-full h-[200%] overflow-hidden bg-black/80">
            <motion.div
                animate={{ y: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: speed, ease: "linear", delay: delay }}
                className="w-full flex flex-col gap-3 p-2"
            >
                {/* Repeat content for loop */}
                {[...Array(2)].map((_, sectionIdx) => (
                    <div key={sectionIdx} className="flex flex-col gap-3">
                         {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-2 opacity-80">
                                {/* Header */}
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-white/20"></div>
                                    <div className="w-16 h-2 rounded-full bg-white/10"></div>
                                </div>
                                {/* Content Block */}
                                <div className={`w-full aspect-[3/4] rounded-lg relative overflow-hidden ${i % 2 === 0 ? 'bg-white/10' : 'bg-gradient-to-br from-white/5 to-tpc-orange/20'}`}></div>
                            </div>
                         ))}
                    </div>
                ))}
            </motion.div>
        </div>
    );

    return (
        // Positioned absolute to cover the right side of the screen
        <div className="absolute top-0 right-0 w-full md:w-[50vw] h-full z-0 pointer-events-none overflow-hidden mix-blend-screen">
             <div className="relative w-full h-full">
                
                {/* Phone 1 (Big, Foreground) */}
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: [0, 20, 0], opacity: 1 }}
                    transition={{ y: { repeat: Infinity, duration: 8, ease: "easeInOut" }, opacity: { duration: 1 } }}
                    className="absolute top-[20%] right-[10%] w-64 h-[500px] border-[6px] border-[#333] rounded-[3rem] bg-black p-1 shadow-2xl rotate-[-12deg] z-20"
                >
                    <div className="w-full h-full bg-black rounded-[2.5rem] overflow-hidden border border-white/10 relative">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-black z-30 rounded-full border border-white/5"></div>
                        <ScrollingFeed speed={15} delay={0} />
                    </div>
                </motion.div>

                 {/* Phone 2 (Small, Background) */}
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: [20, 0, 20], opacity: 0.5 }}
                    transition={{ y: { repeat: Infinity, duration: 12, ease: "easeInOut" }, opacity: { duration: 1, delay: 0.2 } }}
                    className="absolute top-[40%] right-[40%] w-48 h-[380px] border-[4px] border-[#222] rounded-[2.5rem] bg-black p-1 shadow-xl rotate-[-5deg] z-10"
                >
                    <div className="w-full h-full bg-black rounded-[2.2rem] overflow-hidden relative">
                         <ScrollingFeed speed={25} delay={5} />
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// --- 🎰 TOY 1: SLOT MACHINE ---
const ViralSlots = () => {
  const c1 = ["Reel", "Carousel", "Story", "Short", "Thread"];
  const c2 = ["Tutorial", "Rant", "Case Study", "Meme", "Storytime"];
  const c3 = ["For Beginners", "For Experts", "In Public", "With $0", "In 1 Hour"];
  
  const [r, sR] = useState(["Format", "Topic", "Twist"]);
  const [isS, sIsS] = useState(false);

  const spin = () => {
    sIsS(true);
    let c = 0;
    const i = setInterval(() => {
      sR([
        c1[Math.floor(Math.random() * c1.length)],
        c2[Math.floor(Math.random() * c2.length)],
        c3[Math.floor(Math.random() * c3.length)]
      ]);
      c++;
      if (c > 15) {
        clearInterval(i);
        sIsS(false);
      }
    }, 80);
  };

  return (
    <div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl h-full flex flex-col relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-100 transition-opacity">
        <Sparkles className="text-tpc-orange w-6 h-6" />
      </div>
      <h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-6">Infinite Idea Generator</h3>
      
      <div className="flex-grow flex flex-col justify-center gap-3">
        {[0, 1, 2].map((i) => (
          // --- FIXED ALIGNMENT HERE ---
          <div key={i} className="bg-black border border-white/10 h-24 flex items-center justify-center rounded-xl text-center relative overflow-hidden">
            <motion.div
              animate={isS ? { y: [-20, 20], opacity: [0.5, 1], filter: ["blur(4px)", "blur(0px)"] } : {}}
              transition={{ repeat: isS ? Infinity : 0, duration: 0.1 }}
              className="text-xl md:text-2xl font-bold uppercase tracking-tight text-white"
            >
              {r[i]}
            </motion.div>
            
            {/* Decorative lines */}
            <div className="absolute top-1/2 left-0 w-2 h-[1px] bg-tpc-orange/50"></div>
            <div className="absolute top-1/2 right-0 w-2 h-[1px] bg-tpc-orange/50"></div>
          </div>
        ))}
      </div>

      <button onClick={spin} disabled={isS} className="mt-8 w-full py-4 bg-tpc-orange text-black font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2 active:scale-95 transform duration-100">
        <RefreshCw className={`w-4 h-4 ${isS ? "animate-spin" : ""}`} />
        {isS ? "Rolling..." : "Spin Again"}
      </button>
    </div>
  );
};
// --- 🧠 TOY 2: HOOK DOCTOR ---
const HookDoctor = () => { const [i,sI]=useState(""),[gh,sGh]=useState<string[]>([]),[isG,sIsG]=useState(!1);const tpls=["Stop doing [X]. Do this instead.","Why 99% of people fail at [X].","The [X] secret that feels illegal to know.","I tried [X] for 30 days. Here is what happened.","How to master [X] without spending a dime.","If you want to fix [X], watch this."];const gen=()=>{if(!i)return;sIsG(!0);sGh([]);setTimeout(()=>{sGh(tpls.sort(()=>.5-Math.random()).slice(0,3).map(t=>t.replace("[X]",i)));sIsG(!1)},600)};return(<div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl h-full flex flex-col relative overflow-hidden shadow-2xl"><div className="absolute top-0 right-0 p-4 opacity-20"><Wand2 className="text-tpc-orange w-6 h-6"/></div><h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-6">Viral Hook Rewriter</h3><div className="flex flex-col gap-4"><div><label className="text-xs text-gray-500 uppercase font-bold ml-1 mb-2 block">Your Boring Topic</label><input type="text" placeholder="e.g. Coffee, Real Estate, Coding..." value={i} onChange={e=>sI(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white placeholder-gray-700 focus:outline-none focus:border-tpc-orange transition-colors font-bold text-lg"/></div><div className="flex-grow min-h-[150px] flex flex-col gap-2">{isG?<div className="h-full flex items-center justify-center text-tpc-orange animate-pulse font-mono text-sm">Analyzing Psychology...</div>:gh.length>0?gh.map((h,k)=>(<motion.div key={k} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:k*.1}} className="bg-white/5 border border-white/5 p-3 rounded-lg text-sm md:text-base font-bold text-green-400 hover:bg-white/10 cursor-pointer transition-colors" onClick={()=>navigator.clipboard.writeText(h)}>"{h}"</motion.div>)):<div className="h-full flex items-center justify-center text-gray-700 text-sm">Enter a topic to generate hooks.</div>}</div></div><button onClick={gen} disabled={!i} className="mt-6 w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-tpc-orange hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Rewrite for Virality</button></div>)};

// --- 💰 TOY 3: MONEY CALCULATOR ---
const MoneyCalc = () => { const [v,sV]=useState(10000),[r,sR]=useState(2);const ns=[{name:"Entertainment",val:.5},{name:"Lifestyle",val:2},{name:"Tech / Software",val:8},{name:"Finance / Business",val:25}];const e=(v/1000)*r;return(<div className="bg-neutral-900 border border-white/10 p-8 rounded-3xl h-full flex flex-col relative overflow-hidden shadow-2xl"><div className="absolute top-0 right-0 p-4 opacity-20"><Calculator className="text-tpc-orange w-6 h-6"/></div><h3 className="text-gray-400 font-mono text-xs uppercase tracking-widest mb-6">Creator Earnings Simulator</h3><div className="bg-black border border-white/10 p-6 rounded-2xl mb-6 text-right"><span className="text-xs text-gray-500 uppercase block mb-1">Estimated Monthly Income</span><span className="text-4xl md:text-5xl font-bold text-green-500 tracking-tighter">${e.toLocaleString(undefined,{maximumFractionDigits:0})}</span></div><div className="flex flex-col gap-6"><div><div className="flex justify-between mb-2 text-xs font-bold uppercase"><span>Views / Month</span><span className="text-tpc-orange">{v.toLocaleString()}</span></div><input type="range" min="1000" max="1000000" step="1000" value={v} onChange={e=>sV(parseInt(e.target.value))} className="w-full accent-tpc-orange h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"/></div><div><span className="text-xs font-bold uppercase block mb-2">Select Your Niche</span><div className="grid grid-cols-2 gap-2">{ns.map(n=><button key={n.name} onClick={()=>sR(n.val)} className={`p-2 text-[10px] uppercase font-bold rounded-lg border transition-all ${r===n.val?"bg-white text-black border-white":"bg-transparent text-gray-500 border-gray-700 hover:border-gray-500"}`}>{n.name}</button>)}</div></div></div></div>)};


// --- 🔒 LOCK SCREEN (With PIN Input) ---
const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
    const [inputCode, setInputCode] = useState("");
    const [isError, setIsError] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputCode === ACCESS_CODE) {
            onUnlock();
        } else {
            setIsError(true);
            setTimeout(() => setIsError(false), 500);
            setInputCode("");
        }
    };

    const handleRequestAccess = () => {
        const message = "Hi TPC, I want to access the Creator Casino. What is the code?";
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank");
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-black/95 backdrop-blur-xl">
             <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-neutral-900 border border-white/10 p-10 rounded-3xl text-center shadow-2xl relative overflow-hidden"
             >
                <div className="w-16 h-16 bg-tpc-orange/10 rounded-full mx-auto mb-6 flex items-center justify-center border border-tpc-orange/20">
                    <Lock className="w-6 h-6 text-tpc-orange" />
                </div>
                
                <h1 className="text-2xl font-bold uppercase tracking-tighter mb-2 text-white">Restricted Access</h1>
                <p className="text-gray-400 text-sm mb-6">Enter PIN to access the Creator Casino.</p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <motion.input 
                        animate={isError ? { x: [-10, 10, -10, 10, 0] } : {}}
                        type="password" 
                        maxLength={4}
                        placeholder="####"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        className={`w-full bg-black border ${isError ? "border-red-500 text-red-500" : "border-white/20 text-white"} text-center text-3xl tracking-[1em] py-4 rounded-xl focus:outline-none focus:border-tpc-orange transition-colors placeholder:text-gray-800 font-mono`}
                    />

                    <button 
                        type="submit"
                        className="w-full py-4 bg-white text-black font-bold uppercase tracking-widest rounded-xl hover:bg-tpc-orange hover:text-white transition-all shadow-lg"
                    >
                        Unlock System
                    </button>
                </form>

                <div className="mt-6 flex justify-center items-center text-xs text-gray-500 font-mono">
                    <button onClick={handleRequestAccess} className="hover:text-white flex item-center gap-1 border-b border-transparent hover:border-white transition-colors">
                        <AlertTriangle className="w-3 h-3" /> Click and you know the code... 
                    </button>
                </div>

             </motion.div>
        </div>
    );
};

export default function Playground() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  return (
    <main className="bg-tpc-black min-h-screen text-white selection:bg-tpc-orange selection:text-black pb-20 relative overflow-hidden">
      <Cursor />
      <Header />

      {/* LOCK SCREEN OVERLAY */}
      <AnimatePresence>
        {!isUnlocked && <LockScreen onUnlock={() => setIsUnlocked(true)} />}
      </AnimatePresence>

      {/* BACKGROUND (Only visible when unlocked) */}
      <AnimatePresence>
          {isUnlocked && <SocialGrid />}
      </AnimatePresence>

      {/* HEADER CONTENT */}
      <section className="pt-32 px-6 md:px-12 text-center md:text-left relative z-10">
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isUnlocked ? 1 : 0, y: isUnlocked ? 0 : 20 }}
            transition={{ delay: 0.2 }}
         >
             <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Unlock className="w-4 h-4 text-green-500" />
                <span className="text-green-500 font-mono text-xs uppercase tracking-widest">ACCESS GRANTED</span>
             </div>
             
             <h1 className="text-[12vw] md:text-[7vw] font-bold leading-none tracking-tighter mb-6">
                PLAY.<br /><span className="text-tpc-orange">DOMINATE.</span>
             </h1>
             <p className="text-xl text-gray-400 max-w-2xl mx-auto md:mx-0">
                Stop guessing. Start engineering. <br />
                Use these tools to generate ideas, write hooks, and calculate your empire.
             </p>
         </motion.div>
      </section>

      {/* TOYS GRID */}
      <section className="px-6 md:px-12 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: isUnlocked ? 1 : 0, y: isUnlocked ? 0 : 30 }} transition={{ delay: 0.4 }} className="lg:col-span-1 h-[500px]"><ViralSlots /></motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: isUnlocked ? 1 : 0, y: isUnlocked ? 0 : 30 }} transition={{ delay: 0.5 }} className="lg:col-span-1 h-[500px]"><HookDoctor /></motion.div>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: isUnlocked ? 1 : 0, y: isUnlocked ? 0 : 30 }} transition={{ delay: 0.6 }} className="lg:col-span-1 h-[500px]"><MoneyCalc /></motion.div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="px-6 md:px-12 text-center mt-10 relative z-10 mb-20">
         <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isUnlocked ? 1 : 0 }}
            transition={{ delay: 1 }}
            className="bg-black/80 backdrop-blur-md border border-white/10 rounded-3xl p-12 md:p-20 shadow-2xl relative overflow-hidden"
        >   
            <div className="relative z-10">
                <Smartphone className="w-12 h-12 text-white mx-auto mb-6 opacity-50" />
                <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tighter mb-6 leading-none">Ready to dominate the feed?</h2>
                <p className="text-gray-300 mb-10 text-lg max-w-xl mx-auto">
                    You've played with the tools. Now let our team execute the strategy.
                </p>
                <a href="/contact" className="inline-block px-12 py-5 bg-white text-black font-bold uppercase tracking-widest rounded-full hover:bg-tpc-orange hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Start Your Campaign
                </a>
            </div>
         </motion.div>
      </section>

    </main>
  );
}