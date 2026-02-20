import React, { useState, useEffect } from 'react';
import { ProjectDocuments, ProjectData, WorkspaceDocument, WorkspaceSection, WorkspaceBlock, DocTable } from '../types';
import { createStrictDocx } from '../services/docxGenService';
import { runEngineOnDocument, calculateMetrics } from '../services/calculationEngine';
import { FileDown, ArrowLeft, Plus, Trash2, GripVertical, Lock, Unlock, ChevronDown, ChevronRight, Layout, Files, AlertTriangle, ShieldCheck } from 'lucide-react';
import FileSaver from 'file-saver';
import SmartTable from './SmartTable';
import { formatIDR } from '../utils/currency';
import CeisaWizard from './CeisaWizard'; 

interface DocumentWorkspaceProps {
  docs: ProjectDocuments;
  title: string;
  fullData?: ProjectData;
  onUpdate?: (data: ProjectData) => void;
  onBack?: () => void;
}

// --- MOCK WORKSPACE GENERATOR (Fallback) ---
const generateWorkspaceFromLegacy = (legacyDocs: ProjectDocuments, fullData: ProjectData): WorkspaceDocument[] => {
    // 1. RESEARCH & ESTIMATION DOC
    const researchDoc: WorkspaceDocument = {
        id: 'doc-research',
        type: 'RESEARCH',
        title: 'Kajian Kebutuhan & Estimasi Biaya',
        status: 'DRAFT',
        version: '1.0',
        sections: [
            {
                id: 'sec-exec',
                title: '1. Executive Summary',
                order: 0,
                lastModified: new Date().toISOString(),
                blocks: [
                    { id: 'b1', type: 'TEXT', content: fullData.strategicAnalysis.executiveSummary || "Deskripsi proyek..." },
                ]
            }
        ]
    };

    return [researchDoc];
};

const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({ docs, title, fullData, onUpdate, onBack }) => {
  const [workspaces, setWorkspaces] = useState<WorkspaceDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>('CEISA_WIZARD'); 
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Derived Metrics State
  const [metrics, setMetrics] = useState({ uaw: 0, uucw: 0, uucp: 0, ucp: 0, mm: 0, totalCost: 0, isValid: false });

  // Init Workspace Data
  useEffect(() => {
      if (fullData && (!fullData.documents.workspaces || Object.keys(fullData.documents.workspaces).length === 0)) {
          const generated = generateWorkspaceFromLegacy(docs, fullData);
          setWorkspaces(generated);
      } else if (fullData?.documents.workspaces) {
          const wsList = Object.values(fullData.documents.workspaces) as WorkspaceDocument[];
          setWorkspaces(wsList);
      }
  }, [fullData]);

  const activeDoc = workspaces.find(w => w.id === activeDocId);

  const handleUpdateBlock = (sectionId: string, blockId: string, newContent: any) => {
      if (!activeDoc) return;
      const currentSections = Array.isArray(activeDoc.sections) ? activeDoc.sections : [];

      const newSections = currentSections.map((sec: WorkspaceSection) => {
          if (sec.id === sectionId) {
              return {
                  ...sec,
                  blocks: Array.isArray(sec.blocks) ? sec.blocks.map((b: WorkspaceBlock) => b.id === blockId ? { ...b, content: newContent } : b) : []
              };
          }
          return sec;
      });

      let newDoc = { ...activeDoc, sections: newSections };
      
      if (newDoc.type === 'RESEARCH' || newDoc.type === 'KAJIAN') {
          newDoc = runEngineOnDocument(newDoc);
      }

      updateWorkspaceState(newDoc);
  };

  const updateWorkspaceState = (newDoc: WorkspaceDocument) => {
      const newWorkspaces = workspaces.map(w => w.id === newDoc.id ? newDoc : w);
      setWorkspaces(newWorkspaces);
      if (onUpdate && fullData) {
          onUpdate({
              ...fullData,
              documents: {
                  ...fullData.documents,
                  workspaces: newWorkspaces.reduce((acc: Record<string, WorkspaceDocument>, w: WorkspaceDocument) => ({...acc, [w.id]: w}), {} as Record<string, WorkspaceDocument>)
              }
          });
      }
  };

  const handleAddSection = () => {
      if (!activeDoc) return;
      const newSection: WorkspaceSection = {
          id: `sec-${Date.now()}`,
          title: 'New Section',
          order: activeDoc.sections?.length || 0,
          lastModified: new Date().toISOString(),
          blocks: [{ id: `b-${Date.now()}`, type: 'TEXT', content: 'Start typing...' }]
      };
      const currentSections = Array.isArray(activeDoc.sections) ? activeDoc.sections : [];
      updateWorkspaceState({ ...activeDoc, sections: [...currentSections, newSection] });
      setActiveSectionId(newSection.id);
  };

  const handleDeleteSection = (secId: string) => {
      if (!activeDoc) return;
      if (!confirm('Are you sure you want to delete this section?')) return;
      const currentSections = Array.isArray(activeDoc.sections) ? activeDoc.sections : [];
      updateWorkspaceState({ ...activeDoc, sections: currentSections.filter(s => s.id !== secId) });
  };

  const exportToDocx = async () => {
      if (!fullData) return;
      // @ts-ignore
      const blob = await createStrictDocx(fullData, activeDoc?.type || 'TOR');
      FileSaver.saveAs(blob, `CEISA_4_0_${title}.docx`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#151521] overflow-hidden animate-fade-in relative">
      
      {/* 1. TOP BAR */}
      <div className="h-16 bg-white dark:bg-[#1E1E2D] border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-6 z-20 shadow-sm">
         <div className="flex items-center gap-4">
             {onBack && (
                <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500">
                    <ArrowLeft className="w-5 h-5"/>
                </button>
             )}
             <div>
                 <h1 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm md:text-base">
                     <Layout className="w-4 h-4 text-govt-blue"/> {activeDocId === 'CEISA_WIZARD' ? "CEISA 4.0 Standard Workflow" : activeDoc?.title || "Project Documents"}
                 </h1>
                 {activeDoc && (
                     <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                         <span className={`px-1.5 rounded ${activeDoc.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{activeDoc.status}</span>
                         <span>v{activeDoc.version}</span>
                     </div>
                 )}
                 {activeDocId === 'CEISA_WIZARD' && (
                     <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Integrated GovDoc Suite</span>
                 )}
             </div>
         </div>

         <div className="flex items-center gap-3">
             <button onClick={exportToDocx} className="flex items-center gap-2 px-3 py-1.5 bg-govt-blue hover:bg-govt-darkBlue text-white rounded-md text-xs font-bold shadow-md transition-all">
                <FileDown className="w-3 h-3"/> Export Full Package
             </button>
         </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
          
          {/* 2. SIDEBAR NAVIGATION */}
          <div className={`w-64 bg-white dark:bg-[#1E1E2D] border-r border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64 absolute h-full z-10'}`}>
              
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                   <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-2"><Files className="w-3 h-3"/> Project Tools</h3>
                   <div className="space-y-1">
                       <button
                            onClick={() => setActiveDocId('CEISA_WIZARD')}
                            className={`w-full text-left px-3 py-2 rounded-md text-xs font-bold transition-all border ${activeDocId === 'CEISA_WIZARD' ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800' : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                       >
                           <div className="flex items-center gap-2">
                              <ShieldCheck className="w-3 h-3 text-govt-blue"/>
                              <span>CEISA Smart Wizard</span>
                           </div>
                       </button>
                       {workspaces.map(doc => (
                           <button
                                key={doc.id}
                                onClick={() => { setActiveDocId(doc.id); setActiveSectionId(null); }}
                                className={`w-full text-left px-3 py-2 rounded-md text-xs font-bold transition-all border ${activeDocId === doc.id ? 'bg-white shadow-sm border-blue-200 text-blue-700 dark:bg-slate-800 dark:border-slate-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                           >
                               <div className="flex items-center justify-between">
                                  <span className="truncate">{doc.title}</span>
                                  {doc.type === 'KAJIAN' && <span className="text-[9px] px-1 bg-blue-100 text-blue-700 rounded">CORE</span>}
                               </div>
                           </button>
                       ))}
                   </div>
              </div>

              {activeDocId !== 'CEISA_WIZARD' && (
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex-1 overflow-y-auto">
                      <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Structure</h3>
                      <div className="space-y-1">
                          {Array.isArray(activeDoc?.sections) && activeDoc.sections.map(sec => (
                              <button 
                                key={sec.id}
                                onClick={() => {
                                    setActiveSectionId(sec.id);
                                    document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2 truncate ${activeSectionId === sec.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'text-slate-500 hover:text-slate-700'}`}
                              >
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></span>
                                  <span className="truncate">{sec.title}</span>
                              </button>
                          ))}
                          <button onClick={handleAddSection} className="w-full mt-2 py-2 border border-dashed border-slate-300 rounded-md text-xs text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-1">
                              <Plus className="w-3 h-3"/> New Section
                          </button>
                      </div>
                  </div>
              )}
          </div>

          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`absolute top-20 z-10 p-1 bg-white border border-slate-200 rounded-r-md shadow-sm text-slate-500 hover:text-blue-600 transition-transform duration-300 ${sidebarOpen ? 'left-64' : 'left-0'}`}
          >
              {sidebarOpen ? <ChevronDown className="w-4 h-4 rotate-90"/> : <ChevronRight className="w-4 h-4"/>}
          </button>

          <div className="flex-1 overflow-y-auto bg-white dark:bg-[#151521]">
              {activeDocId === 'CEISA_WIZARD' ? (
                  fullData ? <CeisaWizard data={fullData} onUpdate={(d) => onUpdate && onUpdate(d)} /> : <div className="p-8 text-center text-slate-500">Loading Intelligence...</div>
              ) : (
                  <div className="p-8 lg:px-16 scroll-smooth">
                      <div className="max-w-4xl mx-auto space-y-12 pb-20">
                          {Array.isArray(activeDoc?.sections) && activeDoc.sections.map((sec, index) => (
                              <div key={sec.id} id={sec.id} className="group relative transition-all duration-300">
                                  <div className="flex items-center gap-2 mb-4 group/header">
                                      <div className="cursor-move text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <GripVertical className="w-4 h-4"/>
                                      </div>
                                      <input 
                                        className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 text-slate-800 dark:text-white placeholder-slate-300 w-full"
                                        value={sec.title}
                                        onChange={(e) => {
                                            if (!activeDoc.sections) return;
                                            const newSec = { ...sec, title: e.target.value };
                                            const newDoc = { ...activeDoc, sections: activeDoc.sections.map(s => s.id === sec.id ? newSec : s) };
                                            updateWorkspaceState(newDoc);
                                        }}
                                      />
                                      <div className="opacity-0 group-hover/header:opacity-100 flex items-center gap-1 transition-opacity">
                                          <button onClick={() => handleDeleteSection(sec.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                                              <Trash2 className="w-4 h-4"/>
                                          </button>
                                      </div>
                                  </div>

                                  <div className="space-y-4 pl-6 border-l-2 border-slate-100 dark:border-slate-800 group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-colors">
                                      {Array.isArray(sec.blocks) && sec.blocks.map(block => (
                                          <div key={block.id} className="relative">
                                              {block.type === 'TEXT' && (
                                                  <textarea 
                                                    className="w-full bg-transparent border-none resize-none focus:ring-0 p-0 text-slate-600 dark:text-slate-300 leading-relaxed text-sm min-h-[100px]"
                                                    value={block.content as string}
                                                    onChange={(e) => handleUpdateBlock(sec.id, block.id, e.target.value)}
                                                  />
                                              )}
                                              {block.type === 'TABLE' && (
                                                  <SmartTable 
                                                    data={block.content as DocTable} 
                                                    onUpdate={(newData) => handleUpdateBlock(sec.id, block.id, newData)} 
                                                  />
                                              )}
                                          </div>
                                      ))}
                                      <div className="h-6 w-full opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer group/add">
                                          <button className="mx-2 p-1 rounded-full bg-blue-50 text-blue-500 shadow-sm border border-blue-200">
                                              <Plus className="w-3 h-3"/>
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};

export default DocumentWorkspace;