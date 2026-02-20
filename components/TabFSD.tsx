import React from 'react';
import { 
    Layout, Lock, Share2, Plus, Trash2, Monitor, 
    Workflow, Layers, Database, FileJson, ShieldCheck, Globe
} from 'lucide-react';

interface TabFSDProps {
    project: any;
    setProject: (project: any) => void;
    uploadedFile: string | null;
    handleUpdateArray: (arrayName: string, id: string | number, field: string, value: any) => void;
    handleAddArray: (arrayName: string, newItem: any) => void;
    handleRemoveArray: (arrayName: string, id: string | number) => void;
}

export const TabFSD: React.FC<TabFSDProps> = ({ 
    project, setProject, handleUpdateArray, handleAddArray, handleRemoveArray 
}) => {

    const diagramTypes = [
        { key: 'Use Case Diagram', icon: Workflow },
        { key: 'Activity Diagram', icon: Share2 },
        { key: 'Class Diagram', icon: Layers },
        { key: 'ERD', icon: Database },
        { key: 'API Contract', icon: FileJson }
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-12 text-slate-800">
            {/* 1. MOCKUP & UI SECTION */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
                    <Monitor className="w-5 h-5 text-blue-600"/> 1. Mockup & User Interface
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Link Mockup (Figma / Adobe XD)</label>
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                            <Globe className="w-4 h-4 text-slate-400" />
                            <input 
                                value={project.fsdMockups?.[0]?.link || ''} 
                                onChange={e => {
                                    const current = project.fsdMockups || [{ id: 1, name: 'Main Mockup', link: '' }];
                                    const updated = [...current];
                                    updated[0] = { ...updated[0], link: e.target.value };
                                    setProject({ ...project, fsdMockups: updated });
                                }}
                                className="bg-transparent border-none outline-none w-full text-sm font-medium text-blue-600 placeholder-slate-300"
                                placeholder="https://www.figma.com/file/..."
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Mockup Description</label>
                        <textarea 
                            value={project.fsdMockups?.[0]?.description || ''} 
                            onChange={e => {
                                const current = project.fsdMockups || [{ id: 1, name: 'Main Mockup', description: '' }];
                                const updated = [...current];
                                updated[0] = { ...updated[0], description: e.target.value };
                                setProject({ ...project, fsdMockups: updated });
                            }}
                            className="w-full p-3 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 text-slate-700"
                            placeholder="Explain the UI structure and key user journeys..."
                        />
                    </div>
                </div>
            </div>

            {/* 2. ACCESS RIGHTS MATRIX (CRUD) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Lock className="w-5 h-5 text-amber-600"/> 2. Access Rights Matrix (CRUD)
                    </h3>
                    <button 
                        onClick={() => handleAddArray('fsdAccessRights', { id: `ar_${Date.now()}`, role: '', feature: '', c: false, r: true, u: false, d: false })}
                        className="text-xs bg-amber-50 text-amber-600 hover:bg-amber-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all"
                    >
                        <Plus className="w-3 h-3"/> Add Row
                    </button>
                </div>
                <div className="overflow-x-auto border rounded-xl">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-widest font-black">
                            <tr>
                                <th className="p-4 w-1/4">User Role</th>
                                <th className="p-4 w-1/4">Feature Name</th>
                                <th className="p-4 text-center">Create</th>
                                <th className="p-4 text-center">Read</th>
                                <th className="p-4 text-center">Update</th>
                                <th className="p-4 text-center">Delete</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(project.fsdAccessRights || []).map((item: any) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3">
                                        <input 
                                            value={item.role} 
                                            onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'role', e.target.value)}
                                            className="w-full bg-transparent border-none outline-none font-bold text-slate-700 placeholder-slate-300"
                                            placeholder="e.g. Administrator"
                                        />
                                    </td>
                                    <td className="p-3">
                                        <input 
                                            value={item.feature} 
                                            onChange={e => handleUpdateArray('fsdAccessRights', item.id, 'feature', e.target.value)}
                                            className="w-full bg-transparent border-none outline-none text-slate-600 placeholder-slate-300"
                                            placeholder="e.g. Master Data"
                                        />
                                    </td>
                                    {['c', 'r', 'u', 'd'].map(perm => (
                                        <td key={perm} className="p-3 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={item[perm]} 
                                                onChange={e => handleUpdateArray('fsdAccessRights', item.id, perm, e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                            />
                                        </td>
                                    ))}
                                    <td className="p-3">
                                        <button onClick={() => handleRemoveArray('fsdAccessRights', item.id)} className="p-1 hover:bg-rose-50 rounded transition-colors group">
                                            <Trash2 className="w-4 h-4 text-slate-300 group-hover:text-rose-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. TECHNICAL DIAGRAMS */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-2 text-slate-800">
                    <ShieldCheck className="w-5 h-5 text-emerald-600"/> 3. Technical Architecture Diagrams
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {diagramTypes.map(({ key, icon: Icon }) => (
                        <div key={key} className="space-y-1.5 group">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                                <Icon className="w-3.5 h-3.5" /> {key}
                            </label>
                            <input 
                                value={project.fsdDesign?.find((d: any) => d.item === key)?.link || ''}
                                onChange={e => {
                                    const current = project.fsdDesign || [];
                                    const idx = current.findIndex((d: any) => d.item === key);
                                    let updated;
                                    if (idx > -1) {
                                        updated = current.map((d: any, i: number) => i === idx ? { ...d, link: e.target.value } : d);
                                    } else {
                                        updated = [...current, { id: Date.now(), item: key, pic: 'System Architect', link: e.target.value }];
                                    }
                                    setProject({ ...project, fsdDesign: updated });
                                }}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-blue-600 placeholder-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Enter Diagram Link (Draw.io / Gliffy)..."
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};