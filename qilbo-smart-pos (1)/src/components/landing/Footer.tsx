export default function Footer() {
  return (
    <footer className="bg-charcoal text-amber-100/60 py-14">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-amber-800 text-amber-50 flex items-center justify-center font-bold text-xs font-display">
            Q
          </div>
          <span className="font-display font-semibold text-amber-50">Qilbo</span>
        </div>
        <p className="text-xs text-amber-100/40">Prototype — not yet connected to a live POS.</p>
      </div>
    </footer>
  );
}
