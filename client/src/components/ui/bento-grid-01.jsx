import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Globe, Wrench, Building2, Zap, ShieldCheck } from "lucide-react";

function TypeTester() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.4 : 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-2">
      <motion.span
        className="font-serif text-5xl md:text-7xl text-white font-medium tracking-tight"
        animate={{ scale }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        JPTL
      </motion.span>
      <span className="font-mono text-xs text-blue-400">Maintenance Engine</span>
    </div>
  );
}

function LayoutAnimation() {
  const [layout, setLayout] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLayout((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const layouts = ["grid-cols-2", "grid-cols-3", "grid-cols-1"];

  return (
    <div className="h-full flex items-center justify-center">
      <motion.div
        className={`grid ${layouts[layout]} gap-1.5 w-full max-w-[140px] h-full`}
        layout
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="bg-blue-500/30 border border-blue-400/30 rounded-md h-6 w-full flex items-center justify-center text-[10px] font-mono text-white"
            layout
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            Role {i}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function SpeedIndicator() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="h-10 flex items-center justify-center overflow-hidden relative w-full">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              className="h-8 w-24 bg-white/10 rounded"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              exit={{ opacity: 0, y: -20, position: 'absolute' }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <motion.span
              key="text"
              initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              className="text-3xl md:text-4xl font-mono font-bold text-emerald-400"
            >
              &lt; 100ms
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="text-xs text-gray-400 font-mono">Express Sync Execution</span>
      <div className="w-full max-w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: loading ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 15, mass: 1 }}
        />
      </div>
    </div>
  );
}

function SecurityBadge() {
  const [shields, setShields] = useState([
    { id: 1, active: false },
    { id: 2, active: false },
    { id: 3, active: false }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShields(prev => {
        const nextIndex = prev.findIndex(s => !s.active);
        if (nextIndex === -1) {
          return prev.map(() => ({ id: Math.random(), active: false }));
        }
        return prev.map((s, i) => i === nextIndex ? { ...s, active: true } : s);
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-full gap-2">
      {shields.map((shield) => (
        <motion.div
          key={shield.id}
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            shield.active ? 'bg-purple-500/30 border border-purple-400/50' : 'bg-white/5'
          }`}
          animate={{ scale: shield.active ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <Lock className={`w-5 h-5 ${shield.active ? 'text-purple-300' : 'text-gray-600'}`} />
        </motion.div>
      ))}
    </div>
  );
}

function GlobalNetwork() {
  const [pulses] = useState([0, 1, 2, 3, 4]);

  return (
    <div className="flex items-center justify-center h-full relative">
      <Globe className="w-16 h-16 text-blue-400 z-10" />
      {pulses.map((pulse) => (
        <motion.div
          key={pulse}
          className="absolute w-16 h-16 border-2 border-blue-400/40 rounded-full"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: pulse * 0.8,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
}

export function BentoGrid01() {
  return (
    <section className="bg-[#08080C] px-6 py-24 border-t border-white/10">
      <div className="max-w-7xl w-full mx-auto">
        
        <div className="mb-12 text-center">
          <motion.span
            className="inline-block text-blue-400 font-mono text-xs uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            System Capabilities • Shadcn Bento
          </motion.span>
          <motion.h2
            className="font-grotesk text-3xl sm:text-5xl font-extrabold text-white tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Integrated Property Architecture
          </motion.h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">
          
          {/* 1. Maintenance Workflow - Tall (2x2) */}
          <motion.div
            className="md:col-span-2 md:row-span-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 flex flex-col hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(24, 24, 32, 1)" }}
          >
            <div className="flex-1">
              <TypeTester />
            </div>
            <div className="mt-4">
              <h3 className="font-grotesk text-xl text-white font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-400" />
                Ticket Workflow Engine
              </h3>
              <p className="text-gray-400 text-sm mt-1">Cascading status transitions with automatic side-effect history logging.</p>
            </div>
          </motion.div>

          {/* 2. Multi-Role RBAC - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 flex flex-col hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 0.98 }}
          >
            <div className="flex-1">
              <LayoutAnimation />
            </div>
            <div className="mt-4">
              <h3 className="font-grotesk text-xl text-white font-bold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                Multi-Role Scoped Access
              </h3>
              <p className="text-gray-400 text-sm mt-1">Server-side MongoDB query scoping per tenant, landlord, & admin.</p>
            </div>
          </motion.div>

          {/* 3. VAPID Push Network - Tall (2x2) */}
          <motion.div
            className="md:col-span-2 md:row-span-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col hover:border-blue-400/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)" }}
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="relative">
                <GlobalNetwork />
              </div>
            </div>
            <div className="mt-auto relative z-20 bg-zinc-950/80 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <h3 className="font-grotesk text-xl text-white flex items-center gap-2 font-bold">
                <Globe className="w-5 h-5 text-blue-400" />
                VAPID Push Notification Network
              </h3>
              <p className="text-gray-400 text-sm mt-1">Instant real-time web-push alerts on ticket updates & rent checkout.</p>
            </div>
          </motion.div>

          {/* 4. Express Speed - Standard (2x1) */}
          <motion.div
            className="md:col-span-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 flex flex-col hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 0.98 }}
          >
            <div className="flex-1">
              <SpeedIndicator />
            </div>
            <div className="mt-4">
              <h3 className="font-grotesk text-xl text-white font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                Synchronous Execution
              </h3>
              <p className="text-gray-400 text-sm mt-1">Single request-cycle guarantees zero event drops.</p>
            </div>
          </motion.div>

          {/* 5. Enterprise Audit Security - Wide (3x1) */}
          <motion.div
            className="md:col-span-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 flex flex-col hover:border-pink-500/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 0.98 }}
          >
            <div className="flex-1">
              <SecurityBadge />
            </div>
            <div className="mt-4">
              <h3 className="font-grotesk text-xl text-white flex items-center gap-2 font-bold">
                <Lock className="w-5 h-5 text-pink-400" />
                Immutable Audit Trail
              </h3>
              <p className="text-gray-400 text-sm mt-1">Cryptographic audit log snapshots on every administrative & payment action.</p>
            </div>
          </motion.div>

          {/* 6. Multi-Device PWA Access - Wide (3x1) */}
          <motion.div
            className="md:col-span-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-8 flex flex-col hover:border-amber-500/50 transition-all cursor-pointer overflow-hidden backdrop-blur-md"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 0.98 }}
          >
            <div className="flex-1 flex items-center justify-center">
              <ShieldCheck className="w-16 h-16 text-amber-400" />
            </div>
            <div className="mt-4">
              <h3 className="font-grotesk text-xl text-white font-bold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Superadmin Platform Control
              </h3>
              <p className="text-gray-400 text-sm mt-1">Full system health monitoring, error logs, and user account management.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

export default BentoGrid01;
