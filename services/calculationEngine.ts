
import { ProjectData, WorkspaceDocument, WorkspaceSection, WorkspaceBlock, DocTable } from '../types';
import { formatIDR } from '../utils/currency';

// --- PATENT PARAMETERS (GOVERNMENT STANDARD - DO NOT MODIFY) ---
const TCF = 0.87;
const ECF = 0.77;
const PHM_MULTIPLIER = 20; // Standard PHM
const DAYS_DIVISOR = 8;
const MONTH_DIVISOR = 22;

const RATES: Record<string, number> = {
    'Project Manager': 28150000,
    'Business Analyst': 21950000,
    'System Analyst': 21950000,
    'Programmer': 21950000,
    'Quality Control': 13950000,
    'Quality Assurance': 13950000,
    'Technical Writer': 13950000,
    'Tester': 13950000
};

const EFFORT_DIST_PCT: Record<string, number> = {
    'Needs analysis': 0.016,
    'Specification': 0.075,
    'Design': 0.060,
    'Implementation (Coding)': 0.520,
    'Acceptance & installation': 0.055,
    'Project management': 0.038,
    'Configuration management': 0.043,
    'Documentation': 0.084,
    'Training & technical support': 0.010,
    'Integrated testing': 0.070,
    'Quality assurance': 0.009,
    'Evaluation & testing': 0.020
};

const ACTIVITY_ROLE_MAP: Record<string, string> = {
    'Needs analysis': 'Business Analyst',
    'Specification': 'System Analyst',
    'Design': 'System Analyst',
    'Implementation (Coding)': 'Programmer',
    'Acceptance & installation': 'System Analyst',
    'Project management': 'Project Manager',
    'Configuration management': 'System Analyst',
    'Documentation': 'Technical Writer',
    'Training & technical support': 'Technical Writer',
    'Integrated testing': 'Tester',
    'Quality assurance': 'Tester',
    'Evaluation & testing': 'Tester'
};

export interface CalculationMetrics {
    uaw: number;
    uucw: number;
    uucp: number;
    ucp: number;
    mm: number;
    totalCost: number;
    isValid: boolean;
}

export const calculateMetrics = (doc: WorkspaceDocument): CalculationMetrics => {
    let totalUAW = 0;
    let totalUUCW = 0;
    let hasActors = false;
    let hasUseCases = false;

    if (!doc.sections) return { uaw: 0, uucw: 0, uucp: 0, ucp: 0, mm: 0, totalCost: 0, isValid: false };

    doc.sections.forEach((sec: WorkspaceSection) => {
        if (!sec.blocks) return;
        sec.blocks.forEach((block: WorkspaceBlock) => {
            if (block.type === 'TABLE') {
                const table = block.content as DocTable;
                
                // UAW TABLE LOGIC (Index 3=Type, Index 4=Weight)
                if (table.type === 'UCP_ACTOR') {
                    hasActors = true;
                    table.rows.forEach(r => {
                         const classification = r[3]; 
                         let weight = 3; // Default Complex
                         if (classification === 'Simple') weight = 1;
                         else if (classification === 'Average') weight = 2;
                         totalUAW += weight;
                    });
                }
                
                // UUCW TABLE LOGIC (Index 5=Complexity, Index 6=Weight)
                if (table.type === 'UCP_USECASE') {
                    hasUseCases = true;
                    table.rows.forEach(r => {
                         const complexity = r[5];
                         let weight = 10; // Default Average
                         if (complexity === 'Simple') weight = 5;
                         else if (complexity === 'Complex') weight = 15;
                         totalUUCW += weight;
                    });
                }
            }
        });
    });

    // FAILSAFE: If no actors/usecases, return zero but valid flag false
    if (!hasActors && !hasUseCases) {
        return { uaw: 0, uucw: 0, uucp: 0, ucp: 0, mm: 0, totalCost: 0, isValid: false };
    }

    // CORE FORMULA
    const UUCP = totalUAW + totalUUCW;
    const UCP = UUCP * TCF * ECF;
    const PHM = UCP * PHM_MULTIPLIER;
    const WD = PHM / DAYS_DIVISOR;
    const MM = WD / MONTH_DIVISOR;

    // COST ENGINE
    let totalCost = 0;
    Object.keys(EFFORT_DIST_PCT).forEach(activity => {
        const pct = EFFORT_DIST_PCT[activity];
        const effortMM = MM * pct;
        const role = ACTIVITY_ROLE_MAP[activity];
        const rate = RATES[role] || 0;
        totalCost += effortMM * rate;
    });

    const warranty = totalCost * 0.25;
    const ppn = (totalCost + warranty) * 0.11;
    const grandTotal = totalCost + warranty + ppn;

    return { uaw: totalUAW, uucw: totalUUCW, uucp: UUCP, ucp: UCP, mm: MM, totalCost: grandTotal, isValid: true };
};

export const runEngineOnDocument = (doc: WorkspaceDocument): WorkspaceDocument => {
    // Only run on calculation-heavy documents
    if (doc.type !== 'RESEARCH' && doc.type !== 'KAJIAN') return doc;

    const metrics = calculateMetrics(doc);
    
    // If not valid calculation data, return original doc (or pending state)
    // But we still try to populate RAB if MM > 0
    
    const newSections = doc.sections.map(sec => ({
        ...sec,
        blocks: sec.blocks.map(block => {
             // 1. AUTO-WEIGHT ASSIGNMENT (Mutate Table Data)
             if (block.type === 'TABLE') {
                const table = block.content as DocTable;
                
                if (table.type === 'UCP_ACTOR') {
                    const newRows = table.rows.map(r => {
                         const classification = r[3];
                         let weight = '3';
                         if (classification === 'Simple') weight = '1';
                         else if (classification === 'Average') weight = '2';
                         
                         // Ensure row has 5 columns: [Code, Name, Desc, Type, Weight]
                         const newRow = [...r];
                         if (newRow.length > 4) newRow[4] = weight;
                         return newRow;
                    });
                    return { ...block, content: { ...table, rows: newRows } };
                }

                if (table.type === 'UCP_USECASE') {
                    const newRows = table.rows.map(r => {
                         const complexity = r[5];
                         let weight = '10';
                         if (complexity === 'Simple') weight = '5';
                         else if (complexity === 'Complex') weight = '15';

                         // Ensure row has 7 columns: [Code, Name, Prio, Actor, Scenario, Complexity, Weight]
                         const newRow = [...r];
                         if (newRow.length > 6) newRow[6] = weight;
                         return newRow;
                    });
                    return { ...block, content: { ...table, rows: newRows } };
                }
             }

            // 2. RAB GENERATION (Cost Engine)
            if (block.type === 'TABLE' && (block.content as DocTable).type === 'RAB') {
                // Determine MM to use. If metrics valid use it, else 0.
                const mmToUse = metrics.isValid ? metrics.mm : 0;
                
                const newRows = Object.keys(EFFORT_DIST_PCT).map(activity => {
                    const pct = EFFORT_DIST_PCT[activity];
                    const effortMM = mmToUse * pct;
                    const role = ACTIVITY_ROLE_MAP[activity];
                    const rate = RATES[role] || 0;
                    const cost = effortMM * rate;
                    return [activity, (pct * 100).toFixed(1) + '%', effortMM.toFixed(3), role, formatIDR(rate), formatIDR(cost)];
                });

                // Recalculate totals for RAB display
                let runningTotal = 0;
                Object.keys(EFFORT_DIST_PCT).forEach(activity => {
                     const pct = EFFORT_DIST_PCT[activity];
                     const effortMM = mmToUse * pct;
                     const role = ACTIVITY_ROLE_MAP[activity];
                     const rate = RATES[role] || 0;
                     runningTotal += effortMM * rate;
                });

                const warranty = runningTotal * 0.25;
                const subTotal = runningTotal + warranty;
                const ppn = subTotal * 0.11;
                const grandTotal = subTotal + ppn;

                newRows.push(['Total Effort Cost', '100%', mmToUse.toFixed(2), '-', '-', formatIDR(runningTotal)]);
                newRows.push(['Warranty (25%)', '-', '-', '-', '-', formatIDR(warranty)]);
                newRows.push(['Sub Total', '-', '-', '-', '-', formatIDR(subTotal)]);
                newRows.push(['PPN (11%)', '-', '-', '-', '-', formatIDR(ppn)]);
                newRows.push(['TOTAL BIAYA (RAB)', '-', '-', '-', '-', formatIDR(grandTotal)]);

                return { ...block, content: { ...(block.content as DocTable), rows: newRows } };
            }
            return block;
        })
    }));

    return { ...doc, sections: newSections };
};

export const updateProjectDataWithCalculations = (projectData: ProjectData): ProjectData => {
    if (!projectData.documents.workspaces) return projectData;

    const newWorkspaces = { ...projectData.documents.workspaces };
    
    // Auto-Calculate Research Doc
    Object.keys(newWorkspaces).forEach(key => {
        if (newWorkspaces[key].type === 'RESEARCH' || newWorkspaces[key].type === 'KAJIAN') {
            newWorkspaces[key] = runEngineOnDocument(newWorkspaces[key]);
            
            // If it's Research, update the global stats too
            if (newWorkspaces[key].type === 'RESEARCH') {
                 const metrics = calculateMetrics(newWorkspaces[key]);
                 if (metrics.isValid) {
                     // Store these metrics in a place UI can easily read if needed, 
                     // essentially we assume UI reads from the Tables directly or re-calcs on fly using this engine.
                 }
            }
        }
    });

    return { ...projectData, documents: { ...projectData.documents, workspaces: newWorkspaces } };
};
