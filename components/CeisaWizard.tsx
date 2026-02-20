import React, { useState, useEffect, useMemo } from 'react';
import { ProjectData } from '../types';
import { TabKajian } from './TabKajian';
import { TabResearch } from './TabResearch';
import { TabBRD } from './TabBRD';
import { TabFSD } from './TabFSD';
import { TabCharter } from './TabCharter';
import { TabRelease } from './TabRelease';
import { TCF_FACTORS, EF_FACTORS } from '../constants';
import { ClipboardList, FileCheck, Code2, Flag, Ship, Microscope } from 'lucide-react';

interface CeisaWizardProps {
    data: ProjectData;
    onUpdate: (data: ProjectData) => void;
    defaultTab?: 'KAJIAN' | 'RESEARCH' | 'BRD' | 'FSD' | 'CHARTER' | 'RELEASE';
}

const CeisaWizard: React.FC<CeisaWizardProps> = ({ data, onUpdate, defaultTab = 'KAJIAN' }) => {
    const [activeTab, setActiveTab] = useState<'KAJIAN' | 'RESEARCH' | 'BRD' | 'FSD' | 'CHARTER' | 'RELEASE'>(defaultTab as any);

    // Sync tab with external navigation
    useEffect(() => {
        if (defaultTab) setActiveTab(defaultTab as any);
    }, [defaultTab]);

    // --- UCP CALCULATOR LOGIC ---
    const calc = useMemo(() => {
        const actors = data.actors || [];
        const useCases = data.useCases || [];
        const tcfImpacts = data.tcfImpacts || {};
        const efImpacts = data.efImpacts || {};
        const phm = data.phm || 20;

        let uaw = 0;
        actors.forEach(a => {
            if (a.type === 'Simple') uaw += 1;
            else if (a.type === 'Average') uaw += 2;
            else uaw += 3;
        });

        let uucw = 0;
        useCases.forEach(uc => {
            if (uc.transactions <= 3) uucw += 5;
            else if (uc.transactions <= 7) uucw += 10;
            else uucw += 15;
        });

        let totalTcfScore = 0;
        TCF_FACTORS.forEach(f => {
            const val = tcfImpacts[f.id] !== undefined ? tcfImpacts[f.id] : 3;
            totalTcfScore += (val * f.weight);
        });
        const tcf = 0.6 + (0.01 * totalTcfScore);

        let totalEfScore = 0;
        EF_FACTORS.forEach(f => {
            const val = efImpacts[f.id] !== undefined ? efImpacts[f.id] : 3;
            totalEfScore += (val * f.weight);
        });
        const ef = 1.4 + (-0.03 * totalEfScore);

        const uucp = uaw + uucw;
        const ucp = uucp * tcf * ef;
        const totalPersonHours = ucp * phm;
        const totalManMonths = totalPersonHours / 176;

        return { uaw, uucw, uucp, tcf, ef, ucp, totalPersonHours, totalManMonths };
    }, [data]);

    const setProject = (newData: any) => onUpdate(newData);

    const handleUpdateArray = (arrayName: string, id: string | number, field: string, value: any) => {
        // @ts-ignore
        const currentArray = data[arrayName] || [];
        const newArray = currentArray.map((item: any) => 
            item.id === id ? { ...item, [field]: value } : item
        );
        onUpdate({ ...data, [arrayName]: newArray });
    };

    const handleAddArray = (arrayName: string, newItem: any) => {
        // @ts-ignore
        const currentArray = data[arrayName] || [];
        onUpdate({ ...data, [arrayName]: [...currentArray, newItem] });
    };

    const handleRemoveArray = (arrayName: string, id: string | number) => {
        // @ts-ignore
        const currentArray = data[arrayName] || [];
        onUpdate({ ...data, [arrayName]: currentArray.filter((item: any) => item.id !== id) });
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* IN-WIZARD NAVIGATION TABS */}
            <div className="flex bg-white/40 dark:bg-slate-900/40 p-1.5 rounded-2xl gap-1 border border-slate-200 dark:border-slate-800 mb-8 backdrop-blur-md sticky top-0 z-20 shadow-sm overflow-x-auto">
                {[
                    { id: 'KAJIAN', label: '1. Kajian (TOR)', icon: ClipboardList },
                    { id: 'RESEARCH', label: '2. Penelitian', icon: Microscope },
                    { id: 'BRD', label: '3. Business (BRD)', icon: FileCheck },
                    { id: 'FSD', label: '4. Functional (FSD)', icon: Code2 },
                    { id: 'CHARTER', label: '5. Charter', icon: Flag },
                    { id: 'RELEASE', label: '6. Release & UAT', icon: Ship }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest whitespace-nowrap ${
                            activeTab === tab.id 
                            ? 'bg-govt-blue text-white shadow-lg ring-1 ring-white/20' 
                            : 'text-slate-500 hover:bg-white/10 hover:text-slate-800 dark:hover:text-white'
                        }`}
                    >
                        <tab.icon className="w-4 h-4"/>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT WITH MAX WIDTH FOR READABILITY */}
            <div className="flex-1">
                <div className="max-w-5xl mx-auto pb-32">
                    {activeTab === 'KAJIAN' && (
                        <TabKajian 
                            project={data} 
                            setProject={setProject} 
                            uploadedFile={null} 
                            handleAddArray={handleAddArray} 
                            handleRemoveArray={handleRemoveArray} 
                            handleUpdateArray={handleUpdateArray}
                        />
                    )}
                    {activeTab === 'RESEARCH' && (
                        <TabResearch 
                            project={data} 
                            setProject={setProject} 
                        />
                    )}
                    {activeTab === 'BRD' && (
                        <TabBRD 
                            project={data} 
                            setProject={setProject} 
                            uploadedFile={null} 
                            calc={calc}
                            handleAddArray={handleAddArray} 
                            handleRemoveArray={handleRemoveArray} 
                            handleUpdateArray={handleUpdateArray}
                        />
                    )}
                    {activeTab === 'FSD' && (
                        <TabFSD 
                            project={data} 
                            setProject={setProject} 
                            uploadedFile={null} 
                            handleAddArray={handleAddArray} 
                            handleRemoveArray={handleRemoveArray} 
                            handleUpdateArray={handleUpdateArray}
                        />
                    )}
                    {activeTab === 'CHARTER' && (
                        <TabCharter 
                            project={data} 
                            setProject={setProject} 
                            calc={calc}
                        />
                    )}
                    {activeTab === 'RELEASE' && (
                        <TabRelease 
                            project={data} 
                            setProject={setProject} 
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CeisaWizard;