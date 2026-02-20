
import React, { useState } from 'react';
import { 
    Microscope, Sparkles, Plus, Trash2, Info, Upload, 
    Download, Calculator, FileText, ChevronDown, Loader2, AlertCircle
} from 'lucide-react';
import { ProjectData, ResearchKajianDoc } from '../types';
import { GoogleGenAI } from "@google/genai";
import { exportProjectPackage } from '../services/fileGenService';

// ===== HELPER FUNCTIONS FOR TEXT TRUNCATION =====
const truncateText = (text: any, maxLength = 2000): string => {
  if (!text) return '';
  const str = String(text);
  return str.length > maxLength 
    ? str.substring(0, maxLength) + '...[dipotong]' 
    : str;
};

const truncateCell = (text: any, maxLength = 500): string => {
  if (!text) return '';
  const str = String(text);
  return str.length > maxLength 
    ? str.substring(0, maxLength) + '...' 
    : str;
};

const formatRupiah = (num: number): string => {
  if (!num || num === 0) return 'Rp 0';
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

interface TabResearchProps {
    project: ProjectData;
    setProject: (project: any) => void;
}

export const TabResearch: React.FC<TabResearchProps> = ({ project, setProject }) => {
    const [generatingSection, setGeneratingSection] = useState<string | null>(null);

    const doc = project.researchKajian;
    const ucpData = doc.ucpCalcData || {};

    const handleUpdate = (field: string, value: any) => {
        setProject({
            ...project,
            researchKajian: {
                ...doc,
                [field]: value
            }
        });
    };

    const handleUpdateNested = (obj: string, field: string, value: any) => {
        setProject({
            ...project,
            researchKajian: {
                ...doc,
                [obj]: {
                    ...(doc as any)[obj],
                    [field]: value
                }
            }
        });
    };

    const handleUpdateUCP = (field: string, value: any) => {
        setProject({
            ...project,
            researchKajian: {
                ...doc,
                ucpCalcData: {
                    ...ucpData,
                    [field]: value
                }
            }
        });
    };

    const handleUpdateUCPArray = (arrayField: string, id: string, field: string, value: any) => {
        const current = (ucpData as any)[arrayField] || [];
        handleUpdateUCP(arrayField, current.map((i: any) => i.id === id ? { ...i, [field]: value } : i));
    };

    const handleAddUCPRow = (arrayField: string, emptyObj: any) => {
        const current = (ucpData as any)[arrayField] || [];
        handleUpdateUCP(arrayField, [...current, { ...emptyObj, id: Date.now().toString() }]);
    };

    const handleRemoveUCPRow = (arrayField: string, id: string) => {
        const current = (ucpData as any)[arrayField] || [];
        handleUpdateUCP(arrayField, current.filter((i: any) => i.id !== id));
    };

    const handleAddRow = (key: string, emptyObj: any) => {
        const current = (doc as any)[key] || [];
        handleUpdate(key, [...current, { ...emptyObj, id: Date.now().toString() }]);
    };

    const handleRemoveRow = (key: string, id: string) => {
        const current = (doc as any)[key] || [];
        handleUpdate(key, current.filter((i: any) => i.id !== id));
    };

    const handleUpdateRow = (key: string, id: string, field: string, value: any) => {
        const current = (doc as any)[key] || [];
        handleUpdate(key, current.map((i: any) => i.id === id ? { ...i, [field]: value } : i));
    };

    const aiGenerate = async (section: string, prompt: string) => {
        setGeneratingSection(section);
        try {
            const apiKey = import.meta.env.VITE_API_KEY || (process.env as any).VITE_API_KEY;
            if (!apiKey) {
                throw new Error("API key not configured. Please check .env.local");
            }
            const ai = new GoogleGenAI({ apiKey });
            const modelToUse = import.meta.env.VITE_AI_MODEL || (process.env as any).VITE_AI_MODEL || 'gemini-2.5-pro-preview-06-05';
            const response = await ai.models.generateContent({
                model: modelToUse,
                contents: `
                ACT AS: Senior Demand Management DJBC & IT Auditor.
                PROJECT CONTEXT: ${project.meta.theme} - ${project.strategicAnalysis.executiveSummary}
                TASK: Generate content for the document section: "${section}".
                PROMPT: ${prompt}
                FORMAT: Provide the content naturally for a formal government document.
                `
            });
            const text = response.text || "AI failed to generate content.";
            
            // Logic mapping for auto-fill
            if (section === 'SECTION 3: AS-IS TO-BE') {
                // Special handling if needed, but for simplicity we fill a generic textarea or specific rows
                const rows = text.split('\n').filter(l => l.includes('|')).map(l => {
                    const parts = l.split('|').map(p => p.trim());
                    return { id: Math.random().toString(), factor: parts[1] || '', asIs: parts[2] || '', toBe: parts[3] || '' };
                });
                if (rows.length > 0) handleUpdate('asIsToBe', rows);
            } else if (section === 'SECTION 5: FUNGSIONAL') {
                 const rows = text.split('\n').filter(l => l.includes('|')).map(l => {
                    const parts = l.split('|').map(p => p.trim());
                    return { id: Math.random().toString(), function: parts[1] || '', description: parts[2] || '' };
                });
                if (rows.length > 0) handleUpdate('functionalReqs', rows);
            } else {
                 // Map single fields
                 const mapping: any = {
                    'INFORMASI UMUM': 'projectDescription',
                    'DIAGRAM ALUR': 'processFlowDescription',
                    'KESIMPULAN': 'conclusion',
                    'RTL': 'rtl'
                 };
                 if (mapping[section]) handleUpdate(mapping[section], text);
            }
        } catch (err) { console.error(err); }
        finally { setGeneratingSection(null); }
    };

    const SectionHeader = ({ title, onAi }: { title: string, onAi?: () => void }) => (
        <div className="bg-govt-darkBlue text-white p-3 px-6 rounded-t-xl flex justify-between items-center shadow-md">
            <h3 className="font-bold text-sm uppercase tracking-widest">{title}</h3>
            {onAi && (
                <button 
                    onClick={onAi}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    {generatingSection === title ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3 text-govt-gold"/>}
                    AI Generate
                </button>
            )}
        </div>
    );

    // Business Value & Effort Logic
    const bvScore = (doc.businessValueParams.efficiency + doc.businessValueParams.user + doc.businessValueParams.basis + doc.businessValueParams.impact);
    const effortScore = (doc.effortParams.duration + doc.effortParams.technology + doc.effortParams.relatedSystem + doc.effortParams.devStrategy);
    
    let priorityRec = "Medium";
    if (bvScore > 15 && effortScore < 8) priorityRec = "High (Quick Win)";
    else if (bvScore > 15 && effortScore >= 12) priorityRec = "High (Strategic Venture)";
    else if (bvScore <= 10) priorityRec = "Low";

    return (
        <div className="space-y-8 pb-32 animate-fade-in font-sans text-slate-800">
            {/* DOCUMENT HEADER */}
            <div className="text-center space-y-2 mb-10">
                <h1 className="text-3xl font-black text-govt-darkBlue uppercase tracking-tighter">Dokumen Penelitian Kajian Kebutuhan</h1>
                <h2 className="text-lg font-bold text-slate-500 italic">Sistem CEISA 4.0 — {project.meta.theme}</h2>
                <div className="flex justify-center mt-4">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg shadow-sm">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">Nomor Dokumen</span>
                        <input 
                            value={doc.docNumber} 
                            onChange={e => handleUpdate('docNumber', e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-sm font-mono font-bold text-blue-600 outline-none w-64"
                            placeholder="DOK/DM/EA/2024/001"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 1: INFORMASI UMUM */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader title="SECTION 1: INFORMASI UMUM" onAi={() => aiGenerate('INFORMASI UMUM', 'Write a formal 2-paragraph description of this project proposal for an official doc.')} />
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nama Proyek</label>
                        <input value={doc.projectName} onChange={e => handleUpdate('projectName', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Uraian Singkat Usulan Proyek</label>
                        <textarea value={doc.projectDescription} onChange={e => handleUpdate('projectDescription', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm h-24" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Unit Pengampu Bisnis Proses</label>
                        <input value={doc.processOwner} onChange={e => handleUpdate('processOwner', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nomor Nota Dinas Kajian Kebutuhan</label>
                        <input value={doc.notaNumber} onChange={e => handleUpdate('notaNumber', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Nota Dinas</label>
                        <input type="date" value={doc.notaDate} onChange={e => handleUpdate('notaDate', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Pembuatan Dokumen</label>
                        <input type="date" value={doc.docCreationDate} onChange={e => handleUpdate('docCreationDate', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                </div>
                <div className="mx-6 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800">
                    <Info className="w-5 h-5 shrink-0" />
                    <p className="text-xs leading-relaxed font-medium">
                        <strong>PENGINGAT PENTING:</strong> Dokumen Penelitian merupakan keluaran dari Tim DM dan Tim EA. Isi Dokumen Penelitian didapat dari hasil diskusi antara Tim DM, PM dan/atau SA serta Pengampu Proses Bisnis dan/atau Unit Vertikal
                    </p>
                </div>
            </div>

            {/* SECTION 2: ANALISIS PROSES BISNIS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader title="SECTION 2: ANALISIS PROSES BISNIS" />
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Modul</label>
                        <input value={doc.module} onChange={e => handleUpdate('module', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Sub Modul</label>
                        <input value={doc.subModule} onChange={e => handleUpdate('subModule', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Analisis Pemetaan EA Kemenkeu</label>
                        <input value={doc.eaMapping} onChange={e => handleUpdate('eaMapping', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Catatan atau Keterangan</label>
                        <input value={doc.notes} onChange={e => handleUpdate('notes', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                    </div>
                </div>
            </div>

            {/* SECTION 3: KONDISI AS-IS TO-BE */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center bg-govt-darkBlue text-white p-3 px-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest">SECTION 3: KONDISI AS-IS TO-BE</h3>
                    <div className="flex gap-2">
                         <button onClick={() => aiGenerate('SECTION 3: AS-IS TO-BE', 'Generate comparative table data with | Factor | As-Is | To-Be | structure.')} className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold uppercase transition-all">AI Generate</button>
                         <button onClick={() => handleAddRow('asIsToBe', { factor: '', asIs: '', toBe: '' })} className="flex items-center gap-1 px-2 py-1 bg-govt-gold text-govt-darkBlue hover:bg-yellow-500 rounded text-[10px] font-black uppercase transition-all">+ Tambah Baris</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-black text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4 w-1/4">Faktor Pembanding</th>
                                <th className="p-4">As Is (Kondisi Saat Ini)</th>
                                <th className="p-4">To-Be (Kondisi Harapan)</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doc.asIsToBe.map((row, i) => (
                                <tr key={row.id} className="hover:bg-slate-50 group">
                                    <td className="p-4 text-center font-mono text-slate-400">{i+1}</td>
                                    <td className="p-2"><input value={row.factor} onChange={e => handleUpdateRow('asIsToBe', row.id, 'factor', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold" /></td>
                                    <td className="p-2"><textarea value={row.asIs} onChange={e => handleUpdateRow('asIsToBe', row.id, 'asIs', e.target.value)} className="w-full p-2 bg-transparent outline-none h-16 resize-none" /></td>
                                    <td className="p-2"><textarea value={row.toBe} onChange={e => handleUpdateRow('asIsToBe', row.id, 'toBe', e.target.value)} className="w-full p-2 bg-transparent outline-none h-16 resize-none font-bold text-blue-600" /></td>
                                    <td className="p-4"><button onClick={() => handleRemoveRow('asIsToBe', row.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500 transition-all"><Trash2 className="w-4 h-4"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 4: DIAGRAM ALUR PROSES BISNIS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader title="SECTION 4: DIAGRAM ALUR PROSES BISNIS" onAi={() => aiGenerate('DIAGRAM ALUR', 'Explain the BPMN business process flow for AS IS and TO BE for this project.')} />
                <div className="p-6 space-y-4">
                    <textarea 
                        value={doc.processFlowDescription} 
                        onChange={e => handleUpdate('processFlowDescription', e.target.value)}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm h-32 leading-relaxed"
                        placeholder="Pada bagian ini menjelaskan alur proses bisnis AS IS dan TO BE modul dalam bagan Business Process Modeling and Notation (BPMN) berdasarkan kesepakatan hasil/poin diskusi..."
                    />
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:border-blue-400 cursor-pointer group transition-all">
                        <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload BPMN Diagram / Image</span>
                    </div>
                </div>
            </div>

            {/* SECTION 5: KEBUTUHAN FUNGSIONAL */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center bg-govt-darkBlue text-white p-3 px-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest">SECTION 5: KEBUTUHAN FUNGSIONAL</h3>
                    <div className="flex gap-2">
                        <button onClick={() => aiGenerate('SECTION 5: FUNGSIONAL', 'Generate a list of functional requirements with | Function | Description |.')} className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold uppercase transition-all">AI Generate</button>
                        <button onClick={() => handleAddRow('functionalReqs', { function: '', description: '' })} className="flex items-center gap-1 px-2 py-1 bg-govt-gold text-govt-darkBlue hover:bg-yellow-500 rounded text-[10px] font-black uppercase transition-all">+ Tambah Baris</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-black text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4 w-1/3">Fungsi</th>
                                <th className="p-4">Deskripsi</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doc.functionalReqs.map((row, i) => (
                                <tr key={row.id} className="hover:bg-slate-50 group">
                                    <td className="p-4 text-center text-slate-400">{i+1}</td>
                                    <td className="p-2"><input value={row.function} onChange={e => handleUpdateRow('functionalReqs', row.id, 'function', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold" /></td>
                                    <td className="p-2"><textarea value={row.description} onChange={e => handleUpdateRow('functionalReqs', row.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none h-12 resize-none" /></td>
                                    <td className="p-4"><button onClick={() => handleRemoveRow('functionalReqs', row.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500"><Trash2 className="w-4 h-4"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 6: KEBUTUHAN NON-FUNGSIONAL */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center bg-govt-darkBlue text-white p-3 px-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest">SECTION 6: KEBUTUHAN NON-FUNGSIONAL</h3>
                    <button onClick={() => handleAddRow('nonFunctionalReqs', { description: '', reason: '' })} className="flex items-center gap-1 px-2 py-1 bg-govt-gold text-govt-darkBlue hover:bg-yellow-500 rounded text-[10px] font-black uppercase transition-all">+ Tambah Baris</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-black text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4 w-12 text-center">No</th>
                                <th className="p-4 w-1/2">Deskripsi</th>
                                <th className="p-4">Alasan</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doc.nonFunctionalReqs.map((row, i) => (
                                <tr key={row.id} className="hover:bg-slate-50 group">
                                    <td className="p-4 text-center text-slate-400">{i+1}</td>
                                    <td className="p-2"><input value={row.description} onChange={e => handleUpdateRow('nonFunctionalReqs', row.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold" /></td>
                                    <td className="p-2"><textarea value={row.reason} onChange={e => handleUpdateRow('nonFunctionalReqs', row.id, 'reason', e.target.value)} className="w-full p-2 bg-transparent outline-none h-12 resize-none" /></td>
                                    <td className="p-4"><button onClick={() => handleRemoveRow('nonFunctionalReqs', row.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500"><Trash2 className="w-4 h-4"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 7: SPESIFIKASI AKTOR */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center bg-govt-darkBlue text-white p-3 px-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest">SECTION 7: SPESIFIKASI AKTOR</h3>
                    <div className="flex gap-2">
                        <button onClick={() => aiGenerate('SECTION 7: AKTOR', 'Generate potential project actors with | Code | Name | Description |.')} className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold uppercase transition-all">AI Generate</button>
                        <button onClick={() => handleAddRow('actors', { code: '', name: '', description: '' })} className="flex items-center gap-1 px-2 py-1 bg-govt-gold text-govt-darkBlue hover:bg-yellow-500 rounded text-[10px] font-black uppercase transition-all">+ Tambah Baris</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-black text-[10px] tracking-wider">
                            <tr>
                                <th className="p-4 w-1/4">Kode Aktor</th>
                                <th className="p-4 w-1/4">Nama Aktor</th>
                                <th className="p-4">Deskripsi</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doc.actors.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 group">
                                    <td className="p-2"><input value={row.code} onChange={e => handleUpdateRow('actors', row.id, 'code', e.target.value)} className="w-full p-2 bg-transparent outline-none font-mono text-blue-600 font-bold" placeholder="[MODUL]-ACT-[ID]" /></td>
                                    <td className="p-2"><input value={row.name} onChange={e => handleUpdateRow('actors', row.id, 'name', e.target.value)} className="w-full p-2 bg-transparent outline-none font-bold" placeholder="Misal: Pengguna Jasa" /></td>
                                    <td className="p-2"><textarea value={row.description} onChange={e => handleUpdateRow('actors', row.id, 'description', e.target.value)} className="w-full p-2 bg-transparent outline-none h-12 resize-none" placeholder="Deskripsi aktor..." /></td>
                                    <td className="p-4"><button onClick={() => handleRemoveRow('actors', row.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500"><Trash2 className="w-4 h-4"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 8: USE CASE DIAGRAM DAN DESKRIPSI */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center bg-govt-darkBlue text-white p-3 px-6">
                    <h3 className="font-bold text-sm uppercase tracking-widest">SECTION 8: USE CASE DIAGRAM DAN DESKRIPSI</h3>
                    <div className="flex gap-2">
                        <button onClick={() => aiGenerate('SECTION 8: USE CASE', 'Generate use cases for this project.')} className="flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] font-bold uppercase transition-all">AI Generate</button>
                        <button onClick={() => handleAddRow('useCases', { code: '', name: '', priority: 'Medium', actor: '', preCondition: '', postCondition: '', mainFlow: '', altFlow: '', notes: '' })} className="flex items-center gap-1 px-2 py-1 bg-govt-gold text-govt-darkBlue hover:bg-yellow-500 rounded text-[10px] font-black uppercase transition-all">+ Tambah Baris</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-[10px] text-left">
                        <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider">
                            <tr>
                                <th className="p-2 w-20">Kode UC</th>
                                <th className="p-2 w-32">Nama UC</th>
                                <th className="p-2">Priority</th>
                                <th className="p-2">Aktor</th>
                                <th className="p-2">Kondisi Awal</th>
                                <th className="p-2">Kondisi Akhir</th>
                                <th className="p-2 w-40">Alur Utama</th>
                                <th className="p-2 w-40">Alur Alternatif</th>
                                <th className="p-2 w-32">Catatan</th>
                                <th className="p-2 w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {doc.useCases.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 group">
                                    <td className="p-1"><input value={row.code} onChange={e => handleUpdateRow('useCases', row.id, 'code', e.target.value)} className="w-full p-1 bg-transparent font-mono" /></td>
                                    <td className="p-1"><input value={row.name} onChange={e => handleUpdateRow('useCases', row.id, 'name', e.target.value)} className="w-full p-1 bg-transparent font-bold" /></td>
                                    <td className="p-1"><select value={row.priority} onChange={e => handleUpdateRow('useCases', row.id, 'priority', e.target.value)} className="bg-transparent"><option>High</option><option>Medium</option><option>Low</option></select></td>
                                    <td className="p-1"><input value={row.actor} onChange={e => handleUpdateRow('useCases', row.id, 'actor', e.target.value)} className="w-full p-1 bg-transparent" /></td>
                                    <td className="p-1"><textarea value={row.preCondition} onChange={e => handleUpdateRow('useCases', row.id, 'preCondition', e.target.value)} className="w-full p-1 bg-transparent h-12 resize-none" /></td>
                                    <td className="p-1"><textarea value={row.postCondition} onChange={e => handleUpdateRow('useCases', row.id, 'postCondition', e.target.value)} className="w-full p-1 bg-transparent h-12 resize-none" /></td>
                                    <td className="p-1 text-[9px]"><textarea value={row.mainFlow} onChange={e => handleUpdateRow('useCases', row.id, 'mainFlow', e.target.value)} className="w-full p-1 bg-transparent h-20 resize-none" /></td>
                                    <td className="p-1 text-[9px]"><textarea value={row.altFlow} onChange={e => handleUpdateRow('useCases', row.id, 'altFlow', e.target.value)} className="w-full p-1 bg-transparent h-20 resize-none" /></td>
                                    <td className="p-1"><textarea value={row.notes} onChange={e => handleUpdateRow('useCases', row.id, 'notes', e.target.value)} className="w-full p-1 bg-transparent h-12 resize-none" /></td>
                                    <td className="p-1"><button onClick={() => handleRemoveRow('useCases', row.id)} className="opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-500"><Trash2 className="w-3 h-3"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SECTION 9: BUSINESS VALUE VS EFFORT */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader title="SECTION 9: PERHITUNGAN BUSINESS VALUE VS EFFORT" />
                <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* VALUE */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                             <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center"><Calculator className="w-4 h-4 text-emerald-600"/></div>
                             <h4 className="font-black text-xs uppercase text-slate-500 tracking-wider">Business Value Parameters</h4>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'efficiency', label: 'Efisiensi' },
                                { id: 'user', label: 'Pengguna Layanan' },
                                { id: 'basis', label: 'Dasar Kebutuhan' },
                                { id: 'impact', label: 'Bisnis Impact Analisis' },
                            ].map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                    <label className="text-xs font-bold text-slate-600">{item.label}</label>
                                    <select 
                                        value={(doc.businessValueParams as any)[item.id]} 
                                        onChange={e => handleUpdateNested('businessValueParams', item.id, parseInt(e.target.value))}
                                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-blue-600"
                                    >
                                        {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                                    </select>
                                </div>
                            ))}
                            <div className="pt-4 flex justify-between items-center border-t border-slate-200">
                                <span className="text-sm font-black text-slate-700">Total Business Value Score</span>
                                <span className="text-2xl font-black text-emerald-600 font-mono bg-emerald-50 px-4 py-1 rounded-xl border border-emerald-200">{bvScore}</span>
                            </div>
                        </div>
                    </div>

                    {/* EFFORT */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                             <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center"><Calculator className="w-4 h-4 text-blue-600"/></div>
                             <h4 className="font-black text-xs uppercase text-slate-500 tracking-wider">Effort Parameters</h4>
                        </div>
                        <div className="space-y-4">
                             <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <label className="text-xs font-bold text-slate-600">Durasi Proyek</label>
                                <select 
                                    value={doc.effortParams.duration} 
                                    onChange={e => handleUpdateNested('effortParams', 'duration', parseInt(e.target.value))}
                                    className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-blue-600"
                                >
                                    <option value={1}>&lt; 3 Bulan (1)</option>
                                    <option value={2}>3-6 Bulan (2)</option>
                                    <option value={3}>6-12 Bulan (3)</option>
                                    <option value={5}>&gt; 12 Bulan (5)</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <label className="text-xs font-bold text-slate-600">Teknologi</label>
                                <select 
                                    value={doc.effortParams.technology} 
                                    onChange={e => handleUpdateNested('effortParams', 'technology', parseInt(e.target.value))}
                                    className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-blue-600"
                                >
                                    <option value={1}>Existing Technology (1)</option>
                                    <option value={2}>New Framework / DB (2)</option>
                                    <option value={4}>Highly Complex Tech (4)</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <label className="text-xs font-bold text-slate-600">Sistem Terkait</label>
                                <select 
                                    value={doc.effortParams.relatedSystem} 
                                    onChange={e => handleUpdateNested('effortParams', 'relatedSystem', parseInt(e.target.value))}
                                    className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-blue-600"
                                >
                                    <option value={1}>Standalone (1)</option>
                                    <option value={2}>1 External System (2)</option>
                                    <option value={4}>Multi-System Integration (4)</option>
                                </select>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <label className="text-xs font-bold text-slate-600">Strategi Pengembangan</label>
                                <select 
                                    value={doc.effortParams.devStrategy} 
                                    onChange={e => handleUpdateNested('effortParams', 'devStrategy', parseInt(e.target.value))}
                                    className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-blue-600"
                                >
                                    <option value={1}>In-house / Agile (1)</option>
                                    <option value={2}>Hybrid (2)</option>
                                    <option value={3}>Full Outsource (3)</option>
                                </select>
                            </div>
                            <div className="pt-4 flex justify-between items-center border-t border-slate-200">
                                <span className="text-sm font-black text-slate-700">Total Effort Score</span>
                                <span className="text-2xl font-black text-blue-600 font-mono bg-blue-50 px-4 py-1 rounded-xl border border-blue-200">{effortScore}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* PRIORITY BOX */}
                <div className="m-8 p-6 bg-govt-darkBlue text-white rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-blue-800">
                    <div className="space-y-1">
                        <h5 className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Priority Recommendation</h5>
                        <div className="text-3xl font-black tracking-tighter">{priorityRec}</div>
                    </div>
                    <div className="bg-white/10 px-6 py-4 rounded-xl text-center border border-white/10">
                        <div className="text-[9px] font-bold text-blue-200 uppercase mb-1">Value/Effort Ratio</div>
                        <div className="text-xl font-mono font-bold text-govt-gold">{(bvScore / effortScore).toFixed(2)}</div>
                    </div>
                </div>
            </div>

            {/* ===== UCP CALCULATION SECTIONS ===== */}
            {/* SECTION: DATA PERHITUNGAN UCP */}
            <div className="space-y-6">
                <div className="text-2xl font-black text-govt-darkBlue uppercase">SECTION: DATA PERHITUNGAN UCP</div>
                
                {/* SUB-SECTION A: USE CASE & ACTOR */}
                <div className="space-y-4">
                    <div className="text-lg font-bold text-slate-700">SUB-SECTION A: TABEL USE CASE & ACTOR</div>
                    
                    {/* Tabel 1: Use Case List */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-govt-darkBlue text-white p-3 px-6 flex justify-between items-center">
                            <h4 className="font-bold text-sm uppercase">Tabel 1 — Use Case List</h4>
                            <button onClick={() => handleAddUCPRow('ucpUseCases', { sub: '', useCase: '', jenis: '', catatan: '', jumlahUC: 1, kompleksitas: 'Simple', bobot: 5, uucw: 0 })} className="flex items-center gap-1 px-2 py-1 bg-govt-gold text-govt-darkBlue font-black rounded text-[10px] uppercase">+ Tambah</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-100 text-slate-600 uppercase font-black">
                                    <tr>
                                        <th className="p-3">No</th>
                                        <th className="p-3">Sub</th>
                                        <th className="p-3">Use Case</th>
                                        <th className="p-3">Jenis</th>
                                        <th className="p-3">Catatan</th>
                                        <th className="p-3">Jumlah UC</th>
                                        <th className="p-3">Kompleksitas</th>
                                        <th className="p-3">Bobot</th>
                                        <th className="p-3">UUCW</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(ucpData.ucpUseCases || []).map((row, i) => (
                                        <tr key={row.id} className="hover:bg-slate-50">
                                            <td className="p-2 text-center">{i + 1}</td>
                                            <td className="p-2"><input value={row.sub} onChange={e => handleUpdateUCPArray('ucpUseCases', row.id, 'sub', e.target.value)} className="w-full p-1 border rounded text-xs" /></td>
                                            <td className="p-2"><input value={row.useCase} onChange={e => handleUpdateUCPArray('ucpUseCases', row.id, 'useCase', e.target.value)} className="w-full p-1 border rounded text-xs" /></td>
                                            <td className="p-2"><input value={row.jenis} onChange={e => handleUpdateUCPArray('ucpUseCases', row.id, 'jenis', e.target.value)} className="w-full p-1 border rounded text-xs" /></td>
                                            <td className="p-2"><input value={row.catatan} onChange={e => handleUpdateUCPArray('ucpUseCases', row.id, 'catatan', truncateCell(e.target.value, 500))} className="w-full p-1 border rounded text-xs" /></td>
                                            <td className="p-2"><input type="number" value={row.jumlahUC} onChange={e => handleUpdateUCPArray('ucpUseCases', row.id, 'jumlahUC', parseInt(e.target.value) || 1)} className="w-full p-1 border rounded text-xs" /></td>
                                            <td className="p-2"><select value={row.kompleksitas} onChange={e => { const newBobot = e.target.value === 'Simple' ? 5 : e.target.value === 'Average' ? 10 : 15; handleUpdateUCPArray('ucpUseCases', row.id, 'kompleksitas', e.target.value); handleUpdateUCPArray('ucpUseCases', row.id, 'bobot', newBobot); handleUpdateUCPArray('ucpUseCases', row.id, 'uucw', row.jumlahUC * newBobot); }} className="w-full p-1 border rounded text-xs"><option>Simple</option><option>Average</option><option>Complex</option></select></td>
                                            <td className="p-2"><input type="number" value={row.bobot} readOnly className="w-full p-1 border rounded text-xs bg-slate-100" /></td>
                                            <td className="p-2"><input type="number" value={row.uucw} readOnly className="w-full p-1 border rounded text-xs bg-slate-100" /></td>
                                            <td className="p-2"><button onClick={() => handleRemoveUCPRow('ucpUseCases', row.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Tabel 2: Actor Classification */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-govt-darkBlue text-white p-3 px-6 flex justify-between items-center">
                            <h4 className="font-bold text-sm uppercase">Tabel 2 — Actor Classification</h4>
                            <button onClick={() => handleAddUCPRow('ucpActors', { aktor: '', jenisAktor: 'Average', uaw: 2 })} className="flex items-center gap-1 px-2 py-1 bg-govt-gold text-govt-darkBlue font-black rounded text-[10px] uppercase">+ Tambah</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-100 text-slate-600 uppercase font-black">
                                    <tr>
                                        <th className="p-3">No</th>
                                        <th className="p-3">Aktor</th>
                                        <th className="p-3">Jenis Aktor</th>
                                        <th className="p-3">UAW</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {(ucpData.ucpActors || []).map((row, i) => (
                                        <tr key={row.id} className="hover:bg-slate-50">
                                            <td className="p-2 text-center">{i + 1}</td>
                                            <td className="p-2"><input value={row.aktor} onChange={e => handleUpdateUCPArray('ucpActors', row.id, 'aktor', e.target.value)} className="w-full p-1 border rounded text-xs" /></td>
                                            <td className="p-2"><select value={row.jenisAktor} onChange={e => { const newUaw = e.target.value === 'Simple' ? 1 : e.target.value === 'Average' ? 2 : 3; handleUpdateUCPArray('ucpActors', row.id, 'jenisAktor', e.target.value); handleUpdateUCPArray('ucpActors', row.id, 'uaw', newUaw); }} className="w-full p-1 border rounded text-xs"><option value="Simple">Simple (API)</option><option value="Average">Average (Protocol/TCP-IP)</option><option value="Complex">Complex (GUI/Web)</option></select></td>
                                            <td className="p-2"><input type="number" value={row.uaw} readOnly className="w-full p-1 border rounded text-xs bg-slate-100" /></td>
                                            <td className="p-2"><button onClick={() => handleRemoveUCPRow('ucpActors', row.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-blue-50 border-t border-slate-200 space-y-2 text-xs">
                            <p className="font-bold">Classification Reference:</p>
                            <div className="grid grid-cols-3 gap-2">
                                <div><span className="font-bold">Simple (API):</span> bobot 1</div>
                                <div><span className="font-bold">Average (Protocol/TCP-IP):</span> bobot 2</div>
                                <div><span className="font-bold">Complex (GUI/Web):</span> bobot 3</div>
                            </div>
                        </div>
                    </div>

                    {/* Tabel 3: Use Case Weight Reference */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-govt-darkBlue text-white p-3 px-6">
                            <h4 className="font-bold text-sm uppercase">Tabel 3 — Use Case Weight Reference (Standard)</h4>
                        </div>
                        <table className="w-full text-xs">
                            <thead className="bg-slate-100 text-slate-600 uppercase font-black">
                                <tr>
                                    <th className="p-3">Tipe Use Case</th>
                                    <th className="p-3">No. of Transactions</th>
                                    <th className="p-3">Bobot</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr className="hover:bg-slate-50">
                                    <td className="p-3">Simple</td>
                                    <td className="p-3">≤ 3 transaksi</td>
                                    <td className="p-3 font-bold">5</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-3">Average</td>
                                    <td className="p-3">4-7 transaksi</td>
                                    <td className="p-3 font-bold">10</td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-3">Complex</td>
                                    <td className="p-3">≥ 8 transaksi</td>
                                    <td className="p-3 font-bold">15</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Auto-calculated Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="text-xs text-slate-600 font-bold uppercase">Total UUCW</div>
                            <div className="text-3xl font-black text-blue-600">{((ucpData.ucpUseCases || []).reduce((sum, r) => sum + (r.uucw || 0), 0))}</div>
                        </div>
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                            <div className="text-xs text-slate-600 font-bold uppercase">Total UAW</div>
                            <div className="text-3xl font-black text-emerald-600">{((ucpData.ucpActors || []).reduce((sum, r) => sum + (r.uaw || 0), 0))}</div>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <div className="text-xs text-slate-600 font-bold uppercase">UUCP (UAW + UUCW)</div>
                            <div className="text-3xl font-black text-amber-600">{((ucpData.ucpUseCases || []).reduce((sum, r) => sum + (r.uucw || 0), 0) + (ucpData.ucpActors || []).reduce((sum, r) => sum + (r.uaw || 0), 0))}</div>
                        </div>
                    </div>
                </div>

                {/* SUB-SECTION B: TECHNICAL COMPLEXITY FACTOR */}
                <div className="space-y-4 pt-8 border-t-2">
                    <div className="text-lg font-bold text-slate-700">SUB-SECTION B: TECHNICAL COMPLEXITY FACTOR (TCF)</div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-govt-darkBlue text-white p-3 px-6 flex justify-between items-center">
                            <h4 className="font-bold text-sm uppercase">TCF Factors</h4>
                            <button onClick={() => handleAddUCPRow('tcfFactors', { factor: '', weight: 1, relevance: 0, keterangan: '' })} className="flex items-center gap-1 px-2 py-1 bg-govt-gold text-govt-darkBlue font-black rounded text-[10px] uppercase">+ Tambah</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-100 text-slate-600 uppercase font-black">
                                    <tr>
                                        <th className="p-3">No</th>
                                        <th className="p-3">Factor</th>
                                        <th className="p-3">Weight</th>
                                        <th className="p-3">Relevance (0-5)</th>
                                        <th className="p-3">Score</th>
                                        <th className="p-3">Keterangan</th>
                                        <th className="p-3">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { name: 'T1', label: 'Distributed System', weight: 2.00 },
                                        { name: 'T2', label: 'Performance', weight: 1.00 },
                                        { name: 'T3', label: 'End User Efficiency', weight: 1.00 },
                                        { name: 'T4', label: 'Complex Internal Processing', weight: 1.00 },
                                        { name: 'T5', label: 'Reusability', weight: 1.00 },
                                        { name: 'T6', label: 'Easy to Install', weight: 0.50 },
                                        { name: 'T7', label: 'Easy to Use', weight: 0.50 },
                                        { name: 'T8', label: 'Portability', weight: 2.00 },
                                        { name: 'T9', label: 'Easy to Change', weight: 1.00 },
                                        { name: 'T10', label: 'Concurrency', weight: 1.00 },
                                        { name: 'T11', label: 'Special Security Features', weight: 1.00 },
                                        { name: 'T12', label: 'Direct Access for Third Parties', weight: 1.00 },
                                        { name: 'T13', label: 'Special User Training', weight: 1.00 },
                                    ].map((tcf, idx) => {
                                        const row = (ucpData.tcfFactors || []).find(r => r.factor === tcf.label);
                                        const relevance = row?.relevance || 0;
                                        const score = tcf.weight * relevance;
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-2 text-center font-bold">{tcf.name}</td>
                                                <td className="p-2">{tcf.label}</td>
                                                <td className="p-2 text-center">{tcf.weight}</td>
                                                <td className="p-2"><input type="number" min="0" max="5" value={relevance} onChange={e => {
                                                    if (row) handleUpdateUCPArray('tcfFactors', row.id, 'relevance', parseInt(e.target.value) || 0);
                                                    else handleAddUCPRow('tcfFactors', { factor: tcf.label, weight: tcf.weight, relevance: parseInt(e.target.value) || 0, keterangan: '' });
                                                }} className="w-full p-1 border rounded text-xs" /></td>
                                                <td className="p-2 text-center bg-slate-100 font-bold">{score.toFixed(2)}</td>
                                                <td className="p-2"><input value={row?.keterangan || ''} onChange={e => {
                                                    if (row) handleUpdateUCPArray('tcfFactors', row.id, 'keterangan', truncateCell(e.target.value, 500));
                                                }} className="w-full p-1 border rounded text-xs" /></td>
                                                <td className="p-2">{row && <button onClick={() => handleRemoveUCPRow('tcfFactors', row.id)} className="text-rose-500 hover:text-rose-700"><Trash2 className="w-4 h-4" /></button>}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-blue-50 border-t">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-sm">
                                    <span className="font-bold">Sum TCF:</span>
                                    <div className="text-xl font-black text-blue-600">{((ucpData.tcfFactors || []).reduce((sum, r) => sum + (r.weight * r.relevance), 0)).toFixed(2)}</div>
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold">TCF = 0.6 + (0.01 × Sum):</span>
                                    <div className="text-xl font-black text-blue-600">{(0.6 + 0.01 * ((ucpData.tcfFactors || []).reduce((sum, r) => sum + (r.weight * r.relevance), 0))).toFixed(3)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUB-SECTION C: ENVIRONMENTAL FACTOR */}
                <div className="space-y-4 pt-8 border-t-2">
                    <div className="text-lg font-bold text-slate-700">SUB-SECTION C: ENVIRONMENTAL FACTOR (ECF)</div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="bg-govt-darkBlue text-white p-3 px-6">
                            <h4 className="font-bold text-sm uppercase">ECF Factors</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-100 text-slate-600 uppercase font-black">
                                    <tr>
                                        <th className="p-3">No</th>
                                        <th className="p-3">Factor</th>
                                        <th className="p-3">Weight</th>
                                        <th className="p-3">Impact (0-5)</th>
                                        <th className="p-3">Score</th>
                                        <th className="p-3">Keterangan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {[
                                        { name: 'E1', label: 'Familiarity with Dev Process', weight: 1.50 },
                                        { name: 'E2', label: 'Part-Time Workers', weight: -1.00 },
                                        { name: 'E3', label: 'Analyst Capability', weight: 0.50 },
                                        { name: 'E4', label: 'Application Experience', weight: 0.50 },
                                        { name: 'E5', label: 'Object-Oriented Experience', weight: 1.00 },
                                        { name: 'E6', label: 'Motivation', weight: 1.00 },
                                        { name: 'E7', label: 'Difficult Programming Language', weight: -1.00 },
                                        { name: 'E8', label: 'Stable Requirements', weight: 2.00 },
                                    ].map((ecf, idx) => {
                                        const row = (ucpData.ecfFactors || []).find(r => r.factor === ecf.label);
                                        const impact = row?.impact || 0;
                                        const score = ecf.weight * impact;
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50">
                                                <td className="p-2 text-center font-bold">{ecf.name}</td>
                                                <td className="p-2">{ecf.label}</td>
                                                <td className="p-2 text-center">{ecf.weight}</td>
                                                <td className="p-2"><input type="number" min="0" max="5" value={impact} onChange={e => {
                                                    if (row) handleUpdateUCPArray('ecfFactors', row.id, 'impact', parseInt(e.target.value) || 0);
                                                    else handleAddUCPRow('ecfFactors', { factor: ecf.label, weight: ecf.weight, impact: parseInt(e.target.value) || 0, keterangan: '' });
                                                }} className="w-full p-1 border rounded text-xs" /></td>
                                                <td className="p-2 text-center bg-slate-100 font-bold">{score.toFixed(2)}</td>
                                                <td className="p-2"><input value={row?.keterangan || ''} onChange={e => {
                                                    if (row) handleUpdateUCPArray('ecfFactors', row.id, 'keterangan', truncateCell(e.target.value, 500));
                                                }} className="w-full p-1 border rounded text-xs" /></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-blue-50 border-t">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-sm">
                                    <span className="font-bold">Sum ECF:</span>
                                    <div className="text-xl font-black text-blue-600">{((ucpData.ecfFactors || []).reduce((sum, r) => sum + (r.weight * r.impact), 0)).toFixed(2)}</div>
                                </div>
                                <div className="text-sm">
                                    <span className="font-bold">ECF = 1.4 + (-0.03 × Sum):</span>
                                    <div className="text-xl font-black text-blue-600">{(1.4 + -0.03 * ((ucpData.ecfFactors || []).reduce((sum, r) => sum + (r.weight * r.impact), 0))).toFixed(3)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUB-SECTION D: HASIL KALKULASI */}
                <div className="space-y-4 pt-8 border-t-2">
                    <div className="text-lg font-bold text-slate-700">SUB-SECTION D: HASIL KALKULASI UCP</div>
                    <div className="bg-govt-darkBlue text-white p-6 rounded-xl space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="bg-white/10 p-4 rounded">
                                <div className="text-[10px] font-bold text-blue-200 uppercase mb-1">UUCP (UAW + UUCW)</div>
                                <div className="text-2xl font-black text-govt-gold">{((ucpData.ucpUseCases || []).reduce((sum, r) => sum + (r.uucw || 0), 0) + (ucpData.ucpActors || []).reduce((sum, r) => sum + (r.uaw || 0), 0))}</div>
                            </div>
                            <div className="bg-white/10 p-4 rounded">
                                <div className="text-[10px] font-bold text-blue-200 uppercase mb-1">TCF</div>
                                <div className="text-2xl font-black text-govt-gold">{(0.6 + 0.01 * ((ucpData.tcfFactors || []).reduce((sum, r) => sum + (r.weight * r.relevance), 0))).toFixed(3)}</div>
                            </div>
                            <div className="bg-white/10 p-4 rounded">
                                <div className="text-[10px] font-bold text-blue-200 uppercase mb-1">ECF</div>
                                <div className="text-2xl font-black text-govt-gold">{(1.4 + -0.03 * ((ucpData.ecfFactors || []).reduce((sum, r) => sum + (r.weight * r.impact), 0))).toFixed(3)}</div>
                            </div>
                        </div>
                        <div className="border-t border-white/20 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] font-bold text-blue-200 uppercase mb-1">UCP = UUCP × TCF × ECF</div>
                                <div className="text-3xl font-black text-govt-gold">
                                    {(
                                        ((ucpData.ucpUseCases || []).reduce((sum, r) => sum + (r.uucw || 0), 0) + (ucpData.ucpActors || []).reduce((sum, r) => sum + (r.uaw || 0), 0)) *
                                        (0.6 + 0.01 * ((ucpData.tcfFactors || []).reduce((sum, r) => sum + (r.weight * r.relevance), 0))) *
                                        (1.4 + -0.03 * ((ucpData.ecfFactors || []).reduce((sum, r) => sum + (r.weight * r.impact), 0)))
                                    ).toFixed(2)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <label className="text-[10px] font-bold text-blue-200 uppercase">PHM (Person Hour Multiplier)</label>
                                    <select value={ucpData.phm || 20} onChange={e => handleUpdateUCP('phm', parseInt(e.target.value))} className="w-full p-2 rounded bg-white/10 text-white border border-white/20 font-bold">
                                        <option value={20}>20 Jam/point (Standard)</option>
                                        <option value={28}>28 Jam/point (Complex)</option>
                                    </select>
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-blue-200 uppercase mb-1">Total Jam = UCP × PHM</div>
                                    <div className="text-xl font-black text-govt-gold">
                                        {(
                                            ((ucpData.ucpUseCases || []).reduce((sum, r) => sum + (r.uucw || 0), 0) + (ucpData.ucpActors || []).reduce((sum, r) => sum + (r.uaw || 0), 0)) *
                                            (0.6 + 0.01 * ((ucpData.tcfFactors || []).reduce((sum, r) => sum + (r.weight * r.relevance), 0))) *
                                            (1.4 + -0.03 * ((ucpData.ecfFactors || []).reduce((sum, r) => sum + (r.weight * r.impact), 0))) *
                                            (ucpData.phm || 20)
                                        ).toFixed(0)} Jam
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-white/20 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-[10px] font-bold text-blue-200 uppercase mb-1">WD = Total Jam / 8</div>
                                <div className="text-2xl font-black text-govt-gold">
                                    {(
                                        ((ucpData.ucpUseCases || []).reduce((sum, r) => sum + (r.uucw || 0), 0) + (ucpData.ucpActors || []).reduce((sum, r) => sum + (r.uaw || 0), 0)) *
                                        (0.6 + 0.01 * ((ucpData.tcfFactors || []).reduce((sum, r) => sum + (r.weight * r.relevance), 0))) *
                                        (1.4 + -0.03 * ((ucpData.ecfFactors || []).reduce((sum, r) => sum + (r.weight * r.impact), 0))) *
                                        (ucpData.phm || 20) / 8
                                    ).toFixed(2)} WD
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-blue-200 uppercase mb-1">MM = WD / 22</div>
                                <div className="text-2xl font-black text-govt-gold">
                                    {(
                                        ((ucpData.ucpUseCases || []).reduce((sum, r) => sum + (r.uucw || 0), 0) + (ucpData.ucpActors || []).reduce((sum, r) => sum + (r.uaw || 0), 0)) *
                                        (0.6 + 0.01 * ((ucpData.tcfFactors || []).reduce((sum, r) => sum + (r.weight * r.relevance), 0))) *
                                        (1.4 + -0.03 * ((ucpData.ecfFactors || []).reduce((sum, r) => sum + (r.weight * r.impact), 0))) *
                                        (ucpData.phm || 20) / 8 / 22
                                    ).toFixed(2)} MM
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 10: TANDA TANGAN & PERSETUJUAN */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <SectionHeader title="SECTION 10: TANDA TANGAN & PERSETUJUAN" />
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Disiapkan oleh (Tim Demand Management)</label>
                            <input value={doc.signatures.preparedBy} onChange={e => handleUpdateNested('signatures', 'preparedBy', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Nama PIC DM" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Penyelesaian Dokumen</label>
                            <input type="date" value={doc.signatures.preparedDate} onChange={e => handleUpdateNested('signatures', 'preparedDate', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Diketahui oleh (Project Manager)</label>
                            <input value={doc.signatures.knownBy} onChange={e => handleUpdateNested('signatures', 'knownBy', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Nama PM" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Disetujui</label>
                            <input type="date" value={doc.signatures.knownDate} onChange={e => handleUpdateNested('signatures', 'knownDate', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Disetujui oleh (PMO)</label>
                            <input value={doc.signatures.approvedBy} onChange={e => handleUpdateNested('signatures', 'approvedBy', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold" placeholder="Nama PMO Lead" />
                        </div>
                    </div>
                </div>
            </div>

            {/* EXPORT FOOTER */}
            <div className="fixed bottom-0 left-64 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 px-8 flex justify-between items-center z-40 shadow-2xl">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg"><FileText className="w-5 h-5 text-blue-600"/></div>
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Status</div>
                        <div className="text-xs font-bold text-slate-700">DRAFT READY FOR EXPORT</div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => exportProjectPackage(project)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <Download className="w-4 h-4"/> Export Word
                    </button>
                    <button onClick={() => exportProjectPackage(project)} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                        <Download className="w-4 h-4"/> Export Excel
                    </button>
                    <button onClick={() => exportProjectPackage(project)} className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all active:scale-95">
                        <Download className="w-4 h-4"/> Export PDF
                    </button>
                </div>
            </div>
        </div>
    );
};
