import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentPreview from './components/DocumentPreview';
import Analytics from './components/Analytics';
import Settings from './components/Settings';
import SimulationMode from './components/SimulationMode';
import ChatAssistant from './components/ChatAssistant'; 
import IntelligenceGraph from './components/IntelligenceGraph';
import CeisaWizard from './components/CeisaWizard';
import { orchestrateProjectAnalysis } from './services/aiService'; 
import { updateProjectDataWithCalculations } from './services/calculationEngine';
import { ProjectData, UserSettings } from './types';
import { UploadCloud, PlayCircle, Loader2, FileText, FileSpreadsheet, File, CheckCircle2, ShieldCheck, Sparkles, Layout } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Standardized worker source for PDF.js to avoid MIME type or CORS errors
const PDFJS_VERSION = '5.4.624';
if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Initializing System...");
  const [themeInput, setThemeInput] = useState('Sistem Patroli Laut Terpadu');
  const [uploadedFileContent, setUploadedFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  
  // Enterprise Persistence Layer
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('govt_sys_settings');
      return saved ? JSON.parse(saved) : {
        darkMode: false,
        aiCreativity: 50,
        riskTolerance: 'Balanced',
        autoSave: true,
        density: 'Comfortable'
      };
    } catch(e) {
      return { darkMode: false, aiCreativity: 50, riskTolerance: 'Balanced', autoSave: true, density: 'Comfortable' };
    }
  });

  useEffect(() => {
    if (settings.darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [settings.darkMode]);

  const updateSettings = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerateAnalysis = async () => {
    if (!themeInput.trim() && !uploadedFileContent) {
        alert("Provide a Project Directive or Document.");
        return;
    }

    setLoading(true);
    setLoadingText("Accessing Core Intelligence...");
    try {
      const input = uploadedFileContent || themeInput;
      const rawData = await orchestrateProjectAnalysis(input, settings, !!uploadedFileContent, (msg) => {
          setLoadingText(msg);
      });
      
      setLoadingText("Synthesizing Institutional Data...");
      const calculatedData = updateProjectDataWithCalculations(rawData);
      setProjectData(calculatedData);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("System Error:", error);
      alert("Analysis failed. Check your API configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if(confirm("Start new session? Current analysis will be archived.")) {
        setProjectData(null);
        setActiveTab('dashboard');
        setThemeInput('');
        setUploadedFileContent(null);
        setFileName(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const extension = file.name.split('.').pop()?.toLowerCase();
    setFileType(extension || 'unknown');
    setLoading(true);
    setLoadingText("Scrubbing Document Data...");

    try {
        let content = "";
        if (extension === 'txt') content = await file.text();
        else if (extension === 'pdf') {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                content += textContent.items.map((item: any) => item.str).join(' ') + "\n";
            }
        } else if (extension === 'docx') {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            content = result.value;
        } else if (extension === 'xlsx') {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            content = XLSX.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
        }

        if (!content.trim()) throw new Error("Document unreadable.");
        setUploadedFileContent(content);
        setThemeInput(`Directives from: ${file.name}`);
    } catch (err: any) {
        alert(`Ingestion Error: ${err.message}`);
        setUploadedFileContent(null);
    } finally {
        setLoading(false);
    }
  };

  // Content Switcher for Unified Experience
  const renderContent = () => {
      if (!projectData) return null;

      switch(activeTab) {
          case 'dashboard': return <Dashboard data={projectData} />;
          case 'chat': return <ChatAssistant data={projectData} />;
          case 'intelligence': return (
              <div className="h-[calc(100vh-200px)] animate-fade-in">
                  <IntelligenceGraph nodes={projectData.intelligenceGraph?.nodes || []} edges={projectData.intelligenceGraph?.edges || []} />
              </div>
          );
          case 'simulation': return <SimulationMode data={projectData} onUpdateData={setProjectData} />;
          
          // Official Document Wizard Tabs
          case 'kajian': 
          case 'research':
          case 'brd': 
          case 'fsd': 
          case 'charter': 
              return <CeisaWizard data={projectData} onUpdate={setProjectData} defaultTab={activeTab.toUpperCase() as any} />;
          
          case 'admin': return <Settings settings={settings} updateSettings={updateSettings} />;
          default: return <Dashboard data={projectData} />;
      }
  };

  if (!projectData) {
    return (
      <div className={`min-h-screen flex flex-col transition-colors duration-500 font-sans ${settings.darkMode ? 'bg-slate-950 text-white' : 'bg-govt-bg text-govt-text'}`}>
        <header className="bg-govt-blue py-6 px-10 flex items-center justify-between shadow-2xl border-b border-blue-900 sticky top-0 z-50">
             <div className="flex items-center gap-5">
                 <div className="w-12 h-12 bg-govt-gold rounded-xl flex items-center justify-center font-bold text-govt-blue shadow-lg ring-2 ring-white/10 transform -rotate-3">
                    <ShieldCheck className="w-7 h-7"/>
                 </div>
                 <div>
                     <h1 className="text-white font-black tracking-tighter text-xl uppercase leading-none">CEISIA 4.0 <span className="text-govt-gold font-light tracking-widest block text-[10px] mt-1">X AGDIP X AI Agents</span></h1>
                     <p className="text-blue-300 text-[8px] tracking-[0.2em] uppercase font-bold opacity-80 mt-1">Autonomous GovDoc Platform</p>
                 </div>
             </div>
             <div className="text-right hidden md:block group cursor-help">
                 <div className="text-white text-xs font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full border border-white/10">Internal Tier-S Authorization</div>
                 <div className="text-blue-300 text-[10px] mt-1 font-mono uppercase">Node: AGDIP-JKT-V4.0</div>
             </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-10 bg-[radial-gradient(circle_at_50%_50%,rgba(31,78,121,0.05),transparent)]">
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-10 animate-slide-up">
              <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-govt-gold/10 border border-govt-gold/20 text-govt-gold text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
                      <Sparkles className="w-3 h-3"/> New Agent Engine V4.0
                  </div>
                  <h2 className={`text-5xl font-black leading-tight mb-6 tracking-tighter ${settings.darkMode ? 'text-white' : 'text-govt-darkBlue'}`}>
                    Direct-to-Compliance <br/><span className="text-govt-gold">Intelligence</span>
                  </h2>
                  <p className={`text-lg leading-relaxed font-medium opacity-80 ${settings.darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Instantly transform project directives into audit-ready government documents. Powered by strict UCP governance and multimodal AI.
                  </p>
              </div>
              
              <div className={`p-10 rounded-3xl shadow-2xl border ${settings.darkMode ? 'bg-slate-900/50 border-slate-700 backdrop-blur-xl' : 'bg-white border-govt-border'}`}>
                <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${settings.darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Directives & Context</label>
                <div className="relative mb-8">
                    <input 
                        type="text" 
                        value={themeInput}
                        disabled={!!uploadedFileContent}
                        onChange={(e) => setThemeInput(e.target.value)}
                        className={`w-full p-5 border-2 rounded-2xl font-bold text-lg focus:ring-4 focus:ring-govt-blue/20 outline-none transition-all ${settings.darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-600 disabled:opacity-50' : 'border-slate-200 bg-slate-50 text-slate-900 disabled:opacity-50'}`}
                        placeholder="Define scope or mission..."
                    />
                    {!uploadedFileContent && <Layout className="absolute right-5 top-5 text-slate-400 w-6 h-6"/>}
                </div>
                
                {uploadedFileContent && (
                    <div className="mb-8 p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-5 text-emerald-400 animate-in zoom-in-95 duration-300">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                            {fileType?.includes('xls') ? <FileSpreadsheet className="w-7 h-7"/> : fileType === 'pdf' ? <FileText className="w-7 h-7" /> : <File className="w-7 h-7" />}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <span className="font-black block text-[10px] uppercase tracking-widest text-emerald-500/60 mb-1">{fileType} Trace Detected</span>
                            <span className="truncate block font-bold text-sm">{fileName}</span>
                        </div>
                        <button onClick={() => { setUploadedFileContent(null); setThemeInput(''); setFileName(null); }} className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl text-xs font-black uppercase border border-emerald-500/30 transition-all">Clear</button>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-5">
                    <button 
                        onClick={handleGenerateAnalysis}
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-3 bg-govt-blue text-white py-5 rounded-2xl font-black hover:bg-govt-darkBlue transition-all disabled:opacity-50 shadow-xl shadow-blue-900/40 text-sm uppercase tracking-widest active:scale-95"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 text-govt-gold" />}
                        {loading ? "Processing..." : "Initiate Synthesis"}
                    </button>
                    
                    <label className={`flex items-center justify-center gap-3 border-2 border-dashed py-5 px-6 rounded-2xl font-black transition-all cursor-pointer text-sm uppercase tracking-widest ${settings.darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50 hover:border-govt-blue hover:text-govt-blue'}`}>
                        <UploadCloud className="w-5 h-5" />
                        Ingest File
                        <input type="file" accept=".txt,.pdf,.docx,.xlsx" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
              </div>
            </div>

            <div className="hidden md:block relative animate-in fade-in slide-in-from-right-10 duration-1000">
                 <div className="absolute -top-10 -right-10 w-80 h-80 bg-govt-gold rounded-full filter blur-[128px] opacity-10"></div>
                 <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-govt-blue rounded-full filter blur-[128px] opacity-10"></div>
                 <div className="relative bg-slate-900 rounded-[3rem] p-3 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 transform hover:scale-[1.02] transition-transform duration-700">
                    <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" alt="Gov Intelligence" className="rounded-[2.5rem] opacity-60 grayscale hover:grayscale-0 transition-all duration-1000 h-[500px] object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-govt-darkBlue/90 via-govt-darkBlue/40 to-transparent rounded-[2.5rem] flex items-end p-12">
                        <div className="space-y-4">
                            <div className="w-12 h-1.5 bg-govt-gold rounded-full"></div>
                            <h3 className="text-white font-black text-3xl tracking-tighter">Unified Oversight</h3>
                            <p className="text-blue-100/70 text-sm font-medium leading-relaxed">Multimodal agent workspace for elite government planning and resource governance.</p>
                        </div>
                    </div>
                 </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen font-sans transition-colors duration-500 ${settings.darkMode ? 'bg-slate-950 text-white' : 'bg-govt-bg text-govt-text'}`}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onReset={handleReset} />
      
      <main className="flex-1 ml-64 p-10 overflow-y-auto h-screen relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-fixed">
        <header className="flex justify-between items-start mb-12 pb-8 border-b border-slate-200 dark:border-slate-800/50">
            <div className="animate-slide-up">
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-govt-gold/10 text-govt-gold text-[9px] font-black uppercase rounded-full tracking-[0.2em] border border-govt-gold/20">CEISIA 4.0 X AGDIP Node</span>
                    {saveStatus === 'saving' && <span className="text-[10px] text-blue-500 font-black animate-pulse flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin"/> AUTO-SAVE ACTIVE</span>}
                    {saveStatus === 'saved' && <span className="text-[10px] text-emerald-500 font-black flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> CORE INTEGRITY VERIFIED</span>}
                </div>
                <h1 className={`text-4xl font-black tracking-tighter ${settings.darkMode ? 'text-white' : 'text-govt-darkBlue'}`}>
                    {activeTab === 'dashboard' ? 'Strategic Oversight' : 
                     activeTab === 'chat' ? 'AGDIP AI Consultant' :
                     activeTab === 'intelligence' ? 'Intelligence Relationship Graph' :
                     activeTab === 'simulation' ? 'Predictive Market Simulation' :
                     activeTab === 'kajian' ? 'Kajian Kebutuhan & TOR' :
                     activeTab === 'research' ? 'Dokumen Penelitian' :
                     activeTab === 'charter' ? 'Project Charter' :
                     activeTab === 'brd' ? 'Business Requirements (BRD)' :
                     activeTab === 'fsd' ? 'Functional Specifications (FSD)' :
                     'System Configuration'}
                </h1>
                <p className={`text-sm mt-2 font-bold opacity-60 tracking-tight flex items-center gap-2 ${settings.darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    Project Trace: {projectData.meta.theme} • ID: {projectData.meta.pic_contact.substring(0, 8)}
                </p>
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Timestamp</span>
                    <span className="text-xs font-mono font-bold">{new Date().toLocaleString('id-ID')}</span>
                 </div>
                 <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
                 <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl">
                    <ShieldCheck className="w-6 h-6 text-govt-gold animate-pulse-slow"/>
                 </div>
            </div>
        </header>

        <div className="animate-fade-in">
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;