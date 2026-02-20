
import React from 'react';
import { Flag, Plus, Trash2, PenTool, Stamp } from 'lucide-react';

interface TabCharterProps {
    project: any;
    setProject: (project: any) => void;
    calc: any;
}

export const TabCharter: React.FC<TabCharterProps> = ({ project, setProject, calc }) => {

  const handleUpdateCharter = (field: string, value: any) => {
      setProject((prev: any) => ({
          ...prev,
          charter: {
              ...prev.charter,
              [field]: value
          }
      }));
  };

  const updateTimeline = (id: number, field: string, value: string) => {
      const newTimeline = (project.charter?.timeline || []).map((item: any) => 
          item.id === id ? { ...item, [field]: value } : item
      );
      handleUpdateCharter('timeline', newTimeline);
  };

  const handleAddTimeline = () => {
      const current = project.charter?.timeline || [];
      const newId = current.length > 0 ? Math.max(...current.map((t:any) => t.id)) + 1 : 1;
      const newItem = {
          id: newId,
          milestone: "Milestone Baru",
          start: "",
          end: "",
          note: ""
      };
      const newTimeline = [...current, newItem];
      handleUpdateCharter('timeline', newTimeline);
  };

  const handleRemoveTimeline = (id: number) => {
      const newTimeline = (project.charter?.timeline || []).filter((item: any) => item.id !== id);
      handleUpdateCharter('timeline', newTimeline);
  };

  const updateTeam = (id: number, field: string, value: string) => {
      const newTeam = (project.charter?.team || []).map((item: any) => 
          item.id === id ? { ...item, [field]: value } : item
      );
      handleUpdateCharter('team', newTeam);
  };

  // Helper for Signature Updates
  const updateSignature = (type: 'preparedBy' | 'approvedBy', field: string, value: string) => {
      setProject((prev: any) => ({
          ...prev,
          signatures: {
              ...prev.signatures,
              [type]: {
                  ...prev.signatures?.[type],
                  [field]: value
              }
          }
      }));
  };

  const updateSignatureDate = (value: string) => {
      setProject((prev: any) => ({
          ...prev,
          signatures: {
              ...prev.signatures,
              date: value
          }
      }));
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20 text-slate-800 dark:text-slate-200">
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-4 rounded-xl flex gap-4 items-start">
            <Flag className="w-6 h-6 text-orange-600 dark:text-orange-400 mt-1" />
            <div>
                <h3 className="font-bold text-orange-900 dark:text-orange-100 flex items-center gap-2">Project Charter</h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">Dokumen definisi awal proyek yang mengesahkan keberadaan proyek dan memberikan wewenang kepada manajer proyek.</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            
            {/* 1. LINGKUP DAN JADWAL PROYEK */}
            <div className="bg-slate-700 text-white p-3 font-bold uppercase text-sm">Lingkup dan Jadwal Proyek</div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {/* Scope */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Scope (In-Scope)</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 transition-colors text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 leading-relaxed resize-none"
                            value={project.charter?.scope || ''}
                            onChange={(e) => handleUpdateCharter('scope', e.target.value)}
                            placeholder="Definisikan ruang lingkup utama proyek..."
                        />
                    </div>
                </div>
                {/* Out of Scope */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Out of Scope</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-24 p-3 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 transition-colors text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 leading-relaxed resize-none"
                            value={project.charter?.outOfScope || ''}
                            onChange={(e) => handleUpdateCharter('outOfScope', e.target.value)}
                            placeholder="Apa yang TIDAK termasuk dalam proyek ini..."
                        />
                    </div>
                </div>
                {/* Timeline */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm flex flex-col justify-between">
                         <span>Timeline Tentative</span>
                         <button onClick={handleAddTimeline} className="mt-2 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit transition-colors"><Plus className="w-3 h-3"/> Tambah</button>
                    </div>
                    <div className="p-4 flex-1 overflow-x-auto">
                        <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-700">
                            <thead className="bg-[#002f5b] text-white uppercase">
                                <tr>
                                    <th className="p-2 w-8 text-center">No</th>
                                    <th className="p-2">Key Milestone</th>
                                    <th className="p-2 w-32 text-center">Start</th>
                                    <th className="p-2 w-32 text-center">End</th>
                                    <th className="p-2">Keterangan</th>
                                    <th className="p-2 w-8"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {(project.charter?.timeline || []).map((item: any, idx: number) => (
                                    <tr key={item.id}>
                                        <td className="p-2 text-center text-slate-600 dark:text-slate-400">{idx + 1}</td>
                                        <td className="p-2">
                                            <input 
                                                value={item.milestone} 
                                                onChange={e => updateTimeline(item.id, 'milestone', e.target.value)} 
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-1 rounded font-medium text-slate-800 dark:text-slate-200 focus:border-blue-500 outline-none" 
                                                placeholder="Nama Milestone..."
                                            />
                                        </td>
                                        <td className="p-2"><input type="date" value={item.start} onChange={e => updateTimeline(item.id, 'start', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-1 rounded text-slate-800 dark:text-slate-200" /></td>
                                        <td className="p-2"><input type="date" value={item.end} onChange={e => updateTimeline(item.id, 'end', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-1 rounded text-slate-800 dark:text-slate-200" /></td>
                                        <td className="p-2"><input value={item.note} onChange={e => updateTimeline(item.id, 'note', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-1 rounded text-slate-800 dark:text-slate-200" placeholder="-" /></td>
                                        <td className="p-2 text-center"><button onClick={() => handleRemoveTimeline(item.id)} className="text-slate-300 hover:text-rose-500 transition-colors"><Trash2 className="w-4 h-4"/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* 2. SUMBER DAYA DAN BIAYA PROYEK */}
            <div className="bg-slate-500 text-white p-3 font-bold uppercase text-sm border-t border-slate-300 dark:border-slate-600">Sumber Daya dan Biaya Proyek</div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {/* Tim Proyek */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Tim Proyek Pengembang</div>
                    <div className="p-4 flex-1 overflow-x-auto">
                         <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-700">
                            <thead className="bg-[#002f5b] text-white uppercase">
                                <tr>
                                    <th className="p-2 w-8 text-center">No</th>
                                    <th className="p-2 w-48">Nama / NIP</th>
                                    <th className="p-2 w-40">Peran</th>
                                    <th className="p-2">Tugas dan Kewenangan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {(project.charter?.team || []).map((item: any, idx: number) => (
                                    <tr key={item.id}>
                                        <td className="p-2 text-center text-slate-600 dark:text-slate-400">{idx + 1}</td>
                                        <td className="p-2"><input value={item.name} onChange={e => updateTeam(item.id, 'name', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-1 rounded font-bold text-slate-800 dark:text-slate-200" placeholder="Nama..." /></td>
                                        <td className="p-2 text-slate-800 dark:text-slate-300">{item.role}</td>
                                        <td className="p-2"><input value={item.responsibility} onChange={e => updateTeam(item.id, 'responsibility', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-1 rounded text-slate-800 dark:text-slate-200" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Kebutuhan Pendukung */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm text-rose-600">Kebutuhan Pendukung</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-16 p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 transition-colors text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                            value={project.charter?.supportingReqs || ''}
                            onChange={(e) => handleUpdateCharter('supportingReqs', e.target.value)}
                            placeholder="Hardware, Software licenses, Server specs..."
                        />
                    </div>
                </div>
                {/* Kebutuhan Khusus */}
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm text-rose-600">Kebutuhan Khusus</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-16 p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 transition-colors text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                            value={project.charter?.specialReqs || ''}
                            onChange={(e) => handleUpdateCharter('specialReqs', e.target.value)}
                            placeholder="Security Clearance, VPN Access, etc..."
                        />
                    </div>
                </div>
            </div>

            {/* 3. MANFAAT DAN PENGAMPU PROSES BISNIS */}
            <div className="bg-slate-500 text-white p-3 font-bold uppercase text-sm border-t border-slate-300 dark:border-slate-600">Manfaat dan Pengampu Proses Bisnis</div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Pengampu Proses Bisnis</div>
                    <div className="p-4 flex-1">
                        <input 
                            className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                            value={project.charter?.bizProcessOwner || ''}
                            onChange={(e) => handleUpdateCharter('bizProcessOwner', e.target.value)}
                            placeholder="Unit / Direktorat..."
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Pemangku Kepentingan</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-16 p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 italic bg-white dark:bg-slate-900"
                            value={project.charter?.stakeholders || ''}
                            onChange={(e) => handleUpdateCharter('stakeholders', e.target.value)}
                            placeholder="List stakeholders..."
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Pengguna Akhir/ User</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-16 p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                            value={project.charter?.endUsers || ''}
                            onChange={(e) => handleUpdateCharter('endUsers', e.target.value)}
                            placeholder="Siapa yang akan menggunakan sistem ini?"
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Manfaat yang diharapkan</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-24 p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                            value={project.charter?.benefits || ''}
                            onChange={(e) => handleUpdateCharter('benefits', e.target.value)}
                            placeholder="Kuantitatif atau Kualitatif..."
                        />
                    </div>
                </div>
            </div>

            {/* 4. RISIKO, KENDALA DAN ASUMSI PROYEK */}
            <div className="bg-slate-500 text-white p-3 font-bold uppercase text-sm border-t border-slate-300 dark:border-slate-600">Risiko, Kendala dan Asumsi Proyek</div>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Risiko</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-24 p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                            value={project.charter?.risks || ''}
                            onChange={(e) => handleUpdateCharter('risks', e.target.value)}
                            placeholder="Risiko utama proyek..."
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Kendala</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-24 p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                            value={project.charter?.constraints || ''}
                            onChange={(e) => handleUpdateCharter('constraints', e.target.value)}
                            placeholder="Batasan anggaran, waktu, sumber daya..."
                        />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 bg-[#fffaf0] dark:bg-slate-800 p-4 font-bold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 text-sm">Asumsi</div>
                    <div className="p-4 flex-1">
                        <textarea 
                            className="w-full h-24 p-2 border border-slate-300 dark:border-slate-600 rounded text-sm outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900"
                            value={project.charter?.assumptions || ''}
                            onChange={(e) => handleUpdateCharter('assumptions', e.target.value)}
                            placeholder="Asumsi yang mendasari perencanaan..."
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 5. SIGNATURES */}
        <div className="mt-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-10 rounded-2xl shadow-lg print:shadow-none print:border-none relative">
            {/* Watermark Decoration */}
            <div className="absolute top-4 right-4 opacity-5 pointer-events-none">
                <Stamp className="w-32 h-32 text-slate-900 dark:text-white" />
            </div>

            <h3 className="text-xl font-bold mb-10 text-center uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-4 flex items-center justify-center gap-3">
                <Stamp className="w-6 h-6 text-blue-900 dark:text-blue-400" />
                Lembar Pengesahan
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 px-8">
                {/* Prepared By */}
                <div className="flex flex-col items-center">
                    <p className="mb-2 text-sm font-bold text-slate-500 uppercase tracking-wide">Disiapkan Oleh</p>
                    <input 
                        value={project.signatures?.preparedBy?.role || 'Project Manager'} 
                        onChange={e => updateSignature('preparedBy', 'role', e.target.value)}
                        className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 bg-transparent border-none outline-none w-full mb-8"
                    />
                    
                    <div className="h-24 w-full border-b border-slate-300 dark:border-slate-600 mb-4 flex items-end justify-center">
                        <p className="text-xs text-slate-300 dark:text-slate-600 italic mb-2 select-none">( Tanda Tangan )</p>
                    </div>
                    
                    <input 
                        value={project.signatures?.preparedBy?.name || ''} 
                        onChange={e => updateSignature('preparedBy', 'name', e.target.value)}
                        className="text-center font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full text-lg"
                        placeholder="Nama Lengkap"
                    />
                    <div className="mt-1 flex justify-center items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <span>NIP.</span>
                        <input 
                            value={project.signatures?.preparedBy?.nip || ''} 
                            onChange={e => updateSignature('preparedBy', 'nip', e.target.value)}
                            className="bg-transparent border-none outline-none w-40 text-center"
                            placeholder="...................."
                        />
                    </div>
                </div>

                {/* Approved By */}
                <div className="flex flex-col items-center">
                    <p className="mb-2 text-sm font-bold text-slate-500 uppercase tracking-wide">Disetujui Oleh</p>
                    <input 
                        value={project.signatures?.approvedBy?.role || 'Direktur Teknis'} 
                        onChange={e => updateSignature('approvedBy', 'role', e.target.value)}
                        className="text-center text-sm font-medium text-slate-600 dark:text-slate-400 bg-transparent border-none outline-none w-full mb-8"
                    />
                    
                    <div className="h-24 w-full border-b border-slate-300 dark:border-slate-600 mb-4 flex items-end justify-center">
                        <p className="text-xs text-slate-300 dark:text-slate-600 italic mb-2 select-none">( Tanda Tangan )</p>
                    </div>
                    
                    <input 
                        value={project.signatures?.approvedBy?.name || ''} 
                        onChange={e => updateSignature('approvedBy', 'name', e.target.value)}
                        className="text-center font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-full text-lg"
                        placeholder="Nama Lengkap"
                    />
                    <div className="mt-1 flex justify-center items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                        <span>NIP.</span>
                        <input 
                            value={project.signatures?.approvedBy?.nip || ''} 
                            onChange={e => updateSignature('approvedBy', 'nip', e.target.value)}
                            className="bg-transparent border-none outline-none w-40 text-center"
                            placeholder="...................."
                        />
                    </div>
                </div>
            </div>
            
            <div className="mt-12 text-center">
                <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500">Jakarta, </span>
                    <input 
                        type="date"
                        value={project.signatures?.date ? new Date(project.signatures.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} 
                        onChange={e => updateSignatureDate(e.target.value)}
                        className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none"
                    />
                </div>
            </div>
        </div>
    </div>
  );
};
