export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-canvas/90 backdrop-blur border-b border-black/[0.06]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm font-display">
            Q
          </div>
          <span className="font-display font-bold text-lg tracking-tight">Qilbo</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-ink/70">
          <a href="#features" className="hover:text-ink transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-ink transition-colors">
            How it works
          </a>
          <a href="#faq" className="hover:text-ink transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" className="hidden sm:inline text-sm text-ink/70 hover:text-ink transition-colors">
            Log in
          </a>
          <a
            href="#cta"
            className="inline-flex items-center rounded-md bg-amber-800 text-amber-50 text-sm font-medium px-4 py-2 hover:bg-amber-900 transition-colors"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
