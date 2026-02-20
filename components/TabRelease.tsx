import React from 'react';
import { 
    Ship, CheckCircle2, BarChart3, FileText, 
    Calendar, Hash, ExternalLink, ShieldAlert, ShieldCheck, XCircle
} from 'lucide-react';

interface TabReleaseProps {
    project: any;
    setProject: (project: any) => void;
}

export const TabRelease: React.FC<TabReleaseProps> = ({ project, setProject }) => {

    const updateRelease = (field: string, value: any) => {
        setProject({
            ...project,
            release: {
                ...(project.release || {}),
                [field]: value
            }
        });
    };

    const toggleSecurityItem = (item: string) => {
        const current = project.release?.securityChecklist || {
            sqlInjection: false,
            xss: false,
            brokenAuth: false,
            insecureDeserialization: false,
            weakCrypto: false
        };
        updateRelease('securityChecklist', {
            ...current,
            [item]: !current[item]
        });
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12 text-slate-800">
            {/* HEADER */}
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl flex gap-4 items-start shadow-sm">
                <Ship className="w-6 h-6 text-indigo-600 mt-1" />
                <div>
                    <h3 className="font-bold text-indigo-900">Release & User Acceptance Testing (UAT)</h3>
                    <p className="text-sm text-indigo-700">Track deployment versions, testing results, and security compliance before go-live.</p>
                </div>
            </div>

            {/* 1. DEPLOYMENT INFORMATION */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 text-slate-800">
                    <Hash className="w-5 h-5 text-slate-400"/> 1. Deployment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Version Number</label>
                        <input 
                            value={project.release?.version || ''} 
                            onChange={e => updateRelease('version', e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-700" 
                            placeholder="e.g. v1.0.0-stable"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Deployment Date</label>
                        <input 
                            type="date"
                            value={project.release?.date || ''} 
                            onChange={e => updateRelease('date', e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700" 
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Changelog Link</label>
                        <input 
                            value={project.release?.changelogLink || ''} 
                            onChange={e => updateRelease('changelogLink', e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-blue-600" 
                            placeholder="https://gitlab.com/..."
                        />
                    </div>
                </div>
            </div>

            {/* 2. UAT RESULTS SUMMARY */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-2 text-slate-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600"/> 2. UAT Results Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Passed Scenarios</span>
                        <input 
                            type="number"
                            value={project.release?.uatPassed || 0}
                            onChange={e => updateRelease('uatPassed', parseInt(e.target.value) || 0)}
                            className="text-4xl font-black bg-transparent border-none text-center outline-none w-20 text-emerald-700"
                        />
                    </div>
                    <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Failed Scenarios</span>
                        <input 
                            type="number"
                            value={project.release?.uatFailed || 0}
                            onChange={e => updateRelease('uatFailed', parseInt(e.target.value) || 0)}
                            className="text-4xl font-black bg-transparent border-none text-center outline-none w-20 text-rose-700"
                        />
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl flex flex-col items-center text-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Scenarios</span>
                        <input 
                            type="number"
                            value={project.release?.uatTotal || 0}
                            onChange={e => updateRelease('uatTotal', parseInt(e.target.value) || 0)}
                            className="text-4xl font-black bg-transparent border-none text-center outline-none w-20 text-slate-600"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">UAT Executive Conclusion</label>
                    <textarea 
                        value={project.release?.uatConclusion || ''} 
                        onChange={e => updateRelease('uatConclusion', e.target.value)}
                        className="w-full p-4 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none h-28 leading-relaxed text-slate-700"
                        placeholder="Provide a final summary of the testing phase..."
                    />
                </div>
            </div>

            {/* 3. SECURITY CHECKLIST */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b pb-2 text-slate-800">
                    <ShieldAlert className="w-5 h-5 text-rose-600"/> 3. Vulnerability Assessment Checklist
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        {[
                            { key: 'sqlInjection', label: 'SQL Injection Prevention' },
                            { key: 'xss', label: 'Cross-Site Scripting (XSS) Mitigation' },
                            { key: 'brokenAuth', label: 'Broken Authentication Controls' },
                            { key: 'insecureDeserialization', label: 'Insecure Deserialization Check' },
                            { key: 'weakCrypto', label: 'Cryptographic Failure Audit' }
                        ].map(item => (
                            <label key={item.key} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-100">
                                <span className="text-sm font-bold text-slate-600">{item.label}</span>
                                <input 
                                    type="checkbox"
                                    checked={project.release?.securityChecklist?.[item.key] || false}
                                    onChange={() => toggleSecurityItem(item.key)}
                                    className="w-5 h-5 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                />
                            </label>
                        ))}
                    </div>
                    <div className="bg-slate-900 rounded-2xl p-6 flex flex-col justify-center border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <ShieldCheck className="absolute top-4 right-4 w-12 h-12 text-emerald-500 opacity-10 group-hover:scale-110 transition-transform" />
                        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                             Jira Security Report
                        </h4>
                        <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">
                            Ensure all high and critical vulnerabilities from the automated scan are resolved. Link the formal Jira Security report below.
                        </p>
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2 border border-slate-700">
                            <ExternalLink className="w-4 h-4 text-blue-400" />
                            <input 
                                value={project.release?.jiraSecurityLink || ''} 
                                onChange={e => updateRelease('jiraSecurityLink', e.target.value)}
                                className="bg-transparent border-none outline-none text-xs text-blue-300 w-full font-mono" 
                                placeholder="Paste Jira Issue URL..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};