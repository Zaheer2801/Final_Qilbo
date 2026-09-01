import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PackageCheck, ShoppingCart, Phone, Headphones, BrainCircuit, Sparkles, Pause, Play, Activity,
  AlertCircle, TrendingUp, FileText, Send, Receipt,
  CheckCircle, Package, CreditCard, Truck, Award,
  MessageSquare, UtensilsCrossed, CalendarCheck, Plug, Check,
  UserSearch, MessageCircle, LifeBuoy, ClipboardList, Smile,
} from "lucide-react";
import Reveal from "./Reveal";

const WORKFLOWS = [
  {
    id: "replenish",
    label: "Inventory Replenishment",
    icon: PackageCheck,
    tagline: "From a low shelf to a reconciled invoice — automatically.",
    steps: [
      { icon: AlertCircle, title: "Stock trigger", body: "A product drops to its reorder point — Qilbo catches it instantly.", live: "Low stock alert · Bourbon 750ml (4 left)" },
      { icon: TrendingUp, title: "Demand forecast", body: "The agent predicts how much to reorder using sales velocity and seasonality.", live: "Forecast: reorder 24 units by Friday" },
      { icon: FileText, title: "Draft purchase order", body: "A PO is drafted automatically with the right quantities and vendor.", live: "PO #4421 drafted · Acme Distributors" },
      { icon: Send, title: "Send to vendor", body: "The PO is emailed to the vendor and lead time is confirmed.", live: "PO #4421 sent to Acme Distributors" },
      { icon: PackageCheck, title: "Receive & match", body: "On delivery, items are matched to the PO and inventory updates live.", live: "Delivery received · 24 units matched" },
      { icon: Receipt, title: "Invoice reconciliation", body: "The agent reads the invoice, checks every line, and flags any price hike.", live: "Invoice matched · 1 price hike flagged" },
    ],
  },
  {
    id: "order",
    label: "Order to Sale",
    icon: ShoppingCart,
    tagline: "From a customer's click to loyalty points earned.",
    steps: [
      { icon: ShoppingCart, title: "Order placed", body: "A customer places an order in-store, online, or by phone.", live: "New order #8830 · $42.10" },
      { icon: CheckCircle, title: "Confirm & price", body: "Qilbo confirms availability and applies the right price, deals, and tax.", live: "Order #8830 confirmed · deal applied" },
      { icon: Package, title: "Reserve stock", body: "Inventory is reserved instantly so you never oversell.", live: "Stock reserved · 3 items" },
      { icon: CreditCard, title: "Take payment", body: "Payment is processed — cash, card, or EBT — and the sale is recorded.", live: "Payment received · Visa ••4242" },
      { icon: Truck, title: "Fulfill", body: "The order is packed, handed off, or delivered with a tracking link.", live: "Order #8830 fulfilled" },
      { icon: Award, title: "Loyalty update", body: "Points, lifetime spend, and tier update on the customer profile.", live: "+42 points · Maria G." },
    ],
  },
  {
    id: "voice",
    label: "Restaurant Voice Agent",
    icon: Phone,
    tagline: "Answers every call, takes every order, books every table.",
    steps: [
      { icon: Phone, title: "Caller dials in", body: "A customer calls the restaurant — the voice agent picks up instantly.", live: "Incoming call · (212) 555-0142" },
      { icon: MessageSquare, title: "Greet & listen", body: "It greets the caller and understands whether it's an order or a reservation.", live: "Call connected · 0:14" },
      { icon: UtensilsCrossed, title: "Take order", body: "It takes the full order, repeats it back, and captures special requests.", live: "Order taken · 3 items" },
      { icon: CalendarCheck, title: "Reserve table", body: "For reservations, it books the table, party size, and time — no double bookings.", live: "Table for 4 · 7:30 PM" },
      { icon: Plug, title: "Sync to POS", body: "The order or reservation flows straight into the POS and calendar.", live: "Synced to POS · Order #8831" },
      { icon: Check, title: "Send confirmation", body: "The caller gets a text confirmation with all the details.", live: "SMS confirmation sent" },
    ],
  },
  {
    id: "care",
    label: "Customer Care",
    icon: Headphones,
    tagline: "Every message answered, every issue tracked to a happy ending.",
    steps: [
      { icon: Headphones, title: "Reach out", body: "A customer messages via chat, email, or phone — Qilbo greets them.", live: "New chat · Jamie L." },
      { icon: UserSearch, title: "Identify account", body: "The agent pulls up the customer's history and recent orders.", live: "Account pulled · 12 orders" },
      { icon: MessageCircle, title: "Understand issue", body: "It understands the problem in plain language and checks for known fixes.", live: "Issue classified · refund request" },
      { icon: LifeBuoy, title: "Resolve or escalate", body: "Simple issues are resolved instantly; complex ones escalate with full context.", live: "Refund issued · $18.00" },
      { icon: ClipboardList, title: "Log & follow up", body: "Every interaction is logged and a follow-up is scheduled if needed.", live: "Follow-up scheduled · 2 days" },
      { icon: Smile, title: "Satisfaction check", body: "Qilbo asks for feedback and flags unhappy customers for a personal touch.", live: "Feedback · ⭐⭐⭐⭐⭐" },
    ],
  },
];

const STEP_MS = 2800;

function relTime(ts, now) {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 2) return "just now";
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
}

function Flowchart({ workflow }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [feed, setFeed] = useState([]);
  const [automated, setAutomated] = useState(1204);
  const [now, setNow] = useState(Date.now());
  const idRef = useRef(0);
  const steps = workflow.steps;

  // reset on workflow change
  useEffect(() => {
    setActive(0);
    setFeed([]);
  }, [workflow.id]);

  // autoplay
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), STEP_MS);
    return () => clearInterval(id);
  }, [paused, steps.length]);

  // stream a live event when the active step changes
  useEffect(() => {
    const s = steps[active];
    const ev = { id: ++idRef.current, icon: s.icon, title: s.title, sub: s.live, ts: Date.now() };
    setFeed((f) => [ev, ...f].slice(0, 6));
    setAutomated((n) => n + 1);
  }, [active, workflow.id]);

  // tick for relative times
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* flowchart */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 shadow-2xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.div animate={{ x: [0, 40, 0], y: [0, -30, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-20 -left-10 w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px]" />
        <motion.div animate={{ x: [0, -40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-24 -right-10 w-80 h-80 bg-teal-500/20 rounded-full blur-[110px]" />

        <div className="relative flex items-center justify-between px-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-medium">
            <motion.span animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}><BrainCircuit className="w-3.5 h-3.5" /></motion.span>
            Qilbo AI Agent
          </div>
          <button onClick={() => setPaused((p) => !p)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-white/80 text-xs font-medium hover:bg-white/15 transition-colors">
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />} {paused ? "Play" : "Pause"}
          </button>
        </div>

        <div className="relative px-6 mt-4">
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <motion.div key={`${workflow.id}-${active}`} className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: STEP_MS / 1000, ease: "linear" }} />
          </div>
        </div>

        <div className="relative px-4 sm:px-6 pt-8 pb-2 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <button onClick={() => setActive(i)} className="flex flex-col items-center gap-2 shrink-0 w-20 sm:w-24">
                  <div className="relative">
                    {i === active && (
                      <motion.span className="absolute inset-0 rounded-2xl border-2 border-emerald-400" animate={{ scale: [1, 1.35], opacity: [0.7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }} />
                    )}
                    <motion.div animate={i === active ? { scale: 1.12 } : { scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-colors ${i === active ? "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/50" : i < active ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-white/5 text-white/40 border border-white/10"}`}>
                      <s.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                  </div>
                  <span className={`text-[10px] sm:text-[11px] font-medium text-center leading-tight ${i === active ? "text-white" : "text-white/50"}`}>{s.title}</span>
                </button>
                {i < steps.length - 1 && (
                  <div className={`relative flex-1 h-0.5 rounded-full mx-1 min-w-[28px] transition-colors ${i < active ? "bg-gradient-to-r from-emerald-400/80 to-teal-400/80" : "bg-white/10"}`}>
                    <motion.span className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full shadow-[0_0_8px] shadow-emerald-300" animate={{ left: ["0%", "100%"] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }} style={{ background: i < active ? "#fff" : "#34d399" }} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="relative px-6 pb-6 pt-4 min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div key={`${workflow.id}-${active}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                {(() => { const Icon = steps[active].icon; return <Icon className="w-6 h-6 text-white" />; })()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-emerald-300/80 uppercase tracking-wider">Step {active + 1} of {steps.length}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300/70">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-1 h-1 rounded-full bg-emerald-300" /> Automated
                  </span>
                </div>
                <h4 className="text-lg font-semibold text-white font-heading mt-0.5">{steps[active].title}</h4>
                <p className="text-sm text-white/60 mt-1 leading-relaxed">{steps[active].body}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* live feed */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.12 }}
        className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 to-emerald-950 shadow-2xl flex flex-col"
      >
        <motion.div animate={{ x: [0, -30, 0] }} transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-16 -right-10 w-56 h-56 bg-emerald-500/15 rounded-full blur-[90px]" />

        <div className="relative flex items-center justify-between px-5 pt-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-400/30 text-red-300 text-xs font-semibold">
            <motion.span animate={{ opacity: [1, 0.2, 1], scale: [1, 0.8, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="w-2 h-2 rounded-full bg-red-400" /> LIVE
          </div>
          <span className="text-[11px] text-white/40 uppercase tracking-wider">Agent activity</span>
        </div>

        <div className="relative px-5 pt-4">
          <div className="flex items-center gap-2 text-white">
            <Activity className="w-4 h-4 text-emerald-300" />
            <span className="text-2xl font-bold font-heading tabular-nums">
              <motion.span key={automated} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>{automated.toLocaleString()}</motion.span>
            </span>
            <span className="text-xs text-white/50">tasks automated today</span>
          </div>
        </div>

        <div className="relative flex-1 px-3 pt-3 pb-4 overflow-hidden">
          <AnimatePresence initial={false}>
            {feed.map((ev) => (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, x: -18, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="px-2"
              >
                <div className="flex items-center gap-3 py-2.5 border-t border-white/5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-400/20 flex items-center justify-center shrink-0">
                    <ev.icon className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">{ev.sub}</div>
                    <div className="text-[10px] text-white/40">{ev.title} · {relTime(ev.ts, now)}</div>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function Workflows() {
  const [tab, setTab] = useState(WORKFLOWS[0].id);
  const wf = WORKFLOWS.find((w) => w.id === tab);

  return (
    <section id="workflow" className="relative bg-background py-24">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal><p className="text-primary text-sm font-semibold uppercase tracking-widest text-center">Qilbo Workflows</p></Reveal>
        <Reveal delay={0.05}><h2 className="text-3xl sm:text-5xl font-bold text-foreground text-center font-heading">Watch a Qilbo workflow <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">run itself.</span></h2></Reveal>
        <Reveal delay={0.1}><p className="text-muted-foreground text-center mt-3 max-w-2xl mx-auto">Pick a workflow and follow the playhead as the Qilbo AI agent moves through each step — live, in real time.</p></Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {WORKFLOWS.map((w, i) => (
              <motion.button
                key={w.id}
                onClick={() => setTab(w.id)}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.12 + i * 0.06, duration: 0.4 }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === w.id ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25" : "bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
              >
                <w.icon className="w-4 h-4" /> {w.label}
              </motion.button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-center text-sm text-muted-foreground mt-6 inline-flex items-center gap-1.5 w-full justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> {wf.tagline}
          </p>
        </Reveal>

        <Flowchart key={tab} workflow={wf} />
      </div>
    </section>
  );
}