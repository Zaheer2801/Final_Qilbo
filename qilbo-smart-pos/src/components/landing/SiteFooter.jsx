import React from "react";
import { useNavigate } from "react-router-dom";
import { LOGO } from "./media";

function FooterCol({ title, links }) {
  return (
    <div>
      <div className="text-sm font-semibold text-white mb-3">{title}</div>
      <ul className="space-y-2">
        {links.map(([l, h]) => (
          <li key={l}><a href={h} className="text-sm text-emerald-100/70 hover:text-white transition-colors">{l}</a></li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  const navigate = useNavigate();
  return (
    <footer className="bg-emerald-900 text-emerald-100/80 border-t border-emerald-800">
      <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img src={LOGO} alt="Qilbo" className="w-10 h-10 rounded-lg" />
            <span className="font-semibold text-white font-heading">Qilbo</span>
          </div>
          <p className="text-sm">The POS brain for independent retailers everywhere.</p>
        </div>
        <FooterCol title="Product" links={[["Features", "#features"], ["How it works", "#workflow"], ["Demo", "#demo"], ["FAQ", "#faq"]]} />
        <FooterCol title="Company" links={[["About", "#"], ["Careers", "#"], ["Contact", "#"]]} />
        <div>
          <div className="text-sm font-semibold text-white mb-3">Get started</div>
          <button onClick={() => navigate("/setup")} className="px-4 py-2 rounded-lg bg-white text-emerald-900 text-sm font-semibold hover:opacity-90 transition-opacity">Start free</button>
        </div>
      </div>
      <div className="border-t border-emerald-800 py-6 text-center text-xs">© {new Date().getFullYear()} Qilbo · Built by store owners, for store owners.</div>
    </footer>
  );
}