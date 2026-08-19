import { useState } from "react";
import { Plus } from "lucide-react";
import { faqs } from "../../data/content";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 md:py-32">
      <div className="max-w-[720px] mx-auto px-6 md:px-10">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase text-ink/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-700" />
            Questions
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-ink mt-3">Before you ask</h2>
        </div>

        <div className="divide-y divide-black/[0.06] border-y border-black/[0.06]">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-medium text-ink">{f.q}</span>
                  <Plus size={18} className={`shrink-0 text-amber-800 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} />
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="text-sm text-ink/60 leading-relaxed pb-5 max-w-[58ch]">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
