export default function Nav({ onGetStarted }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-stone-50/90 backdrop-blur border-b border-black/[0.06]">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-sm">
            Q
          </div>
          <span className="font-bold text-lg tracking-tight">Qilbo</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm text-stone-600">
          <a href="#features" className="hover:text-stone-900 transition-colors">
            Features
          </a>
          <a href="#workflow" className="hover:text-stone-900 transition-colors">
            How it works
          </a>
          <a href="#faq" className="hover:text-stone-900 transition-colors">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" className="hidden sm:inline text-sm text-stone-600 hover:text-stone-900 transition-colors">
            Log in
          </a>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center rounded-md bg-amber-800 text-amber-50 text-sm font-medium px-4 py-2 hover:bg-amber-900 transition-colors"
          >
            Get started
          </button>
        </div>
      </div>
    </header>
  );
}
