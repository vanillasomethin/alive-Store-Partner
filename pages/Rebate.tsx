import React, { useState, useRef } from 'react';
import { UploadCloud, Check, AlertCircle, Loader2, FileText, Calendar, DollarSign } from 'lucide-react';
import { analyzeElectricityBill, BillAnalysisResult } from '../services/geminiService';

export const Rebate: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<BillAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await analyzeElectricityBill(file);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to analyze the bill. Please ensure the image is clear and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitClaim = () => {
    alert("Claim submitted successfully! Credits will be applied within 24 hours.");
    setFile(null);
    setPreview(null);
    setAnalysis(null);
  };

  return (
    <div className="pb-20 md:pb-0 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Electricity Rebate</h2>
      <p className="text-zinc-400 mb-8">Upload your monthly electricity bill to claim your power subsidy for running ALIVE screens.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden
              ${preview ? 'border-red-500 bg-zinc-900' : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-900'}`}
            onClick={() => fileInputRef.current?.click()}
          >
             {preview ? (
               <img src={preview} alt="Bill" className="w-full h-full object-contain opacity-50" />
             ) : (
                <>
                    <div className="p-4 bg-zinc-800 rounded-full mb-3">
                        <UploadCloud className="text-zinc-400" size={32} />
                    </div>
                    <p className="text-zinc-300 font-medium">Click to upload bill</p>
                    <p className="text-xs text-zinc-500 mt-1">JPG, PNG supported</p>
                </>
             )}
             
             {/* Hidden Input */}
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*"
               onChange={handleFileChange} 
             />

             {preview && (
                 <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-1 rounded-full">
                     Click to change
                 </div>
             )}
          </div>

          <button 
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors
              ${!file ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-white text-black hover:bg-zinc-200'}`}
          >
            {isAnalyzing ? <Loader2 className="animate-spin" /> : <FileText size={18} />}
            {isAnalyzing ? 'Analyzing with AI...' : 'Scan & Verify Bill'}
          </button>

          {error && (
            <div className="bg-red-900/20 border border-red-900 p-3 rounded-lg flex items-center gap-3 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
            </div>
          )}
        </div>

        {/* Results & Form Section */}
        <div className={`space-y-4 transition-opacity duration-500 ${analysis ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
           <h3 className="text-lg font-semibold text-white">Claim Details</h3>
           
           <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
              <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1 block">Provider Name</label>
                  <div className="flex items-center gap-2 text-white font-medium">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      {analysis?.providerName || '---'}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1 block flex items-center gap-1"><DollarSign size={12}/> Total Amount</label>
                    <input 
                        type="text" 
                        readOnly 
                        value={analysis?.totalAmount ? `₹${analysis.totalAmount}` : ''}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                </div>
                <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1 block flex items-center gap-1"><Calendar size={12}/> Due Date</label>
                    <input 
                        type="text" 
                        readOnly 
                        value={analysis?.dueDate || ''}
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                </div>
              </div>
              
              <div className="pt-2">
                  <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Rebate Eligible (15%)</span>
                      <span className="text-green-500 font-bold">₹{analysis ? (analysis.totalAmount * 0.15).toFixed(0) : '0'}</span>
                  </div>
              </div>
           </div>

           <button 
             onClick={handleSubmitClaim}
             className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-900/20 transition-all active:scale-95"
           >
             Submit Claim
           </button>
        </div>
      </div>
    </div>
  );
};