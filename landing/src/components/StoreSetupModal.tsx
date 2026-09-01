import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Plus, CheckCircle2, Store, Clock, ShieldCheck } from "lucide-react";

export type StoreSetupModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const OB_STEPS = [
  "Business & Owner",
  "Vertical & Operations",
  "Tax & Financials",
  "Procurement Style",
  "Category Pricing Floors",
  "Review & Launch Store",
];

const VERTICALS = ["Liquor & Wine Retail", "Convenience & Grocery", "Boutique & General Retail", "Hospitality / Bar", "E-commerce"];

export default function StoreSetupModal({ isOpen, onClose }: StoreSetupModalProps) {
  const [step, setStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const [form, setForm] = useState({
    businessName: "",
    dbaName: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    ownerName: "",
    phone: "",
    email: "",
    vertical: "Liquor & Wine Retail",
    taxRate: "7.0",
    rent: "3200",
    marginPolicy: [
      { category: "Spirits & Liquor", minMargin: "28" },
      { category: "Wine & Champagne", minMargin: "35" },
      { category: "Beer & Craft Brews", minMargin: "24" },
    ],
  });

  if (!isOpen) return null;

  const handleInputChange = (field: string, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleMarginChange = (idx: number, field: string, val: string) => {
    setForm((prev) => {
      const nextPolicy = [...prev.marginPolicy];
      nextPolicy[idx] = { ...nextPolicy[idx], [field]: val };
      return { ...prev, marginPolicy: nextPolicy };
    });
  };

  const handleAddCategory = () => {
    setForm((prev) => ({
      ...prev,
      marginPolicy: [...prev.marginPolicy, { category: "", minMargin: "25" }],
    }));
  };

  const handleComplete = () => {
    setIsCompleted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#FAF6EF] border border-[#171310]/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#171310]/10 bg-white/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-800 text-amber-50 flex items-center justify-center font-bold font-display text-sm">
              Q
            </div>
            <div>
              <h3 className="font-display font-bold text-ink text-base">Setup Your Qilbo Store</h3>
              <p className="text-xs text-ink/60">Step {step + 1} of {OB_STEPS.length}: {OB_STEPS[step]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-ink/60 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-black/5 h-1">
          <div
            className="bg-amber-800 h-full transition-all duration-300"
            style={{ width: `${((step + 1) / OB_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isCompleted ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl font-bold font-display text-ink">Store Setup Complete!</h2>
              <p className="text-sm text-ink/70 max-w-md mx-auto">
                <strong>{form.dbaName || form.businessName || "Your Store"}</strong> is now configured with inventory margin guardrails and sales tax rules.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = "http://localhost:5173";
                  }}
                  className="px-6 py-2.5 rounded-lg bg-amber-800 text-amber-50 font-semibold text-sm hover:bg-amber-900 shadow-sm transition-all"
                >
                  Launch Live POS Dashboard
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-lg border border-ink/20 text-ink font-medium text-sm hover:bg-black/5 transition-all"
                >
                  Back to Landing Page
                </button>
              </div>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-900/5 border border-amber-900/10 text-xs text-amber-900 flex items-start gap-2.5">
                    <Store size={16} className="mt-0.5 shrink-0" />
                    <span>Enter your legal business details. Qilbo will configure margin guardrails and tax rules based on your store profile.</span>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">Legal Business Name</label>
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      placeholder="e.g. Cask & Cellar Fine Wines LLC"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ink/15 text-sm text-ink focus:outline-none focus:border-amber-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">Storefront / DBA Name</label>
                    <input
                      type="text"
                      value={form.dbaName}
                      onChange={(e) => handleInputChange("dbaName", e.target.value)}
                      placeholder="e.g. Cask & Cellar Spirits"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ink/15 text-sm text-ink focus:outline-none focus:border-amber-800"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink/80 mb-1">Owner Name</label>
                      <input
                        type="text"
                        value={form.ownerName}
                        onChange={(e) => handleInputChange("ownerName", e.target.value)}
                        placeholder="Owner / Manager"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ink/15 text-sm text-ink focus:outline-none focus:border-amber-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink/80 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="owner@caskandcellar.com"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ink/15 text-sm text-ink focus:outline-none focus:border-amber-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink/80 mb-1">Store Vertical Category</label>
                    <select
                      value={form.vertical}
                      onChange={(e) => handleInputChange("vertical", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ink/15 text-sm text-ink focus:outline-none focus:border-amber-800"
                    >
                      {VERTICALS.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                      <Clock size={15} /> Store Operating Hours
                    </div>
                    <p className="text-xs text-ink/60">Configured automatically for standard 9:00 AM – 10:00 PM retail hours. Adjustable per day in Settings.</p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-ink/80 mb-1">Sales Tax Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={form.taxRate}
                        onChange={(e) => handleInputChange("taxRate", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ink/15 text-sm text-ink focus:outline-none focus:border-amber-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink/80 mb-1">Est. Monthly Overhead ($)</label>
                      <input
                        type="number"
                        value={form.rent}
                        onChange={(e) => handleInputChange("rent", e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-ink/15 text-sm text-ink focus:outline-none focus:border-amber-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                      <ShieldCheck size={16} /> Reorder Approval Guardrails
                    </div>
                    <p className="text-xs text-ink/70">Qilbo drafts purchase orders when stock approaches reorder points. All purchase orders require logged owner approval before submission.</p>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-xs text-ink/70">Define minimum gross profit margin floors per category. POS price checks will flag any price lower than these thresholds.</p>
                  <div className="space-y-2.5">
                    {form.marginPolicy.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleMarginChange(idx, "category", e.target.value)}
                          placeholder="Category Name"
                          className="px-3.5 py-2 rounded-lg bg-white border border-ink/15 text-xs text-ink focus:outline-none"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            value={item.minMargin}
                            onChange={(e) => handleMarginChange(idx, "minMargin", e.target.value)}
                            className="w-full px-3.5 py-2 rounded-lg bg-white border border-ink/15 text-xs text-ink focus:outline-none pr-8"
                          />
                          <span className="absolute right-3 top-2 text-xs text-ink/50">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900"
                  >
                    <Plus size={14} /> Add Category Floor
                  </button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white border border-ink/10 space-y-2">
                    <h4 className="text-sm font-bold text-ink">Review Store Profile</h4>
                    <div className="text-xs space-y-1 text-ink/80">
                      <div><strong className="text-ink">Store Name:</strong> {form.dbaName || form.businessName || "Default Store"}</div>
                      <div><strong className="text-ink">Vertical:</strong> {form.vertical}</div>
                      <div><strong className="text-ink">Sales Tax:</strong> {form.taxRate}%</div>
                      <div><strong className="text-ink">Categories Configured:</strong> {form.marginPolicy.length}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Controls */}
        {!isCompleted && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#171310]/10 bg-white/60">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-ink/70 hover:text-ink disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={() => {
                if (step === OB_STEPS.length - 1) {
                  handleComplete();
                } else {
                  setStep((s) => s + 1);
                }
              }}
              className="px-5 py-2.5 rounded-lg bg-amber-800 text-amber-50 text-xs font-semibold hover:bg-amber-900 shadow-sm transition-all flex items-center gap-1"
            >
              {step === OB_STEPS.length - 1 ? "Complete Setup" : "Continue"} <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
