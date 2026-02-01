'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { Download, Shield, CheckCircle2, X, AlertTriangle, ArrowLeft, Edit2 } from 'lucide-react';
import Link from 'next/link';

// --- Sub-Component: The Graphic Card ---
const GraphicCard = ({ formData, selectedTemplate, templates, isFixedSize = false }) => {
  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];
  const isFalse = formData.status?.toLowerCase() === 'false' || formData.status?.toLowerCase() === 'fake';

  const sizeClasses = isFixedSize 
    ? { container: 'w-[1080px] h-[1080px]', padding: 'p-[80px]', title: 'text-7xl', body: 'text-4xl', footer: 'text-3xl' }
    : { container: 'w-full aspect-square', padding: 'p-6', title: 'text-xl', body: 'text-sm', footer: 'text-xs' };

  return (
    <div className={`relative overflow-hidden flex flex-col ${sizeClasses.container} bg-gradient-to-br ${currentTemplate.gradient} ${sizeClasses.padding}`}>
      <div className="relative z-10 h-full flex flex-col justify-between text-white font-sans">
        <div>
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-blue-600 fill-blue-600" />
              </div>
              <span className={`font-black tracking-tighter ${isFixedSize ? 'text-5xl' : 'text-2xl'} ${currentTemplate.text}`}>GNG NEWS</span>
            </div>
            <div className={`${isFalse ? 'bg-red-500' : 'bg-emerald-500'} px-6 py-2 rounded-full border border-white/20 shadow-xl`}>
               <span className="font-black uppercase tracking-widest text-[10px]">Official Fact Check</span>
            </div>
          </div>
          
          <h2 className={`font-black leading-[1.15] mb-8 ${sizeClasses.title} ${currentTemplate.text}`}>
            "{formData.claim}"
          </h2>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/20 shadow-2xl relative">
          <div className="absolute -top-4 left-8 bg-white text-slate-900 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">The Verdict</div>
          <p className={`font-bold leading-relaxed ${sizeClasses.body} ${currentTemplate.text}`}>{formData.verdict}</p>
        </div>

        <div className="flex justify-between items-end border-t border-white/20 pt-8 mt-6">
          <div>
            <p className={`font-black opacity-60 uppercase tracking-widest mb-1 ${isFixedSize ? 'text-2xl' : 'text-[10px]'} ${currentTemplate.text}`}>Verified Source</p>
            <p className={`font-black ${isFixedSize ? 'text-4xl' : 'text-sm'} ${currentTemplate.text}`}>{formData.source}</p>
          </div>
          <div className="text-right">
              <p className={`font-black opacity-60 uppercase tracking-widest mb-1 ${isFixedSize ? 'text-2xl' : 'text-[10px]'} ${currentTemplate.text}`}>Status</p>
              <div className="flex items-center gap-2">
                  {isFalse ? <X className="text-red-400" /> : <CheckCircle2 className="text-emerald-400" />}
                  <span className="font-black text-xl uppercase">{isFalse ? 'FAKE' : 'TRUE'}</span>
              </div>
          </div>
        </div>
      </div>
      
      <div className="absolute -right-20 -bottom-20 opacity-10 pointer-events-none">
         {isFalse ? <AlertTriangle className="w-[500px] h-[500px]" /> : <CheckCircle2 className="w-[500px] h-[500px]" />}
      </div>
    </div>
  );
};

function GenerateContent() {
  const searchParams = useSearchParams();
  const urlId = searchParams.get('id');
  const generateRef = useRef(null);
  
  const [formData, setFormData] = useState({ claim: 'Loading...', status: 'false', verdict: '...', source: 'GNG' });
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    { id: 'modern', name: 'GNG Dark', gradient: 'from-slate-900 to-black', text: 'text-white' },
    { id: 'classic', name: 'Alert Red', gradient: 'from-red-600 to-red-800', text: 'text-white' },
    { id: 'blue', name: 'Info Blue', gradient: 'from-blue-700 to-indigo-900', text: 'text-white' },
  ];

  useEffect(() => {
    if (!urlId) return;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('debunks')
        .select('*')
        .eq('id', urlId)
        .single();

      if (data && !error) {
        setFormData({
          claim: data.title,
          status: data.verdict, 
          verdict: data.summary,
          source: data.source || 'GNG'
        });
      } else {
        toast.error("Could not find news data");
      }
    };
    fetchData();
  }, [urlId]);

  const downloadImage = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    const tid = toast.loading('Generating GNG Graphic...');
    
    try {
      const canvas = await html2canvas(generateRef.current, { 
        scale: 3, 
        useCORS: true, 
        logging: false,
        backgroundColor: null 
      });
      
      const link = document.createElement('a');
      link.download = `GNG-Graphic-${urlId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Ready to Share!', { id: tid });
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate image', { id: tid });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 font-bold transition-colors">
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* HIDDEN GENERATOR */}
        <div className="fixed top-0 left-0 pointer-events-none opacity-0 z-[-1000]">
          <div ref={generateRef}>
            <GraphicCard formData={formData} selectedTemplate={selectedTemplate} templates={templates} isFixedSize={true} />
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               GNG Graphic Studio
            </h2>
            <p className="text-slate-500 font-medium">Edit and style the official GNG debunk card.</p>
          </div>

          {/* EDIT OPTION SECTION */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                <Edit2 size={14} /> 1. Edit Content
             </h3>
             <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">The Claim</label>
                  <textarea 
                    className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold text-black" 
                    value={formData.claim} 
                    onChange={(e) => setFormData({...formData, claim: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase">The Verdict (Body)</label>
                  <textarea 
                    className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-medium text-black" 
                    rows={3}
                    value={formData.verdict} 
                    onChange={(e) => setFormData({...formData, verdict: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Source</label>
                    <input 
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold text-black" 
                      value={formData.source} 
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase">Status</label>
                    <select 
                      className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold text-black"
                      value={formData.status?.toLowerCase().includes('fake') ? 'false' : 'true'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="false">FAKE / FALSE</option>
                      <option value="true">TRUE / VERIFIED</option>
                    </select>
                  </div>
                </div>
             </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">2. Select Card Style</h3>
            <div className="grid grid-cols-3 gap-3">
              {templates.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`p-4 rounded-2xl border-2 transition-all text-center ${selectedTemplate === t.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-100 bg-white text-slate-400'}`}
                >
                  <span className="text-[10px] font-black uppercase">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={downloadImage}
            disabled={isGenerating}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? 'Processing...' : 'Download GNG Graphic'}
          </button>
        </div>

        {/* PREVIEW */}
        <div className="sticky top-8">
           <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-black text-slate-400 mb-4 tracking-widest text-center">Live Preview</p>
              <div className="rounded-2xl overflow-hidden shadow-inner bg-slate-50">
                <GraphicCard formData={formData} selectedTemplate={selectedTemplate} templates={templates} isFixedSize={false} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminGeneratePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <Suspense fallback={<div className="flex items-center justify-center h-screen font-black text-slate-300 animate-pulse">LOADING GNG GENERATOR...</div>}>
        <GenerateContent />
      </Suspense>
    </div>
  );
}