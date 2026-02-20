
// Added Task interface for Gantt chart and dashboard tasks
export interface Task {
    id: string;
    name: string;
    start: string;
    end: string;
    pic: string;
    status: 'Completed' | 'In Progress' | 'Pending';
    progress: number;
}

// Added BIAAnalysis interface for Business Impact Analysis data
export interface BIAAnalysis {
    processDescription: string;
    impacts: {
        operational: string;
        financial: string;
        reputational: string;
        legal: string;
    };
    rto: string;
    rpo: string;
    risks: {
        id: string;
        risk: string;
        level: string;
        impact: string;
        mitigation: string;
    }[];
}

// Added NFR interface for Non-Functional Requirements
export interface NFR {
    category: string;
    requirement: string;
}

// Added SimulationRun interface for Monte Carlo simulation paths
export interface SimulationRun {
    runId: number;
    data: { step: number; value: number }[];
}

// Added ScenarioParams interface for simulation parameters
export interface ScenarioParams {
    budgetVariance: number;
    adoptionRate: number;
    timelineDelay: number;
    marketRisk: number;
    taxRate: number;
    inflation: number;
    regulatoryCost: number;
}

export interface ResearchKajianDoc {
    docNumber: string;
    // Section 1
    projectName: string;
    projectDescription: string;
    processOwner: string;
    notaNumber: string;
    notaDate: string;
    docCreationDate: string;
    // Section 2
    module: string;
    subModule: string;
    eaMapping: string;
    notes: string;
    // Section 3
    asIsToBe: { id: string; factor: string; asIs: string; toBe: string }[];
    // Section 4
    processFlowDescription: string;
    processFlowImage?: string;
    // Section 5
    functionalReqs: { id: string; function: string; description: string }[];
    // Section 6
    nonFunctionalReqs: { id: string; description: string; reason: string }[];
    // Section 7
    actors: { id: string; code: string; name: string; description: string }[];
    // Section 8
    useCases: { 
        id: string; 
        code: string; 
        name: string; 
        priority: string; 
        actor: string; 
        preCondition: string; 
        postCondition: string; 
        mainFlow: string; 
        altFlow: string; 
        notes: string 
    }[];
    // Section 9
    businessValueParams: {
        efficiency: number;
        user: number;
        basis: number;
        impact: number;
    };
    effortParams: {
        duration: number;
        technology: number;
        relatedSystem: number;
        devStrategy: number;
    };
    // Section 10
    signatures: {
        preparedBy: string;
        preparedDate: string;
        knownBy: string;
        knownDate: string;
        approvedBy: string;
    };
    // Added fields for docx generation and AI mapping
    conclusion: string;
    rtl: string;
    
    // SECTION: UCP CALCULATION (New)
    ucpCalcData?: {
        // SUB-SECTION A: Use Case & Actor
        ucpUseCases?: { id: string; sub: string; useCase: string; jenis: string; catatan: string; jumlahUC: number; kompleksitas: string; bobot: number; uucw: number }[];
        ucpActors?: { id: string; aktor: string; jenisAktor: string; uaw: number }[];
        
        // SUB-SECTION B: Technical Complexity Factor
        tcfFactors?: { id: string; factor: string; weight: number; relevance: number; score?: number; keterangan: string }[];
        tcfSum?: number;
        tcf?: number;
        
        // SUB-SECTION C: Environmental Factor
        ecfFactors?: { id: string; factor: string; weight: number; impact: number; score?: number; keterangan: string }[];
        ecfSum?: number;
        ecf?: number;
        
        // SUB-SECTION D: Hasil Kalkulasi
        uaw?: number;
        uucw?: number;
        uucp?: number;
        phm?: number; // 20 or 28
        totalJam?: number;
        wd?: number;
        mm?: number;
        
        // SUB-SECTION E: Estimasi Biaya
        costEstimation?: { id: string; phase: string; persentase: number; mm: number; pic: string; gaji: number; cost: number }[];
        totalCost?: number;
        garansi25?: number;
        subTotal?: number;
        ppn11?: number;
        grandTotal?: number;
        
        // SUB-SECTION F: Effort Distribution
        effortDistribution?: { id: string; role: string; mm: number; waktu: number; kebutuhan: number; tersedia: number; gap?: number }[];
        
        // Reference data for dropdowns
        phm_options?: number[];
    };
}

export interface CeisaFields {
    nama: string;
    pengampu: string;
    unitPenanggungJawab: string;
    namaPIC: string;
    kontakPIC: string;
    latarBelakang: string;
    masalahIsu: string;
    targetPenyelesaian: string;
    targetOutcome: string;
    outcomeKeluaran: string;
    businessValue: string;
    
    // Arrays for dynamic lists
    kebutuhanFungsional: { id: string; deskripsi: string; prioritas: string }[];
    kebutuhanNonFungsional: { id: string; kategori: string; deskripsi: string }[];
    risikoBisnis: { id: string; risk: string; impact: string; mitigasi: string; level: string }[];
    
    // BIA
    alurBisnisProses: string;
    bia: {
        operasional: string;
        finansial: string;
        reputasi: string;
        hukum: string;
        rto: string;
        rpo: string;
    };

    // RESEARCH DOCUMENT (Refined Structure for Kajian Kebutuhan)
    researchKajian: ResearchKajianDoc;

    // BRD Specifics
    brdProcessAnalysis: {
        modul: string;
        subModul: string;
        eaMapping: string;
        notes: string;
    };
    asIsToBe: { id: string; factor: string; asIs: string; toBe: string }[];
    
    // UCP Calculation Data
    actors: { id: string; name: string; desc: string; type: 'Simple'|'Average'|'Complex' }[];
    useCases: { id: string; name: string; priority: string; actorRef: string; preCond: string; postCond: string; mainFlow: string; altFlow: string; transactions: number }[];
    tcfImpacts: Record<string, number>;
    efImpacts: Record<string, number>;
    phm: number; // 20 or 28

    // FSD Specifics
    fsdProcess: { asIs: string; toBe: string };
    fsdMockups: { id: number; name: string; link: string; description?: string; screenResolution?: string; userFlow?: string }[];
    fsdAccessRights: { id: string; role: string; feature: string; c: boolean; r: boolean; u: boolean; d: boolean }[];
    fsdDesign: { id: number; item: string; pic: string; link: string }[];
    fsdArchitectureReview: { id: number; item: string; pic: string }[];
    fsdSourceCode: { pic: string; link: string };

    // Charter Specifics
    charter: {
        scope: string;
        outOfScope: string;
        timeline: { id: number; milestone: string; start: string; end: string; note: string }[];
        team: { id: number; name: string; role: string; responsibility: string }[];
        supportingReqs: string;
        specialReqs: string;
        bizProcessOwner: string;
        stakeholders: string;
        endUsers: string;
        benefits: string;
        risks: string;
        constraints: string;
        assumptions: string;
    };

    // Release & UAT Specifics
    release: {
        version: string;
        date: string;
        changelogLink: string;
        uatPassed: number;
        uatFailed: number;
        uatTotal: number;
        uatConclusion: string;
        securityChecklist: {
            sqlInjection: boolean;
            xss: boolean;
            brokenAuth: boolean;
            insecureDeserialization: boolean;
            weakCrypto: boolean;
        };
        jiraSecurityLink: string;
    };

    // Signatures
    signatures: {
        date: string;
        approvedBy: { name: string; nip: string; role: string };
        preparedBy: { name: string; nip: string; role: string };
    };
}

export interface DocumentClassification {
  type: string;
  confidence: number;
  origin: string;
  processingPriority: string;
  routingRule: string;
}

export interface VerificationResult {
  verified: boolean;
  score: number;
  issues: string[];
  lineageMap: string;
}

export interface ScoringCriteria {
  parameter: string;
  score: number;
  max: number;
  reason: string;
}

export interface Regulation {
  id: string;
  name: string;
  version: string;
  status: string;
  lastValidated: string;
}

export interface StrategicAnalysis {
  executiveSummary: string;
  problemStatement: string;
  businessObjectives: string[];
  businessValue: string;
  successMetrics: { kpi: string; target: string }[];
  assumptions: string[];
  constraints: string[];
  stakeholderMatrix: { role: string; interest: string; power: string; strategy: string }[];
  executiveSummaryMeta?: { confidence: string; sourceRef: string };
}

export interface AnalyticsData {
  recommendation: {
      action: string;
      condition: string;
      urgency: string;
      confidenceScore: number;
  };
  worstCaseScenario: {
      title: string;
      narrative: string;
      triggerCondition: string;
  };
  portfolioImpact: { projectName: string; impactType: string; impactValue: string }[];
  decisionTrace: { label: string; value: string; impact: string }[];
  decisionClimate: { status: string; volatilityIndex: number; reversalRisk: number; weatherShort: string };
  boardroomDefense: {
      statement: string;
      bulletPoints: string[];
  };
  regulations: Regulation[];
  aiTransparency: { influenceScore: number; primaryAssumption: string; humanOverrideActive: boolean };
  economicProjection: { year: string; cost: number; benefit: number; netValue: number }[];
  socialSentiment: any[];
  riskAnalysis: { category: string; probability: number; impact: number; mitigationCost: number }[];
  quantMetrics: { sharpeRatio: number; volatility: number; alpha: number; beta: number; var95: number; expectedShortfall: number; irr: number; npv: number };
  monteCarloSim: any[];
  marketContext: string;
  futureOutlook: string;
  baseParams: { initialInvestment: number; annualOpex: number; annualRevenue: number; discountRate: number };
  auditState: Record<string, AuditCategory>;
  auditLogs: any[];
  causalChain: any[];
  simulationComparison?: {
      scenarios: SavedScenario[];
      analysis: string;
      winnerId: string;
  };
}

export interface AuditCategory {
    id: string;
    title: string;
    group: string;
    selectedOptionIndex: number;
    options: { label: string; value: number }[];
}

export interface SavedScenario {
    id: string;
    name: string;
    color: string;
    // Updated to use the SimulationRun interface
    runs: SimulationRun[];
    params: any;
    gbmParams?: { drift: number; volatility: number };
    confidence: number;
    metrics: { npv: number; irr: number; risk: number };
}

export interface IntelligenceGraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

export interface GraphNode {
    id: string;
    label: string;
    type: 'PROJECT' | 'RISK' | 'REQUIREMENT' | 'STAKEHOLDER' | 'AUDIT_SCORE';
    confidence: number;
    data?: any;
}

export interface GraphEdge {
    source: string;
    target: string;
    relation: string;
}

export interface ProjectDocuments {
    research: string;
    tor: string;
    fsd: string;
    brd: string;
    flowchart: string;
    tables?: Record<string, any>;
    workspaces?: Record<string, WorkspaceDocument>;
}

export interface WorkspaceDocument {
    id: string;
    type: string;
    title: string;
    status: 'DRAFT' | 'APPROVED' | 'REVIEW';
    version: string;
    sections: WorkspaceSection[];
}

export interface WorkspaceSection {
    id: string;
    title: string;
    order: number;
    lastModified: string;
    blocks: WorkspaceBlock[];
}

export interface WorkspaceBlock {
    id: string;
    type: 'TEXT' | 'TABLE';
    content: string | DocTable;
}

export interface DocTable {
    type: 'UCP_ACTOR' | 'UCP_USECASE' | 'RAB' | 'GENERIC' | 'REGULATION' | 'BEST_PRACTICE' | 'METHODOLOGY' | 'FINDING' | 'RECOMMENDATION';
    title: string;
    headers: string[];
    rows: string[][];
}

export interface PIO_Ingest {
    project_name: string;
    executive_summary: string;
    executive_summary_meta?: { confidence: string; sourceRef: string };
    legal_basis: string[];
    objectives: string[];
    stakeholders: { role: string; interest: string; power: string }[];
    budget_signal: number;
    timeline_signal: number;
    technical_stack_signal: string[];
}

export interface PIO_Architecture {
    actors: string[];
    modules: string[];
    integrations: string[];
    security_level: string;
    data_classification: string;
    use_cases: { code: string; name: string; classification?: string; actor?: string; transactions?: number }[];
    detailed_actors: { name: string; type: string; desc: string }[];
    as_is_to_be: { factor: string; as_is: string; to_be: string }[];
}

export interface ProjectData extends CeisaFields {
    scoring: ScoringCriteria[];
    strategicAnalysis: StrategicAnalysis;
    meta: {
      theme: string;
      createdAt: string;
      department: string;
      unit_tik: string;
      pic_name: string;
      pic_contact: string;
      estimationLock: { isLocked: boolean };
      governance?: { constitutionalHash?: string };
      verification?: VerificationResult;
      classification?: DocumentClassification;
    };
    stats: {
      totalScore: number;
      priorityLabel: string;
      riskLevel: string;
      efficiencyGain: string;
    };
    analytics: AnalyticsData;
    documents: ProjectDocuments;
    pioTrace?: {
        ingest: PIO_Ingest;
        arch: PIO_Architecture;
        compliance: { risk_score: number; regulations: any[]; audit_state_indices: Record<string, number> };
    };
    intelligenceGraph?: IntelligenceGraphData;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    attachments?: { type: 'image' | 'file'; content: string; name: string }[];
}

export interface UserSettings {
    darkMode: boolean;
    aiCreativity: number;
    riskTolerance: 'Conservative' | 'Balanced' | 'Aggressive';
    autoSave: boolean;
    density: 'Compact' | 'Comfortable';
}
