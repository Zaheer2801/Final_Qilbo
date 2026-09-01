export default function FinalCTA({ onOpenSetup }: { onOpenSetup?: () => void }) {
  return (
    <section id="cta" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Image Visual Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-multiply">
        <img src="/pos_hero_bg.jpg" alt="Retail POS Store Background" className="w-full h-full object-cover" />
      </div>

      <div className="relative max-w-[720px] mx-auto px-6 md:px-10 text-center z-10">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink">See it on your own numbers</h2>
        <p className="mt-4 text-ink/60 max-w-[46ch] mx-auto leading-relaxed">
          Qilbo's inventory, reorder, and pricing logic is built and working today — bring your own product list and see
          what it flags.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={onOpenSetup}
            className="inline-flex items-center rounded-md bg-amber-800 text-amber-50 text-sm font-medium px-6 py-3.5 hover:bg-amber-900 transition-all hover:scale-105 shadow-sm cursor-pointer"
          >
            Get started
          </button>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-md bg-amber-100 text-amber-900 text-sm font-medium px-6 py-3.5 hover:bg-amber-200 transition-colors border border-amber-300/60"
          >
            Launch POS Demo
          </a>
        </div>
      </div>
    </section>
  );
}
