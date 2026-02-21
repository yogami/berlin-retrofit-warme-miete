import React, { useState } from "react";
import { FileText, X, Download, ShieldCheck } from "lucide-react";

interface DealCloserModalProps {
  simulation: any;
  onClose: () => void;
  prefillAddress?: string;
}

export const DealCloserModal: React.FC<DealCloserModalProps> = ({
  simulation,
  onClose,
  prefillAddress,
}) => {
  const [formData, setFormData] = useState({
    buildingAddress: prefillAddress || "",
    landlordName: "",
    tenantName: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!simulation) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/reports/contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simulationId: simulation.id,
          ephemeralResults: simulation.results,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate contract");

      // Trigger the PDF download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GreenLease_${simulation.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose(); // Close modal on success
    } catch (error) {
      console.error("Download error:", error);
      alert(
        "Failed to generate the Green Lease. Please ensure all fields are filled.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1C1C1E] border border-green-500/20 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <FileText className="text-green-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Generate Green Lease
            </h2>
            <p className="text-sm text-gray-400">
              ZIA 2.0 / BGB § 559 Compliant
            </p>
          </div>
        </div>

        <div className="bg-[#2C2C2E] rounded-lg p-4 mb-6 border border-white/5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Tenant Net Savings:</span>
            <span className="text-green-400 font-bold">
              €{simulation.results?.tenantNetSavings?.toFixed(0) || 0}/yr
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Landlord Target ROI:</span>
            <span className="text-blue-400 font-bold">
              {simulation.results?.roiYears?.toFixed(1) || 0} yrs
            </span>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Building Address
            </label>
            <input
              required
              minLength={5}
              type="text"
              className="w-full bg-[#1C1C1E] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-green-500/50"
              placeholder="e.g. Karl-Marx-Allee 34, 10178 Berlin"
              value={formData.buildingAddress}
              onChange={(e) =>
                setFormData({ ...formData, buildingAddress: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Landlord Name
              </label>
              <input
                required
                minLength={2}
                type="text"
                className="w-full bg-[#1C1C1E] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-green-500/50"
                placeholder="Vonovia SE"
                value={formData.landlordName}
                onChange={(e) =>
                  setFormData({ ...formData, landlordName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Tenant Name
              </label>
              <input
                required
                minLength={2}
                type="text"
                className="w-full bg-[#1C1C1E] border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-green-500/50"
                placeholder="Max Mustermann"
                value={formData.tenantName}
                onChange={(e) =>
                  setFormData({ ...formData, tenantName: e.target.value })
                }
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <span>Generating Contract...</span>
              ) : (
                <>
                  <Download size={20} />
                  <span>Download Legal Addendum</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mt-4">
            <ShieldCheck size={14} className="text-blue-400" />
            <span>
              Zero-Trust: PII is processed edge-to-PDF and never stored.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
