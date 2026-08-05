import Receipt from "./components/Receipt";

const WATCH_ITEMS = [
  {
    n: "01",
    title: "Inventory & reorder points",
    body: "Every size tracked separately — a 50ml and a 750ml of the same bottle sell at completely different speeds. Qilbo catches the gap before the shelf is empty.",
  },
  {
    n: "02",
    title: "Expiry & spoilage risk",
    body: "Not just a date — days remaining weighed against how fast it's actually selling. A slow mover with a full case is a bigger problem than a fast mover with three bottles left.",
  },
  {
    n: "03",
    title: "Margin guardrails",
    body: "A floor per category, checked on every price. If a number falls below it, Qilbo blocks it and says exactly why — never a silent markdown.",
  },
  {
    n: "04",
    title: "Demand you're not seeing",
    body: "Every 'do you carry Casamigos' that gets a no — logged, counted, and surfaced once it's a real pattern, not a single customer.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Qilbo flags it",
    body: "Pulled from live inventory, sales, and invoices — never a guess, never a number recalled from memory.",
  },
  {
    n: "2",
    title: "Qilbo drafts the action",
    body: "Exact quantities, exact vendor, exact cost. A reorder, a price change, a vendor follow-up — fully specified before it ever reaches you.",
  },
  {
    n: "3",
    title: "You approve — or you don't",
    body: "That's the only thing that executes. No vendor call, no price change, no order placed without it. Every time.",
  },
];

export default function App() {
  return (
    <div className="bg-paper text-ink font-sans">
      {/* ---------------- Hero ---------------- */}
      <section id="decision" className="bg-ink text-receipt">
        <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center">
          <div className="w-8 h-8 rounded bg-accent text-ink flex items-center justify-center font-serif font-bold text-sm">Q</div>
          <span className="ml-2 font-serif text-lg tracking-tight">Qilbo</span>
        </nav>

        <div className="max-w-6xl mx-auto px-6 pt-8 pb-20 md:pb-28 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl leading-[1.15] mb-6">
              Nothing spends.
              <br />
              Nothing ships.
              <br />
              Nothing calls a vendor.
              <br />
              <span className="text-accent">Until you say so.</span>
            </h1>
            <p className="text-receipt/70 text-lg leading-relaxed max-w-md">
              Qilbo tracks inventory, catches reorders before you run out, flags margin and expiry risk, and drafts
              every purchase order — but nothing executes until you approve it. Built for liquor retail first.
            </p>
          </div>
          <Receipt />
        </div>
      </section>

      {/* ---------------- What Qilbo watches ---------------- */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <p className="font-mono text-xs tracking-widest text-accent mb-3">WHAT IT WATCHES</p>
        <h2 className="font-serif text-3xl md:text-4xl max-w-xl mb-14">
          Qilbo's job is to notice. Yours is to decide.
        </h2>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
          {WATCH_ITEMS.map((item) => (
            <div key={item.n} className="flex gap-5">
              <span className="font-mono text-sm text-muted pt-1">{item.n}</span>
              <div>
                <h3 className="font-serif text-xl mb-1.5">{item.title}</h3>
                <p className="text-ink/70 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- How the approval gate works ---------------- */}
      <section id="how-it-works" className="bg-ink text-receipt py-24">
        <div className="max-w-6xl mx-auto px-6">
          <p className="font-mono text-xs tracking-widest text-accent mb-3">THE APPROVAL GATE</p>
          <h2 className="font-serif text-3xl md:text-4xl max-w-xl mb-14">Three steps. The third one is always yours.</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {STEPS.map((step) => (
              <div key={step.n} className="border-t border-receipt/20 pt-6">
                <span className="font-serif text-3xl text-accent">{step.n}</span>
                <h3 className="font-serif text-xl mt-3 mb-2">{step.title}</h3>
                <p className="text-receipt/65 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section id="cta" className="max-w-6xl mx-auto px-6 py-28 text-center">
        <h2 className="font-serif text-3xl md:text-4xl max-w-xl mx-auto mb-6">
          Every decision, printed. Every action, yours to approve.
        </h2>
        <a
          href="#decision"
          className="inline-flex items-center gap-2 bg-accent text-ink font-semibold px-6 py-3 rounded-sm hover:bg-accent/90 transition-colors"
        >
          See how approval works
        </a>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex items-center justify-between text-sm text-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-ink text-receipt flex items-center justify-center font-serif font-bold text-[10px]">Q</div>
            <span className="font-serif text-ink">Qilbo</span>
          </div>
          <span>Liquor retail, first.</span>
        </div>
      </footer>
    </div>
  );
}
