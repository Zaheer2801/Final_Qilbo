import React, { useState } from "react";
import { X, Bot, Sparkles, Zap, ArrowRight, DollarSign, Percent, MessageSquare, Send } from "lucide-react";
import type { StoreProduct } from "./DashboardView";

export type AiPriceCopilotModalProps = {
  isOpen: boolean;
  onClose: () => void;
  targetProduct: StoreProduct | null;
  newPrice: number;
  matchingGroup: StoreProduct[];
  onApplyBatchPrice: (brandName: string, price: number) => void;
  onApplyBatchMargin: (brandName: string, margin: number) => void;
  onApplyCustomPrompt: (prompt: string) => void;
};

export default function AiPriceCopilotModal({
  isOpen,
  onClose,
  targetProduct,
  newPrice,
  matchingGroup,
  onApplyBatchPrice,
  onApplyBatchMargin,
  onApplyCustomPrompt,
}: AiPriceCopilotModalProps) {
  const [customInput, setCustomInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string }>>([]);

  if (!isOpen || !targetProduct) return null;

  const brandName = targetProduct.brand || targetProduct.name.split(" ")[0];
  const cost = targetProduct.cost || 9.68;
  const calculatedMargin = newPrice > 0 ? (((newPrice - cost) / newPrice) * 100).toFixed(1) : "30.0";
  const allBrandItemsCount = matchingGroup.length + 1;

  const handleSendCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const text = customInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text }]);
    setCustomInput("");

    setTimeout(() => {
      onApplyCustomPrompt(text);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `Got it! Processed your custom instruction: "${text}". Updated all matching items across store inventory.`,
        },
      ]);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#FAF6EF] border border-[#171310]/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#171310]/10 bg-white/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center font-bold shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-ink text-base">Qilbo AI Price Sync Assistant</h3>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                  <Sparkles size={10} /> Smart Assistant
                </span>
              </div>
              <p className="text-xs text-ink/60">Batch Price & Margin Optimization Copilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-ink/60 hover:text-ink transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main AI Notification Card */}
          <div className="bg-white p-4 rounded-xl border border-amber-900/15 shadow-xs space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={18} />
              </div>
              <div className="space-y-1 text-xs text-ink">
                <p>
                  I noticed you changed the price for <strong>{targetProduct.name}</strong> to{" "}
                  <strong className="text-emerald-800 font-mono text-sm">${newPrice.toFixed(2)}</strong> (Gross Margin:{" "}
                  <strong className="text-amber-900 font-mono">{calculatedMargin}%</strong>).
                </p>
                <p className="text-ink/70">
                  There are <strong>{matchingGroup.length} other {brandName} items</strong> in your store inventory with similar pack sizes.
                  Would you like to apply this update to all <strong>{allBrandItemsCount} {brandName} items</strong>?
                </p>
              </div>
            </div>

            {/* List of Affected Items */}
            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-ink/10 text-[11px] space-y-1.5">
              <div className="font-bold text-ink/70 uppercase text-[10px] tracking-wide">
                Matching {brandName} Family Items ({allBrandItemsCount} total):
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1">
                <div className="flex items-center justify-between text-amber-950 font-bold bg-amber-100/60 px-2 py-1 rounded">
                  <span>● {targetProduct.name} (Source)</span>
                  <span className="font-mono text-emerald-800">${newPrice.toFixed(2)} ({calculatedMargin}%)</span>
                </div>
                {matchingGroup.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-ink/70 px-2 py-0.5">
                    <span>• {item.name}</span>
                    <span className="font-mono text-ink/50">${item.price.toFixed(2)} (Current)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Options */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/60">Quick AI Actions</label>
            
            <button
              type="button"
              onClick={() => onApplyBatchPrice(brandName, newPrice)}
              className="w-full p-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-emerald-50 text-xs font-bold shadow-xs transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <DollarSign size={16} className="text-emerald-300" />
                <span>Apply <strong>${newPrice.toFixed(2)}</strong> retail price to all {allBrandItemsCount} {brandName} items</span>
              </div>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => onApplyBatchMargin(brandName, Number(calculatedMargin))}
              className="w-full p-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold shadow-xs transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Percent size={16} className="text-amber-300" />
                <span>Apply <strong>{calculatedMargin}% Gross Margin</strong> target to all {brandName} items</span>
              </div>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Chat Messages Log */}
          {chatMessages.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-ink/10">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-ink/50">Assistant Thread</label>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-xs ${
                      msg.sender === "user"
                        ? "bg-amber-100 text-amber-900 ml-6 font-semibold"
                        : "bg-white border border-ink/15 text-ink mr-6 font-medium"
                    }`}
                  >
                    <strong>{msg.sender === "user" ? "You" : "Qilbo AI"}:</strong> {msg.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Chat Input */}
          <form onSubmit={handleSendCustomPrompt} className="pt-2 border-t border-ink/10 space-y-2">
            <label className="block text-xs font-bold text-ink/70 flex items-center gap-1.5">
              <MessageSquare size={13} className="text-amber-800" /> Custom AI Instruction Prompt
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={`Ask Qilbo AI (e.g. "Set all ${brandName} 4-packs to $13.99")...`}
                className="flex-1 px-3.5 py-2.5 bg-white border border-ink/20 rounded-xl text-xs text-ink focus:outline-none focus:border-amber-800"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Send size={14} /> Send
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#171310]/10 bg-white/80 flex items-center justify-between text-xs">
          <span className="text-ink/50 text-[11px]">Changes log automatically to Activity Audit Log</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-ink/70 hover:bg-black/5 font-semibold text-xs"
          >
            Keep Price for {targetProduct.name} Only
          </button>
        </div>
      </div>
    </div>
  );
}
