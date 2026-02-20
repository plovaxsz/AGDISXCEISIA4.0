
import React, { useState } from 'react';
import { Target, Sparkles, FileText, AlertOctagon, TrendingUp, CheckSquare, Plus, Trash2, Zap, Network, Clock, Shield, Database, Lightbulb, ChevronRight } from 'lucide-react';

interface TabKajianProps {
  project: any;
  setProject: (project: any) => void;
  uploadedFile: string | null;
  handleUpdateArray: (arrayName: string, id: string, field: string, value: any) => void;
  handleAddArray: (arrayName: string, newItem: any) => void;
  handleRemoveArray: (arrayName: string, id: string) => void;
}

export const TabKajian: React.FC<TabKajianProps> = ({ 
    project, setProject, uploadedFile, 
    handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {

  const nfrSuggestions = [
    { cat: 'Performance', text: 'Response time < 1s for mission-critical API calls.', tag: 'Core' },
    { cat: 'Security', text: 'End-to-end encryption for data-at-rest and transit.', tag: 'Cyber' },
    { cat: 'Availability', text: '99.9% uptime with automated failover mechanism.', tag: 'Infra' },
    { cat: 'Scalability', text: 'Support for 2,000 concurrent institutional users.', tag: 'Growth' },
  ];

  const handleApplySuggestion = (sug: any) => {
    handleAddArray('kebutuhanNonFungsional', {
      id: `nfr_sug_${Date.now()}`,
      kategori: sug.cat,
      deskripsi: sug.text
    });
  };

  const handleSuggestNFR = () => {
      const standardNFRs = [
          { id: `nfr_sug_${Date.now()}_1`, kategori: 'Performance', deskripsi: 'Waktu muat halaman < 3 detik untuk 1000 user konkuren (High Traffic).' },
          { id: `nfr_sug_${Date.now()}_2`, kategori: 'Security', deskripsi: 'Implementasi Single Sign-On (SSO) Kemenkeu dan Enkripsi Data at Rest.' },
          { id: `nfr_sug_${Date.now()}_3`, kategori: 'Availability', deskripsi: 'SLA 99.5% dengan redundansi server (Active-Passive).' },
          { id: `nfr_sug_${Date.now()}_4`, kategori: 'Compliance', deskripsi: 'Sesuai dengan KMK Standar TIK dan Audit Keamanan Informasi.' }
      ];
      
      const current = project.kebutuhanNonFungsional || [];
      // @ts-ignore
      setProject(prev => ({
          ...prev,
          kebutuhanNonFungsional: [...current, ...standardNFRs]
      }));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 text-slate-800">
        {/* 1. INFORMASI UMUM */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800"><Target className="w-5 h-5 text-blue-600"/> 1. Informasi Umum Proyek</h3>
                {uploadedFile && <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-bold flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Assisted</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama Proyek / Modul</label>
                    <input value={project.nama || ''} onChange={e => setProject({...project, nama: e.target.value})} className="w-full p-2.5 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Unit Pengampu Bisnis Proses (Es. II)</label>
                    <input value={project.pengampu || ''} onChange={e => setProject({...project, pengampu: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Unit Penanggung Jawab TIK (Es. III/IV)</label>
                    <input value={project.unitPenanggungJawab || ''} onChange={e => setProject({...project, unitPenanggungJawab: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nama PIC</label>
                    <input value={project.namaPIC || ''} onChange={e => setProject({...project, namaPIC: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kontak PIC</label>
                    <input value={project.kontakPIC || ''} onChange={e => setProject({...project, kontakPIC: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none text-slate-800" />
                </div>
            </div>
        </div>

        {/* 2. LATAR BELAKANG & MASALAH */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2 text-slate-800"><FileText className="w-5 h-5 text-indigo-600"/> 2. Latar Belakang & Masalah</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Latar Belakang / Urgensi</label>
                        <textarea value={project.latarBelakang || ''} onChange={e => setProject({...project, latarBelakang: e.target.value})} className="w-full p-3 text-sm border rounded-lg bg-slate-50 h-24 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-rose-500 mb-1 flex items-center gap-1"><AlertOctagon className="w-3 h-3"/> Masalah atau Isu (Pain Points)</label>
                        <textarea value={project.masalahIsu || ''} onChange={e => setProject({...project, masalahIsu: e.target.value})} className="w-full p-3 text-sm border border-rose-200 rounded-lg bg-rose-50 h-24 focus:ring-2 focus:ring-rose-500 outline-none resize-none text-rose-900 font-medium" />
                    </div>
                </div>
            </div>

            {/* 3. TARGET & OUTCOME */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2 text-slate-800"><TrendingUp className="w-5 h-5 text-emerald-600"/> 3. Target & Business Value</h3>
                <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1/3">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Target Penyelesaian</label>
                          <input type="date" value={project.targetPenyelesaian || ''} onChange={e => setProject({...project, targetPenyelesaian: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800" />
                      </div>
                      <div className="w-2/3">
                          <label className="block text-xs font-bold text-slate-500 mb-1">Target Outcome</label>
                          <input value={project.targetOutcome || ''} onChange={e => setProject({...project, targetOutcome: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800" />
                      </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Outcome / Keluaran</label>
                        <textarea value={project.outcomeKeluaran || ''} onChange={e => setProject({...project, outcomeKeluaran: e.target.value})} className="w-full p-2 text-sm border rounded-lg bg-slate-50 h-16 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-slate-800" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-emerald-600 mb-1">Business Value</label>
                        <textarea value={project.businessValue || ''} onChange={e => setProject({...project, businessValue: e.target.value})} className="w-full p-2 text-sm border border-emerald-100 rounded-lg bg-emerald-50 h-16 focus:ring-2 focus:ring-emerald-500 outline-none resize-none text-emerald-900 font-medium" />
                    </div>
                </div>
            </div>
        </div>

        {/* 4. KEBUTUHAN FUNGSIONAL & NON-FUNGSIONAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-slate-700"><CheckSquare className="w-4 h-4 text-blue-500"/> Kebutuhan Fungsional</h3>
                  <button onClick={() => handleAddArray('kebutuhanFungsional', {id: `fr${Date.now()}`, deskripsi: '', prioritas: 'Mandatory'})} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded flex items-center gap-1"><Plus className="w-3 h-3"/> Add</button>
                </div>
                <div className="space-y-2 flex-1 max-h-[500px] overflow-y-auto pr-1">
                    {(project.kebutuhanFungsional || []).map((item: any) => (
                        <div key={item.id} className="flex gap-2 items-start group">
                            <textarea value={item.deskripsi} onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'deskripsi', e.target.value)} className="flex-1 p-2 text-xs border rounded bg-slate-50 outline-none resize-none text-slate-800" rows={2} />
                            <div className="flex flex-col gap-1">
                              <select value={item.prioritas} onChange={e => handleUpdateArray('kebutuhanFungsional', item.id, 'prioritas', e.target.value)} className="w-24 p-1 text-[10px] border rounded bg-slate-100 outline-none text-slate-800 font-bold"><option>Mandatory</option><option>Optional</option></select>
                              <button onClick={() => handleRemoveArray('kebutuhanFungsional', item.id)} className="text-rose-400 hover:text-rose-600 p-1 bg-rose-50 rounded"><Trash2 className="w-3 h-3 mx-auto"/></button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
             
             <div className="flex flex-col gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide text-slate-700"><Zap className="w-4 h-4 text-amber-500"/> Kebutuhan Non-Fungsional</h3>
                    <div className="flex gap-1">
                        <button onClick={handleSuggestNFR} className="text-xs bg-purple-50 text-purple-600 hover:bg-purple-100 px-2 py-1 rounded flex items-center gap-1 border border-purple-200"><Sparkles className="w-3 h-3"/> Suggest Full List</button>
                        <button onClick={() => handleAddArray('kebutuhanNonFungsional', {id: `nfr${Date.now()}`, kategori: 'Performance', deskripsi: ''})} className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 px-2 py-1 rounded flex items-center gap-1"><Plus className="w-3 h-3"/> Add</button>
                    </div>
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 mb-4">
                        {(project.kebutuhanNonFungsional || []).map((item: any) => (
                            <div key={item.id} className="flex gap-2 items-start group">
                                <div className="flex-1 flex flex-col gap-1">
                                <select value={item.kategori} onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'kategori', e.target.value)} className="w-full p-1 text-[10px] border rounded bg-slate-100 font-bold text-slate-700 outline-none"><option>Performance</option><option>Security</option><option>Availability</option><option>Reliability</option><option>Scalability</option><option>Compliance</option></select>
                                <textarea value={item.deskripsi} onChange={e => handleUpdateArray('kebutuhanNonFungsional', item.id, 'deskripsi', e.target.value)} className="w-full p-2 text-xs border rounded bg-slate-50 outline-none resize-none text-slate-800" rows={2} />
                                </div>
                                <button onClick={() => handleRemoveArray('kebutuhanNonFungsional', item.id)} className="mt-1 text-rose-400 hover:text-rose-600 p-1 bg-rose-50 rounded"><Trash2 className="w-3 h-3"/></button>
                            </div>
                        ))}
                    </div>

                    {/* Actionable Suggestions Panel */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <h4 className="text-[10px] font-black uppercase text-slate-500 mb-3 flex items-center gap-2"><Lightbulb className="w-3 h-3 text-yellow-500"/> Actionable Suggestions</h4>
                        <div className="grid grid-cols-1 gap-2">
                            {nfrSuggestions.map((sug, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => handleApplySuggestion(sug)}
                                    className="text-left p-2 rounded bg-white border border-slate-200 hover:border-blue-400 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">{sug.cat}</span>
                                        <span className="text-[10px] text-slate-600 truncate max-w-[200px]">{sug.text}</span>
                                    </div>
                                    <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors"/>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
        </div>

        {/* 5. ALUR BISNIS & BIA */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold mb-4 border-b pb-2 flex items-center gap-2 text-slate-800"><Network className="w-5 h-5 text-purple-600"/> 5. Alur Bisnis & Analisis Dampak (BIA)</h3>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Deskripsi Alur Bisnis Proses</label>
                        <textarea value={project.alurBisnisProses || ''} onChange={e => setProject({...project, alurBisnisProses: e.target.value})} className="w-full p-3 text-sm border rounded-lg bg-slate-50 h-32 focus:ring-2 focus:ring-purple-500 outline-none resize-none text-slate-800" placeholder="Jelaskan alur..." />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-2"><label className="block text-xs font-bold text-slate-500">Risiko Bisnis</label><button onClick={() => handleAddArray('risikoBisnis', {id: `r_${Date.now()}`, risk: '', impact: '', mitigasi: '', level: 'Sedang'})} className="text-[10px] text-blue-600 font-bold">+ Tambah</button></div>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 text-slate-500 uppercase"><tr><th className="p-2">Risiko</th><th className="p-2">Dampak</th><th className="p-2">Mitigasi</th><th className="p-2">Level</th><th className="p-2"></th></tr></thead>
                                <tbody className="divide-y">
                                    {(project.risikoBisnis || []).map((risk: any) => (
                                        <tr key={risk.id} className="hover:bg-slate-50">
                                            <td className="p-2"><input value={risk.risk} onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'risk', e.target.value)} className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400" placeholder="Risiko..."/></td>
                                            <td className="p-2"><input value={risk.impact} onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'impact', e.target.value)} className="w-full bg-transparent outline-none text-rose-700 placeholder-rose-300" placeholder="Dampak..."/></td>
                                            <td className="p-2"><input value={risk.mitigasi} onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'mitigasi', e.target.value)} className="w-full bg-transparent outline-none text-emerald-700 placeholder-emerald-300" placeholder="Mitigasi..."/></td>
                                            <td className="p-2"><select value={risk.level} onChange={e => handleUpdateArray('risikoBisnis', risk.id, 'level', e.target.value)} className="bg-transparent font-bold outline-none text-slate-800"><option>Tinggi</option><option>Sedang</option><option>Rendah</option></select></td>
                                            <td className="p-2"><button onClick={() => handleRemoveArray('risikoBisnis', risk.id)}><Trash2 className="w-3 h-3 text-rose-400"/></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-fit">
                    <h4 className="text-xs font-black uppercase text-slate-600 mb-3 border-b border-slate-200 pb-2 flex items-center gap-2"><Shield className="w-3 h-3"/> Resilience Targets (BIA)</h4>
                    <div className="space-y-4">
                        {/* RTO and RPO with improved styling */}
                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Recovery Time Objective (RTO)</label>
                            <select 
                                value={project.bia?.rto || '4 Hours'} 
                                onChange={(e) => setProject({...project, bia: { ...project.bia, rto: e.target.value }})} 
                                className="w-full text-xs p-2 border rounded bg-white text-slate-800 font-bold border-slate-200 shadow-sm focus:border-blue-500 outline-none"
                            >
                                <option value="1 Hour">1 Hour (Mission Critical)</option>
                                <option value="4 Hours">4 Hours (High Priority)</option>
                                <option value="24 Hours">24 Hours (Standard)</option>
                                <option value="48 Hours">48 Hours (Non-Essential)</option>
                                <option value="Best Effort">Best Effort</option>
                            </select>
                            <p className="text-[9px] text-slate-500 mt-1">Acceptable downtime for the institutional system.</p>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Recovery Point Objective (RPO)</label>
                            <select 
                                value={project.bia?.rpo || '24 Hours'} 
                                onChange={(e) => setProject({...project, bia: { ...project.bia, rpo: e.target.value }})} 
                                className="w-full text-xs p-2 border rounded bg-white text-slate-800 font-bold border-slate-200 shadow-sm focus:border-blue-500 outline-none"
                            >
                                <option value="0 Minutes">0 Min (Synchronous Mirroring)</option>
                                <option value="1 Hour">1 Hour (Near-Realtime)</option>
                                <option value="4 Hours">4 Hours (Incremental)</option>
                                <option value="24 Hours">24 Hours (Daily Backup)</option>
                                <option value="Last Backup">Last Valid Backup</option>
                            </select>
                            <p className="text-[9px] text-slate-500 mt-1">Acceptable data loss in terms of time.</p>
                        </div>

                        <div className="border-t border-slate-200 my-2 pt-4">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Impact Assessments</h5>
                            <div className="space-y-2">
                                {['operasional', 'finansial', 'reputasi', 'hukum'].map(key => (
                                    <div key={key} className="flex justify-between items-center bg-white p-1 px-2 rounded border border-slate-100">
                                        <span className="text-[10px] font-medium text-slate-500 capitalize">{key}</span>
                                        <select 
                                        value={(project.bia as any)?.[key] || 'Low'} 
                                        onChange={(e) => setProject({...project, bia: { ...project.bia, [key]: e.target.value }})} 
                                        className={`text-[10px] font-bold p-0.5 rounded border-none outline-none w-20 cursor-pointer
                                            ${(project.bia as any)?.[key] === 'Critical' ? 'text-rose-600' : 
                                                (project.bia as any)?.[key] === 'High' ? 'text-orange-600' : 
                                                (project.bia as any)?.[key] === 'Medium' ? 'text-amber-600' : 
                                                'text-blue-600'}
                                        `}
                                        >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                        <option value="Critical">Critical</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
    </div>
  );
};
