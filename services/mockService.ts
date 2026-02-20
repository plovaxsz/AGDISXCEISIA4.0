
import { ProjectData, Task, AnalyticsData, ScoringCriteria, Regulation, StrategicAnalysis, BIAAnalysis, NFR, ResearchKajianDoc } from '../types';

// Helper for randomization
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const generateGovtDemoData = (themeInput: string): ProjectData => {
  const theme = themeInput.includes('Patroli') || themeInput === '' ? 'Modul Imsama (Impor Sementara Indonesia)' : themeInput;
  const investment = 0.69180417; 
  
  const scoring: ScoringCriteria[] = [
    { parameter: "Urgensi Regulasi", score: 9, max: 10, reason: "Mandatory: Percepatan layanan ekspor sesuai regulasi terbaru." },
    { parameter: "Dampak Efisiensi", score: 9, max: 10, reason: "Mengurangi Cost of Logistics sebesar 15%." },
    { parameter: "Kompleksitas Teknis", score: 7, max: 10, reason: "Integrasi Data Manifest dan Validasi NPWP Master Data." },
    { parameter: "Strategic Alignment", score: 10, max: 10, reason: "Target Outcome: Proses dokumen aju < 30 detik." }
  ];

  const totalScore = 88;

  const economicProjection = [2024, 2025, 2026, 2027, 2028].map((year, idx) => ({
      year: year.toString(),
      cost: idx === 0 ? investment : 0.05, 
      benefit: idx === 0 ? 0 : 0.5 + (idx * 0.2), 
      netValue: idx === 0 ? -investment : (0.5 + (idx * 0.2)) - 0.05
  }));

  const analytics: AnalyticsData = {
    recommendation: {
        action: 'PROCEED',
        condition: 'Strategic Mandate (High Value/Low Cost)',
        urgency: 'IMMEDIATE',
        confidenceScore: 98
    },
    worstCaseScenario: {
        title: 'Integrasi Manifest Gagal',
        narrative: 'Jika integrasi data manifest tidak real-time, validasi dokumen akan fallback ke manual.',
        triggerCondition: 'API Response Time > 2000ms'
    },
    portfolioImpact: [
        { projectName: 'Portal Pengguna Jasa', impactType: 'DELAY', impactValue: 'Dependency' },
    ],
    decisionTrace: [
        { label: 'Regulatory Mandate', value: 'High', impact: 'POSITIVE' },
    ],
    decisionClimate: { status: 'STABLE', volatilityIndex: 12, reversalRisk: 5, weatherShort: "Clear" },
    boardroomDefense: {
        statement: "Proses ini adalah mandat efisiensi logistik nasional.",
        bulletPoints: ["Target: Proses dokumen < 30 detik."]
    },
    regulations: [
        { id: '1', name: 'Regulasi Ekspor Terbaru', version: '2024', status: 'ACTIVE', lastValidated: '2024-01-01' }
    ],
    aiTransparency: { influenceScore: 90, primaryAssumption: "UCP Estimation valid.", humanOverrideActive: false },
    economicProjection,
    socialSentiment: [],
    riskAnalysis: [
        { category: 'Data Integration', probability: 30, impact: 80, mitigationCost: 0.05 },
        { category: 'User Adoption', probability: 20, impact: 60, mitigationCost: 0.02 },
    ],
    quantMetrics: { sharpeRatio: 2.5, volatility: 0.1, alpha: 0.05, beta: 0.8, var95: 5.0, expectedShortfall: 7.0, irr: 45.0, npv: 1.2 },
    monteCarloSim: [],
    marketContext: "Efisiensi ekspor adalah kunci daya saing nasional.",
    futureOutlook: "Dapat dikembangkan ke modul Impor dan FTZ.",
    baseParams: { initialInvestment: investment, annualOpex: 0.05, annualRevenue: 0.5, discountRate: 10 },
    auditState: {
        val_efficiency: { id: 'v1', title: 'EFFICIENCY', group: 'BUSINESS_VALUE', selectedOptionIndex: 2, options: [{label: 'Low', value: 1}, {label: 'Med', value: 2}, {label: 'High', value: 5}] },
        val_user: { id: 'v2', title: 'USER', group: 'BUSINESS_VALUE', selectedOptionIndex: 2, options: [{label: 'Internal', value: 1}, {label: 'Mixed', value: 3}, {label: 'Public', value: 5}] },
        val_regulation: { id: 'v3', title: 'REGULATION', group: 'BUSINESS_VALUE', selectedOptionIndex: 2, options: [{label: 'Optional', value: 1}, {label: 'Support', value: 3}, {label: 'Mandatory', value: 5}] },
        val_biz_impact: { id: 'v4', title: 'IMPACT', group: 'BUSINESS_VALUE', selectedOptionIndex: 2, options: [{label: 'Dept', value: 1}, {label: 'Div', value: 3}, {label: 'National', value: 5}] },
        eff_duration: { id: 'e1', title: 'DURATION', group: 'EFFORT', selectedOptionIndex: 1, options: [{label: '>12 Mo', value: 1}, {label: '6 Mo', value: 3}, {label: '<3 Mo', value: 5}] },
        eff_tech: { id: 'e2', title: 'TECH', group: 'EFFORT', selectedOptionIndex: 1, options: [{label: 'New Core', value: 1}, {label: 'Standard', value: 3}, {label: 'Simple', value: 5}] },
        eff_complexity: { id: 'e3', title: 'COMPLEXITY', group: 'EFFORT', selectedOptionIndex: 1, options: [{label: 'High', value: 1}, {label: 'Med', value: 3}, {label: 'Low', value: 5}] },
        eff_strategy: { id: 'e4', title: 'STRATEGY', group: 'EFFORT', selectedOptionIndex: 1, options: [{label: 'Outsource', value: 1}, {label: 'In-House', value: 3}] },
    },
    auditLogs: [],
    causalChain: []
  };

  const strategicAnalysis: StrategicAnalysis = {
    executiveSummary: "Penyempurnaan SKP Impor Sementara (Imsama) diperlukan untuk menyelaraskan proses bisnis-IT, mengakomodasi regulasi baru, dan mengoptimalkan pelayanan serta pengawasan.",
    problemStatement: "SKP yang ada sering error, output tidak terupdate, dan banyak probis impor sementara belum terakomodir/terintegrasi.",
    businessObjectives: [
        "Sistem aplikasi untuk stakeholder (importir) via portal pengguna jasa.",
        "Mengurangi Cost of Logistics sebesar 15% akibat efisiensi waktu tunggu di pelabuhan."
    ],
    businessValue: "Mengamankan hak keuangan negara; Mempermudah importir dengan pengajuan online.",
    successMetrics: [
        { kpi: "Processing Time", target: "< 30 Detik" },
        { kpi: "Cost of Logistics", target: "Turun 15%" },
        { kpi: "Completion Date", target: "2023-12-31" }
    ],
    assumptions: ["Data master NPWP tersedia."],
    constraints: ["Waktu pengembangan 6 bulan.", "Anggaran Rp 691 Juta."],
    stakeholderMatrix: [
        { role: "Dit. Teknis Kepabeanan", interest: "High", power: "High", strategy: "Manage Closely" },
    ]
  };

  const biaAnalysis: BIAAnalysis = {
      processDescription: "Proses bisnis impor sementara mencakup perizinan, pemberitahuan pabean, dan pembayaran pungutan negara.",
      impacts: { operational: 'High', financial: 'High', reputational: 'High', legal: 'High' },
      rto: '4 Hours', rpo: '1 Day',
      risks: [
          { id: '1', risk: 'SKP sering mengalami gangguan', level: 'Tinggi', impact: 'Hambatan pelayanan', mitigation: 'Peningkatan stabilitas' },
      ]
  };

  const nfr: NFR[] = [
      { category: 'Performance', requirement: 'Sistem harus user-friendly.' },
      { category: 'Integration', requirement: 'Sistem harus terintegrasi dengan CEISA Impor.' },
      { category: 'Security', requirement: 'Implement Multi-Factor Authentication (MFA) for all user roles' }
  ];

  const currentDate = new Date().toISOString().split('T')[0];

  const researchKajian: ResearchKajianDoc = {
      docNumber: "DOK/DM/EA/2024/001",
      projectName: theme,
      projectDescription: strategicAnalysis.executiveSummary,
      processOwner: "Direktorat Teknis Kepabeanan",
      notaNumber: "ND-123/BC.03/2024",
      notaDate: currentDate,
      docCreationDate: currentDate,
      module: "CORE SYSTEM",
      subModule: "IMPORT SUBMOD",
      eaMapping: "EA-KMNK-DJBC-2024-05",
      notes: "Prioritas pembangunan RKAKL 2025",
      asIsToBe: [
          { id: '1', factor: 'Proses Pendaftaran', asIs: 'Manual / Email', toBe: 'Self-service Portal' },
          { id: '2', factor: 'Validasi Data', asIs: 'Hard-coded checks', toBe: 'Real-time API Validation' },
          { id: '3', factor: 'Lama Proses', asIs: '2-3 Hari', toBe: '< 30 Detik' },
          { id: '4', factor: 'Storage', asIs: 'Physical Archives', toBe: 'Cloud Document Management' },
          { id: '5', factor: 'Security', asIs: 'Single-password', toBe: 'Multi-factor Authentication' }
      ],
      processFlowDescription: "Pada bagian ini menjelaskan alur proses bisnis AS IS dan TO BE modul dalam bagan Business Process Modeling and Notation (BPMN)...",
      functionalReqs: [
          { id: '1', function: 'Registrasi User', description: 'User dapat mendaftar via NIK/NPWP' },
          { id: '2', function: 'Submission', description: 'User dapat upload dokumen XML standar' },
          { id: '3', function: 'Monitoring', description: 'Dashboard status real-time untuk petugas' },
          { id: '4', function: 'Notifikasi', description: 'Push notification ke WA/Email' },
          { id: '5', function: 'Reporting', description: 'Export laporan kinerja bulanan PDF/Excel' }
      ],
      nonFunctionalReqs: [
          { id: '1', description: 'Mempunyai tingkat keamanan dan kerahasiaan', reason: 'Terdapat informasi data pribadi user yang perlu dijaga' },
          { id: '2', description: 'Mempunyai kapasitas penyimpanan yang cukup', reason: 'Diperlukan untuk menampung lampiran dokumen yang di-attach' },
          { id: '3', description: 'Mempunyai kapasitas bandwidth untuk', reason: 'Antisipasi saat tanggal-tanggal pelaporan kinerja' }
      ],
      actors: [
          { id: '1', code: "IMS-ACT-1", name: 'Pengguna Jasa', description: 'Importir yang terdaftar dan dapat mengakses sistem' },
          { id: '2', code: "IMS-ACT-2", name: 'Pejabat BC', description: 'Petugas yang meneliti kesesuaian dokumen' }
      ],
      useCases: [
          { id: '1', code: "IMS-UC-1", name: 'Perekaman Dokumen', priority: 'High', actor: 'Pengguna Jasa', preCondition: 'User sudah login', postCondition: 'Dokumen tersimpan di database', mainFlow: '1. Klik menu aju, 2. Isi form, 3. Upload file', altFlow: 'Input tidak valid maka tampil error', notes: 'Terhubung dengan master data NPWP' }
      ],
      businessValueParams: { efficiency: 4, user: 5, basis: 3, impact: 4 },
      effortParams: { duration: 2, technology: 1, relatedSystem: 2, devStrategy: 1 },
      signatures: {
          preparedBy: "Tim Demand Management",
          preparedDate: currentDate,
          knownBy: "Nama PM",
          knownDate: currentDate,
          approvedBy: "PMO DJBC"
      },
      conclusion: "Berdasarkan kajian di atas, pengembangan modul Imsama sangat layak untuk dilanjutkan guna meningkatkan efisiensi pelayanan.",
      rtl: "Penyusunan BRD dan FSD sebagai langkah lanjutan."
  };

  return {
    nama: theme,
    pengampu: 'Direktorat Teknedis Kepabeanan',
    unitPenanggungJawab: 'Direktorat Teknedis Kepabeanan',
    namaPIC: 'PIC CEISIA 4.0',
    kontakPIC: '197207021992121001',
    latarBelakang: strategicAnalysis.executiveSummary,
    masalahIsu: strategicAnalysis.problemStatement,
    targetPenyelesaian: '2024-12-31',
    targetOutcome: 'Tersedianya sistem Imsama yang handal',
    outcomeKeluaran: 'Aplikasi CEISIA 4.0 Imsama',
    businessValue: strategicAnalysis.businessValue,
    
    kebutuhanFungsional: [
        { id: 'FR-01', deskripsi: 'Penerbitan Nomor Pendaftaran otomatis', prioritas: 'Mandatory' },
        { id: 'FR-02', deskripsi: 'Integrasi dengan Knowledgebase', prioritas: 'Optional' }
    ],
    kebutuhanNonFungsional: nfr.map((n, i) => ({
        id: `nfr-${i}`,
        kategori: n.category,
        deskripsi: n.requirement
    })),
    risikoBisnis: biaAnalysis.risks.map(r => ({
        id: r.id,
        risk: r.risk,
        impact: r.impact,
        mitigasi: r.mitigation,
        level: r.level
    })),
    
    alurBisnisProses: biaAnalysis.processDescription,
    bia: {
        operasional: biaAnalysis.impacts.operational,
        finansial: biaAnalysis.impacts.financial,
        reputasi: biaAnalysis.impacts.reputational,
        hukum: biaAnalysis.impacts.legal,
        rto: biaAnalysis.rto,
        rpo: biaAnalysis.rpo
    },

    researchKajian,

    brdProcessAnalysis: {
        modul: theme,
        subModul: 'Core Process',
        eaMapping: 'EA-DJBC-2024',
        notes: 'Mandatory update'
    },
    asIsToBe: [
        { id: '1', factor: 'Proses Pengajuan', asIs: 'Pengajuan manual, dokumen fisik diserahkan ke loket.', toBe: 'Pengajuan digital via Portal Pengguna Jasa, upload dokumen mandiri (24/7).' },
        { id: '2', factor: 'Waktu Layanan', asIs: '1-3 Hari kerja.', toBe: 'Real-time (< 30 detik).' }
    ],
    
    actors: [
        { id: '1', name: 'Pengguna Jasa', desc: 'Importir yang mengajukan permohonan', type: 'Complex' },
        { id: '2', name: 'Pejabat Pemeriksa', desc: 'Petugas yang meneliti dokumen', type: 'Average' }
    ],
    useCases: [
        { id: '1', name: 'Perekaman Permohonan', priority: 'High', actorRef: 'Pengguna Jasa', preCond: 'User logged in', postCond: 'Draft saved', mainFlow: '1. User fills form...', altFlow: 'User cancels', transactions: 10 }
    ],
    tcfImpacts: {},
    efImpacts: {},
    phm: 20,

    fsdProcess: { asIs: "https://viewer.diagrams.net/", toBe: "https://viewer.diagrams.net/" },
    fsdMockups: [
        { id: 1, name: 'Dashboard Imsama', link: 'https://figma.com/file/imsama', description: 'Tampilan utama dashboard petugas' }
    ],
    fsdAccessRights: [
        { id: '1', role: 'Petugas', feature: 'Penelitian Dokumen', c: true, r: true, u: true, d: false }
    ],
    fsdDesign: [
        { id: 1, item: 'ERD', pic: 'DB Designer', link: '#' }
    ],
    fsdArchitectureReview: [],
    fsdSourceCode: { pic: 'Lead Dev', link: 'https://gitlab.com/ceisia' },

    charter: {
        scope: "Pengembangan Modul Imsama mencakup pendaftaran, penelitian, dan monitoring.",
        outOfScope: "Integrasi dengan sistem eksternal non-bea cukai.",
        timeline: [
            { id: 1, milestone: 'Kick Off', start: '2024-01-01', end: '2024-01-05', note: 'Completed' }
        ],
        team: [
            { id: 1, name: 'Project Manager', role: 'Lead', responsibility: 'End to end delivery' }
        ],
        supportingReqs: "Akses VPN Kemenkeu",
        specialReqs: "Sertifikat Digital",
        bizProcessOwner: "Dit. Teknis Kepabeanan",
        stakeholders: "Importir, Petugas",
        endUsers: "Stakeholder Eksternal",
        benefits: "Efisiensi layanan 30%",
        risks: "Keterlambatan integrasi",
        constraints: "Waktu pengembangan terbatas",
        assumptions: "Infrastruktur siap"
    },

    release: {
        version: 'v1.0.0',
        date: '2024-12-31',
        changelogLink: '#',
        uatPassed: 15,
        uatFailed: 0,
        uatTotal: 15,
        uatConclusion: 'System is ready for production',
        securityChecklist: {
            sqlInjection: true, xss: true, brokenAuth: true, insecureDeserialization: true, weakCrypto: true
        },
        jiraSecurityLink: '#'
    },

    signatures: {
        date: currentDate,
        preparedBy: { name: "Lead Analyst", nip: "197207021992121001", role: "Project Manager" },
        approvedBy: { name: "Kasubdit", nip: "198005202005011003", role: "Direktur" }
    },

    meta: {
      theme,
      createdAt: "2024-01-01",
      department: 'Direktorat Teknedis Kepabeanan',
      unit_tik: 'Direktorat Teknedis Kepabeanan',
      pic_name: 'PIC CEISIA 4.0',
      pic_contact: '197207021992121001',
      estimationLock: { isLocked: true } 
    },
    scoring,
    strategicAnalysis,
    stats: {
      totalScore,
      priorityLabel: "HIGH PRIORITY",
      riskLevel: "Low",
      efficiencyGain: "15%"
    },
    analytics,
    documents: {
      research: "", tor: "", fsd: "", brd: "", flowchart: "",
      tables: {}
    }
  };
};
