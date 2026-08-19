export default function FinalCTA() {
  return (
    <section id="cta" className="relative py-24 md:py-32">
      <div className="max-w-[720px] mx-auto px-6 md:px-10 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink">See it on your own numbers</h2>
        <p className="mt-4 text-ink/60 max-w-[46ch] mx-auto leading-relaxed">
          Qilbo's inventory, reorder, and pricing logic is built and working today — bring your own product list and see
          what it flags.
        </p>
        <div className="mt-8">
          <a
            href="#"
            className="inline-flex items-center rounded-md bg-amber-800 text-amber-50 text-sm font-medium px-6 py-3.5 hover:bg-amber-900 transition-colors"
          >
            Get started
          </a>
        </div>
      </div>
    </section>
  );
}
