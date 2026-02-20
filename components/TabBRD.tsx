
import React from 'react';
import { Briefcase, Sparkles, Plus, Trash2, LayoutList, Shield, User, GitGraph, Calculator, Calendar } from 'lucide-react';
import { getActorComplexity, getUseCaseComplexity, TCF_FACTORS, EF_FACTORS } from '../constants';

interface TabBRDProps {
    project: any;
    setProject: (project: any) => void;
    uploadedFile: string | null;
    calc: any;
    handleUpdateArray: (arrayName: string, id: string, field: string, value: any) => void;
    handleAddArray: (arrayName: string, newItem: any) => void;
    handleRemoveArray: (arrayName: string, id: string) => void;
}

export const TabBRD: React.FC<TabBRDProps> = ({ 
    project, setProject, uploadedFile, calc, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {
  return (
    <div className="space-y-8 animate-fade-in pb-12 text-slate-800">
        <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex gap-4 items-start">
            <Briefcase className="w-6 h-6 text-purple-600 mt-1" />
            <div>
                <h3 className="font-bold text-purple-900 flex items-center gap-2">Business Requirement Document (BRD) {uploadedFile && <Sparkles className="w-4 h-4 text-purple-500"/>}</h3>
                <p className="text-sm text-purple-700">Mendefinisikan perubahan proses bisnis, kebutuhan fungsional, dan perhitungan estimasi (UCP).</p>
            </div>
        </div>

        {/* 1. ANALISIS PROSES BISNIS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><LayoutList className="w-5 h-5 text-blue-600"/> 1. Analisis Proses Bisnis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Modul</label>
                    <input value={project.brdProcessAnalysis?.modul || ''} onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, modul: e.target.value}})} className="w-full p-2 text-sm border rounded bg-white font-medium text-slate-800" placeholder="Nama Modul"/>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Sub Modul</label>
                    <input value={project.brdProcessAnalysis?.subModul || ''} onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, subModul: e.target.value}})} className="w-full p-2 text-sm border rounded bg-white font-medium text-slate-800" placeholder="Nama Sub Modul"/>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Analisis pemetaan EA Kemenkeu</label>
                    <input value={project.brdProcessAnalysis?.eaMapping || ''} onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, eaMapping: e.target.value}})} className="w-full p-2 text-sm border rounded bg-white text-slate-800" placeholder="Kode / Nama EA"/>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Catatan atau Keterangan</label>
                    <input value={project.brdProcessAnalysis?.notes || ''} onChange={e => setProject({...project, brdProcessAnalysis: {...project.brdProcessAnalysis, notes: e.target.value}})} className="w-full p-2 text-sm border rounded bg-white text-slate-800" placeholder="Catatan Tambahan"/>
                </div>
            </div>
        </div>

        {/* 2. KONDISI AS-IS TO-BE */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                 <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800"><GitGraph className="w-5 h-5 text-emerald-600"/> 2. Kondisi As-Is vs To-Be (Perubahan Sistem)</h3>
                 <button onClick={() => handleAddArray('asIsToBe', {id: Date.now().toString(), factor: 'Proses Baru', asIs: 'Manual', toBe: 'Automated'})} className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all"><Plus className="w-3 h-3"/> Tambah Baris</button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700 text-white uppercase text-[10px] tracking-widest font-black">
                        <tr>
                            <th className="p-4 w-12 text-center">No</th>
                            <th className="p-4 w-1/4">Faktor Pembanding</th>
                            <th className="p-4 w-1/3">As Is (Kondisi Saat Ini)</th>
                            <th className="p-4 w-1/3">To Be (Kondisi Harapan)</th>
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {(project.asIsToBe || []).map((item: any, idx: number) => (
                            <tr key={item.id} className="hover:bg-slate-50 group transition-colors">
                                <td className="p-4 text-center text-slate-400 font-mono text-xs align-top pt-5">{idx + 1}</td>
                                <td className="p-4 align-top pt-5">
                                    <input 
                                        value={item.factor} 
                                        onChange={e => handleUpdateArray('asIsToBe', item.id, 'factor', e.target.value)} 
                                        className="w-full bg-transparent outline-none font-black text-slate-800 placeholder-slate-300 uppercase text-[11px] tracking-tight" 
                                        placeholder="FAKTOR PEMBANDING..."
                                    />
                                </td>
                                <td className="p-4 bg-slate-50/40 align-top">
                                    <textarea 
                                        value={item.asIs} 
                                        onChange={e => handleUpdateArray('asIsToBe', item.id, 'asIs', e.target.value)} 
                                        className="w-full bg-transparent outline-none text-slate-600 placeholder-slate-400 text-xs resize-none h-20 leading-relaxed font-medium" 
                                        placeholder="Deskripsikan proses manual atau sistem lama..."
                                    />
                                </td>
                                <td className="p-4 bg-emerald-50/20 align-top">
                                    <textarea 
                                        value={item.toBe} 
                                        onChange={e => handleUpdateArray('asIsToBe', item.id, 'toBe', e.target.value)} 
                                        className="w-full bg-transparent outline-none text-emerald-900 font-bold placeholder-emerald-800/30 text-xs resize-none h-20 leading-relaxed" 
                                        placeholder="Deskripsikan peningkatan fitur atau otomasi..."
                                    />
                                </td>
                                <td className="p-4 text-center align-top pt-5">
                                    <button onClick={() => handleRemoveArray('asIsToBe', item.id)} className="p-2 rounded-lg hover:bg-rose-50 transition-all">
                                        <Trash2 className="w-4 h-4 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {project.asIsToBe?.length === 0 && (
                <div className="p-12 text-center bg-slate-50 rounded-b-xl border-t border-dashed">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Belum ada data perbandingan As-Is & To-Be.</p>
                </div>
            )}
        </div>

        {/* 3. KEBUTUHAN FUNGSIONAL */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><LayoutList className="w-5 h-5 text-indigo-600"/> 3. Kebutuhan Fungsional</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-300">
                        <tr>
                            <th className="p-3 w-12 text-center">No</th>
                            <th className="p-3 w-1/3">Fungsi / Kode</th>
                            <th className="p-3">Deskripsi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {(project.kebutuhanFungsional || []).map((item: any, idx: number) => (
                            <tr key={item.id}>
                                <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                                <td className="p-3 font-mono text-xs text-blue-600 font-bold bg-slate-50">{item.id}</td>
                                <td className="p-3 text-slate-800">{item.deskripsi}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 4. KEBUTUHAN NON-FUNGSIONAL */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><Shield className="w-5 h-5 text-amber-600"/> 4. Kebutuhan Non-Fungsional</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-300">
                        <tr>
                            <th className="p-3 w-12 text-center">No</th>
                            <th className="p-3 w-1/3">Kategori</th>
                            <th className="p-3">Deskripsi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {(project.kebutuhanNonFungsional || []).map((item: any, idx: number) => (
                            <tr key={item.id}>
                                <td className="p-3 text-center font-bold text-slate-500">{idx + 1}</td>
                                <td className="p-3 font-bold text-slate-700 bg-slate-50">{item.kategori}</td>
                                <td className="p-3 text-slate-800">{item.deskripsi}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 5. SPESIFIKASI AKTOR */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><User className="w-5 h-5 text-teal-600"/> 5. Spesifikasi Aktor</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-bold border-b border-slate-300">
                        <tr>
                            <th className="p-3 w-24">Kode Aktor</th>
                            <th className="p-3 w-1/4">Nama Aktor</th>
                            <th className="p-3">Deskripsi</th>
                            <th className="p-3 w-32 bg-amber-50 text-center border-l border-amber-100">Unadjusted Actor Weight (UAW)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {(project.actors || []).map((item: any) => {
                             const complexity = getActorComplexity(item.type);
                             return (
                                <tr key={item.id}>
                                    <td className="p-3 font-mono text-xs text-slate-500">ACT-{item.id}</td>
                                    <td className="p-3 font-bold text-slate-700">{item.name}</td>
                                    <td className="p-3">
                                        <input value={item.desc || ''} onChange={e => handleUpdateArray('actors', item.id, 'desc', e.target.value)} className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400" placeholder="Deskripsi peran aktor..."/>
                                    </td>
                                    <td className="p-3 text-center font-bold bg-amber-50/50 border-l border-amber-50 text-slate-800">{complexity.weight}</td>
                                </tr>
                             );
                        })}
                        <tr className="bg-slate-700 text-white font-bold">
                            <td colSpan={3} className="p-3 text-right text-xs uppercase">Total UAW</td>
                            <td className="p-3 text-center text-amber-400">{calc.uaw}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* 6. USE CASE DIAGRAM DAN DESKRIPSI */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><GitGraph className="w-5 h-5 text-pink-600"/> 6. Use Case Diagram dan Deskripsi</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 uppercase font-bold border-b border-slate-300">
                        <tr>
                            <th className="p-3 w-20">Kode UC</th>
                            <th className="p-3 w-48">Nama UC</th>
                            <th className="p-3 w-20">Prioritas</th>
                            <th className="p-3 w-24">Aktor</th>
                            <th className="p-3 w-32">Kondisi Awal</th>
                            <th className="p-3 w-32">Kondisi Akhir</th>
                            <th className="p-3 w-48">Alur Utama</th>
                            <th className="p-3 w-48">Alur Alternatif</th>
                            <th className="p-3 w-24 bg-amber-50 text-center border-l border-amber-100">UUCW</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {(project.useCases || []).map((uc: any) => {
                             const complexity = getUseCaseComplexity(uc.transactions);
                             return (
                                <tr key={uc.id} className="hover:bg-slate-50">
                                    <td className="p-2 font-mono text-slate-500">UC-{uc.id}</td>
                                    <td className="p-2 font-bold text-slate-800">{uc.name}</td>
                                    <td className="p-2"><input value={uc.priority || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'priority', e.target.value)} className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400" placeholder="High"/></td>
                                    <td className="p-2"><input value={uc.actorRef || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'actorRef', e.target.value)} className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400" placeholder="Actor"/></td>
                                    <td className="p-2"><textarea value={uc.preCond || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'preCond', e.target.value)} className="w-full bg-transparent outline-none resize-none h-10 text-slate-800 placeholder-slate-400" placeholder="-"/></td>
                                    <td className="p-2"><textarea value={uc.postCond || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'postCond', e.target.value)} className="w-full bg-transparent outline-none resize-none h-10 text-slate-800 placeholder-slate-400" placeholder="-"/></td>
                                    <td className="p-2"><textarea value={uc.mainFlow || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'mainFlow', e.target.value)} className="w-full bg-transparent outline-none resize-none h-16 text-blue-700 font-medium placeholder-blue-300" placeholder="-"/></td>
                                    <td className="p-2"><textarea value={uc.altFlow || ''} onChange={e => handleUpdateArray('useCases', uc.id, 'altFlow', e.target.value)} className="w-full bg-transparent outline-none resize-none h-16 text-rose-700 font-medium placeholder-rose-300" placeholder="-"/></td>
                                    <td className="p-2 text-center font-bold bg-amber-50/50 border-l border-amber-50 text-slate-800">{complexity.weight}</td>
                                </tr>
                             );
                        })}
                        <tr className="bg-slate-700 text-white font-bold">
                            <td colSpan={8} className="p-3 text-right uppercase">Total UUCW</td>
                            <td className="p-3 text-center text-amber-400">{calc.uucw}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {/* 7. USE CASE POINT (TCF & EF) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><Calculator className="w-5 h-5 text-orange-600"/> 7. Use Case Point Calculation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* TCF TABLE */}
                <div>
                     <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Technical Complexity Factor (TCF)</h4>
                     <table className="w-full text-xs border border-slate-300">
                         <thead className="bg-yellow-200 text-slate-800 font-bold">
                             <tr>
                                 <th className="p-2 text-left">Factor</th>
                                 <th className="p-2 w-10 text-center">Weight</th>
                                 <th className="p-2 w-10 text-center">Score</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-200">
                             {TCF_FACTORS.map(f => (
                                 <tr key={f.id}>
                                     <td className="p-1 px-2 text-slate-700">{f.id} - {f.name}</td>
                                     <td className="p-1 text-center bg-slate-50 text-slate-700">{f.weight}</td>
                                     <td className="p-1 text-center font-bold text-slate-900">{(project.tcfImpacts?.[f.id] || 3).toFixed(2)}</td>
                                 </tr>
                             ))}
                             <tr className="bg-slate-100 font-bold border-t border-slate-400">
                                 <td className="p-2 text-right text-slate-700">TCF Value (0.6 + (0.01 * Total))</td>
                                 <td colSpan={2} className="p-2 text-center text-blue-600 text-sm">{calc.tcf.toFixed(3)}</td>
                             </tr>
                         </tbody>
                     </table>
                </div>

                {/* EF TABLE */}
                <div>
                     <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Environmental Factor (EF)</h4>
                     <table className="w-full text-xs border border-slate-300">
                         <thead className="bg-blue-800 text-white font-bold">
                             <tr>
                                 <th className="p-2 text-left">Factor</th>
                                 <th className="p-2 w-10 text-center">Weight</th>
                                 <th className="p-2 w-10 text-center">Score</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-200">
                             {EF_FACTORS.map(f => (
                                 <tr key={f.id}>
                                     <td className="p-1 px-2 text-slate-700">{f.id} - {f.name}</td>
                                     <td className="p-1 text-center bg-slate-50 text-slate-700">{f.weight}</td>
                                     <td className="p-1 text-center font-bold text-slate-900">{(project.efImpacts?.[f.id] || 3).toFixed(2)}</td>
                                 </tr>
                             ))}
                             <tr className="bg-slate-100 font-bold border-t border-slate-400">
                                 <td className="p-2 text-right text-slate-700">EF Value (1.4 + (-0.03 * Total))</td>
                                 <td colSpan={2} className="p-2 text-center text-emerald-600 text-sm">{calc.ef.toFixed(3)}</td>
                             </tr>
                         </tbody>
                     </table>

                     <div className="mt-6 bg-slate-50 p-4 rounded border border-slate-200">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-slate-600">UUCP (UUCW + UAW)</span>
                            <span className="font-mono font-bold text-slate-800">{calc.uucp}</span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-1 mt-1">
                            <span className="text-sm font-black text-slate-800">Total UCP (UUCP * TCF * EF)</span>
                            <span className="font-mono text-xl font-black text-blue-600">{calc.ucp.toFixed(2)}</span>
                        </div>
                     </div>
                </div>
            </div>
        </div>

        {/* 8. MAN MONTH */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800"><Calendar className="w-5 h-5 text-green-600"/> 8. Man Month Estimation</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-center border-collapse border border-slate-300">
                    <thead className="bg-slate-800 text-white uppercase text-xs">
                        <tr>
                            <th className="p-3 border border-slate-600">UCP</th>
                            <th className="p-3 border border-slate-600">Person-Hours Multiplier (PHM)</th>
                            <th className="p-3 border border-slate-600">Total Person-Hours</th>
                            <th className="p-3 border border-slate-600 bg-emerald-700">Man Month (MM)</th>
                            <th className="p-3 border border-slate-600">Estimasi Lama Pengerjaan</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="font-bold text-lg text-slate-700">
                            <td className="p-4 border border-slate-300 text-slate-800">{calc.ucp.toFixed(2)}</td>
                            <td className="p-4 border border-slate-300 text-slate-800">{project.phm}</td>
                            <td className="p-4 border border-slate-300 text-amber-600">{calc.totalPersonHours?.toFixed(0) || '0'} Jam</td>
                            <td className="p-4 border border-slate-300 bg-emerald-50 text-emerald-700 text-2xl">{calc.totalManMonths?.toFixed(2) || '0.00'}</td>
                            <td className="p-4 border border-slate-300 text-blue-600">~ {Math.ceil(calc.totalManMonths || 0)} Bulan</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
}
