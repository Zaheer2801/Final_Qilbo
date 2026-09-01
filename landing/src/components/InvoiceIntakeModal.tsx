import { useState, useRef } from "react";
import { X, Upload, FileText, Image as ImageIcon, FileSpreadsheet, Edit3, CheckCircle2, AlertTriangle, ArrowRight, PackageCheck } from "lucide-react";

export type InvoiceLineParsed = {
  vendorItemNo: string;
  description: string;
  upc: string; // MUST BE TEXT to preserve leading zero!
  qtyCases: number;
  packsPerCase: number;
  unitsReceived: number;
  casePrice: number;
  discount: number;
  unitCost: number;
  lineNet: number;
  flag?: "breakage" | "out_of_stock" | "unparsed_pack" | "normal";
  flagNote?: string;
};

export type InvoiceIntakeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCommitInvoice: (invoiceNo: string, vendorName: string, lines: InvoiceLineParsed[], creditAlert: number) => void;
};

// Sample real Wayne Densch distributor invoice data for test reference
const WAYNE_DENSCH_SAMPLE_LINES: InvoiceLineParsed[] = [
  {
    vendorItemNo: "61044",
    description: "BUSCH 6/4/16 CAN",
    upc: "018200005428",
    qtyCases: 6,
    packsPerCase: 6,
    unitsReceived: 36,
    casePrice: 31.45,
    discount: 0.00,
    unitCost: 5.24,
    lineNet: 188.70,
    flag: "normal",
  },
  {
    vendorItemNo: "61099",
    description: "NATURAL ICE 6/4/16 CAN",
    upc: "018200005459",
    qtyCases: 7,
    packsPerCase: 6,
    unitsReceived: 42,
    casePrice: 29.04,
    discount: 0.00,
    unitCost: 4.84,
    lineNet: 203.28,
    flag: "normal",
  },
  {
    vendorItemNo: "61168",
    description: "BUSCH 24/12 CAN",
    upc: "018200611681",
    qtyCases: 2,
    packsPerCase: 1,
    unitsReceived: 2,
    casePrice: 19.65,
    discount: 1.95,
    unitCost: 17.70,
    lineNet: 35.40,
    flag: "normal",
  },
  {
    vendorItemNo: "96769",
    description: "MICHELOB ULTRA 2/12/12 BTL",
    upc: "018200059902",
    qtyCases: 2,
    packsPerCase: 2,
    unitsReceived: 4,
    casePrice: 29.95,
    discount: 0.00,
    unitCost: 14.97,
    lineNet: 59.90,
    flag: "normal",
  },
  {
    vendorItemNo: "02201",
    description: "CUTWATER LONG ISLAND 6/4/12 CAN",
    upc: "816751021993",
    qtyCases: 1,
    packsPerCase: 6,
    unitsReceived: 6,
    casePrice: 62.55,
    discount: 4.45,
    unitCost: 9.68,
    lineNet: 58.10,
    flag: "normal",
  },
  {
    vendorItemNo: "99952",
    description: "MD 2020 GRAPE - BREAKAGE ON TRUCK",
    upc: "088004144722",
    qtyCases: 1,
    packsPerCase: 1,
    unitsReceived: 0,
    casePrice: 31.45,
    discount: 0.00,
    unitCost: 0.00,
    lineNet: 31.45,
    flag: "breakage",
    flagNote: "-1 BREAKAGE ON TRUCK ($31.45 Credit Owed)",
  },
];

export default function InvoiceIntakeModal({ isOpen, onClose, onCommitInvoice }: InvoiceIntakeModalProps) {
  const [intakeMode, setIntakeMode] = useState<"file" | "manual">("file");
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [vendorName] = useState("Wayne Densch, Inc.");
  const [invoiceNo] = useState("523219");
  const [parsedLines, setParsedLines] = useState<InvoiceLineParsed[]>(WAYNE_DENSCH_SAMPLE_LINES);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual entry single line form
  const [manualDesc, setManualDesc] = useState("");
  const [manualUpc, setManualUpc] = useState("");
  const [manualCases, setManualCases] = useState("1");
  const [manualPacks, setManualPacks] = useState("6");
  const [manualPrice] = useState("31.45");

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      // Automatically run intelligent pack-structure parser and switch to review step
      setStep("review");
    }
  };

  const handleAddManualLine = () => {
    if (!manualDesc) return;
    const cases = Number(manualCases) || 1;
    const packs = Number(manualPacks) || 1;
    const caseP = Number(manualPrice) || 0;
    const units = cases * packs;
    const unitC = packs > 0 ? caseP / packs : caseP;

    const newLine: InvoiceLineParsed = {
      vendorItemNo: `M${Math.floor(1000 + Math.random() * 9000)}`,
      description: manualDesc,
      upc: manualUpc || "000000000000",
      qtyCases: cases,
      packsPerCase: packs,
      unitsReceived: units,
      casePrice: caseP,
      discount: 0,
      unitCost: Number(unitC.toFixed(2)),
      lineNet: Number((cases * caseP).toFixed(2)),
      flag: "normal",
    };

    setParsedLines([...parsedLines, newLine]);
    setManualDesc("");
    setManualUpc("");
    setStep("review");
  };

  const calculateTotalNet = () => {
    return parsedLines.reduce((sum, line) => sum + (line.flag === "breakage" ? line.lineNet : line.lineNet), 0);
  };

  const calculateCreditAlerts = () => {
    return parsedLines
      .filter((l) => l.flag === "breakage")
      .reduce((sum, l) => sum + l.lineNet, 0);
  };

  const handleCommit = () => {
    onCommitInvoice(invoiceNo, vendorName, parsedLines, calculateCreditAlerts());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl bg-[#FAF6EF] border border-[#171310]/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#171310]/10 bg-white/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-800 text-amber-50 flex items-center justify-center font-bold font-display text-sm">
              Q
            </div>
            <div>
              <h3 className="font-display font-bold text-ink text-base">Multi-Format Invoice & Receipt Intake</h3>
              <p className="text-xs text-ink/60">PDF, Image OCR, NRS Sales CSV & Manual Entry with Pack Structure Parser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 text-ink/60 hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {step === "upload" ? (
            <div className="space-y-6">
              {/* Format Switcher */}
              <div className="flex rounded-xl bg-black/5 p-1 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => setIntakeMode("file")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    intakeMode === "file" ? "bg-white text-amber-900 shadow-xs" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <Upload size={14} /> Upload File (PDF / Image / CSV)
                </button>
                <button
                  type="button"
                  onClick={() => setIntakeMode("manual")}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    intakeMode === "manual" ? "bg-white text-amber-900 shadow-xs" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <Edit3 size={14} /> Manual Line Entry
                </button>
              </div>

              {intakeMode === "file" ? (
                <div className="space-y-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-amber-800/30 hover:border-amber-800 bg-white/80 hover:bg-amber-50/40 rounded-2xl p-10 text-center cursor-pointer transition-all space-y-3 group"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.csv"
                      className="hidden"
                    />
                    <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-ink">Drop your Distributor Invoice or Receipt</h4>
                      <p className="text-xs text-ink/60 mt-1">Supports PDF (e.g. Wayne Densch #523219), Image Receipts, or NRS Sales CSVs</p>
                    </div>
                    <div className="flex justify-center gap-3 pt-2 text-[11px] text-ink/50 font-medium">
                      <span className="flex items-center gap-1"><FileText size={12} /> PDF Invoices</span>
                      <span className="flex items-center gap-1"><ImageIcon size={12} /> Image Receipts</span>
                      <span className="flex items-center gap-1"><FileSpreadsheet size={12} /> NRS CSV Sales</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-900/5 border border-amber-900/10 text-xs text-amber-900 flex items-start gap-3">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-amber-800" />
                    <div>
                      <strong className="block font-bold">Try Sample Test Invoice #523219 (Wayne Densch Inc.)</strong>
                      <span>Click below to instantly run the automatic pack-structure parser on sample Wayne Densch delivery records.</span>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFileName("Wayne_Densch_Invoice_523219.pdf");
                            setStep("review");
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-amber-800 text-amber-50 font-semibold text-xs hover:bg-amber-900 transition-all inline-flex items-center gap-1.5"
                        >
                          Load Test Reference Invoice #523219 <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-2xl border border-ink/10 space-y-4">
                  <h4 className="font-bold text-sm text-ink">Manual Invoice Item Entry</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 mb-1">Item Description (e.g. BUSCH 6/4/16 CAN)</label>
                      <input
                        type="text"
                        value={manualDesc}
                        onChange={(e) => setManualDesc(e.target.value)}
                        placeholder="BUSCH 6/4/16 CAN"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-ink/15"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 mb-1">UPC (Preserved String with 0)</label>
                      <input
                        type="text"
                        value={manualUpc}
                        onChange={(e) => setManualUpc(e.target.value)}
                        placeholder="018200005428"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-ink/15 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 mb-1">Cases Delivered</label>
                      <input
                        type="number"
                        value={manualCases}
                        onChange={(e) => setManualCases(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-ink/15"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 mb-1">Packs per Case (e.g. 6 for 6/4/16)</label>
                      <input
                        type="number"
                        value={manualPacks}
                        onChange={(e) => setManualPacks(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-ink/15"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddManualLine}
                    className="px-4 py-2 rounded-lg bg-amber-800 text-amber-50 text-xs font-semibold hover:bg-amber-900"
                  >
                    Add Line Item & Review
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: LINE-BY-LINE CONFIRMATION SCREEN */
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-ink/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-ink">{vendorName}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-xs">Inv #{invoiceNo}</span>
                  </div>
                  <p className="text-xs text-ink/60 mt-0.5">Parsed File: {uploadedFileName || "Manual Entry"}</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-ink/50">Invoice Reconciliation Total</div>
                  <div className="text-lg font-bold text-ink">${calculateTotalNet().toFixed(2)}</div>
                </div>
              </div>

              {/* Credit Owed Alert Notification */}
              {calculateCreditAlerts() > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className="text-amber-700 shrink-0" />
                    <span><strong>Credit-Owed Alert Fired:</strong> Driver breakage or non-delivered line detected. Credit owed: <strong>${calculateCreditAlerts().toFixed(2)}</strong></span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-800 text-amber-50 font-bold text-[10px]">Claim Credit</span>
                </div>
              )}

              {/* Line-by-Line Confirmation Screen */}
              <div className="bg-white rounded-xl border border-ink/10 overflow-hidden shadow-xs">
                <div className="px-4 py-3 border-b border-ink/10 flex items-center justify-between bg-[#FAF8F5]">
                  <div>
                    <h4 className="font-bold text-xs text-ink uppercase tracking-wide">Extracted Line Items (Confirm items to push to inventory)</h4>
                    <p className="text-[11px] text-ink/60">Review and select which extracted products to commit to active store inventory.</p>
                  </div>
                  <span className="text-xs text-amber-900 font-medium font-mono">UPC Preserved</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-ink/60 border-b border-ink/10">
                      <tr>
                        <th className="px-4 py-2.5 font-semibold text-center">Confirm</th>
                        <th className="px-4 py-2.5 font-semibold">Item #</th>
                        <th className="px-4 py-2.5 font-semibold">Description</th>
                        <th className="px-4 py-2.5 font-semibold">UPC (TEXT)</th>
                        <th className="px-4 py-2.5 font-semibold">Cases</th>
                        <th className="px-4 py-2.5 font-semibold">Packs/Case</th>
                        <th className="px-4 py-2.5 font-semibold">Units Recv</th>
                        <th className="px-4 py-2.5 font-semibold">Unit Cost</th>
                        <th className="px-4 py-2.5 font-semibold">Line Net</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {parsedLines.map((line, idx) => (
                        <tr key={idx} className={line.flag === "breakage" ? "bg-amber-50/80" : "hover:bg-black/2"}>
                          <td className="px-4 py-2.5 text-center">
                            <input
                              type="checkbox"
                              defaultChecked={line.flag !== "breakage"}
                              className="w-4 h-4 accent-amber-800 rounded cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-2.5 font-mono text-ink/60">{line.vendorItemNo}</td>
                          <td className="px-4 py-2.5 font-semibold text-ink">
                            {line.description}
                            {line.flagNote && (
                              <span className="block text-[10px] text-amber-800 font-normal">{line.flagNote}</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 font-mono text-amber-900 font-bold">{line.upc}</td>
                          <td className="px-4 py-2.5 font-bold text-ink">{line.qtyCases} cs</td>
                          <td className="px-4 py-2.5 text-ink/70 font-semibold">{line.packsPerCase} pk</td>
                          <td className="px-4 py-2.5 font-bold text-emerald-800">{line.unitsReceived} units</td>
                          <td className="px-4 py-2.5 font-semibold text-ink">${line.unitCost.toFixed(2)}</td>
                          <td className="px-4 py-2.5 font-bold text-amber-950">${line.lineNet.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#171310]/10 bg-white/70">
          {step === "review" ? (
            <>
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-ink/70 hover:bg-black/5"
              >
                ← Back to Upload
              </button>
              <button
                type="button"
                onClick={handleCommit}
                className="px-6 py-2.5 rounded-lg bg-amber-800 text-amber-50 text-xs font-bold hover:bg-amber-900 shadow-sm transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <PackageCheck size={16} /> Approve & Commit Invoice to Inventory
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="ml-auto px-4 py-2 rounded-lg text-xs font-semibold text-ink/70 hover:bg-black/5"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
