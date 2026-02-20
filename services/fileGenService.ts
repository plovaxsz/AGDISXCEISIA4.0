
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { jsPDF } from "jspdf";
import "jspdf-autotable"; 
import { ProjectData, SavedScenario } from '../types';
import { createStrictDocx } from './docxGenService';

const saveFile = (blob: Blob | string, name: string) => {
  // @ts-ignore
  const saver = FileSaver.saveAs || FileSaver;
  saver(blob, name);
};

// Excel has a strict limit of 32,767 characters per cell.
const truncateForExcel = (val: any, maxLen = 30000): any => {
    if (typeof val !== 'string') return val;
    if (val.length > maxLen) {
        return val.substring(0, maxLen) + "... [lihat dokumen lengkap]";
    }
    return val;
};

const formatRupiah = (num: number): string => {
    if (!num || num === 0) return 'Rp 0';
    return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// --- STRICT EXCEL TEMPLATE GENERATION (Following KAK_Sample.xlsx structure) ---
const generateResearchExcel = (data: ProjectData) => {
    const wb = XLSX.utils.book_new();
    const rd = data.researchKajian;
    const ucpData = rd.ucpCalcData || {};

    // Calculate UCP values
    const totalUUCW = ((ucpData.ucpUseCases || []).reduce((sum, r: any) => sum + (r.uucw || 0), 0));
    const totalUAW = ((ucpData.ucpActors || []).reduce((sum, r: any) => sum + (r.uaw || 0), 0));
    const uucp = totalUUCW + totalUAW;
    const tcfSum = ((ucpData.tcfFactors || []).reduce((sum: any, r: any) => sum + (r.weight * r.relevance), 0));
    const tcf = 0.6 + 0.01 * tcfSum;
    const ecfSum = ((ucpData.ecfFactors || []).reduce((sum: any, r: any) => sum + (r.weight * r.impact), 0));
    const ecf = 1.4 + -0.03 * ecfSum;
    const ucp = uucp * tcf * ecf;
    const phm = ucpData.phm || 20;
    const totalJam = ucp * phm;
    const wd = totalJam / 8;
    const mm = wd / 22;

    // SHEET 1: KAK - Use Case & Actor Table
    const sheet1Data = [
        ["No", "Sub", "Usecase", "Jenis", "Catatan", "Jumlah UC", "Kompleksitas Use Case", "Bobot", "UUCW", "Unadjusted Actor Weight"],
        ...((ucpData.ucpUseCases || []).map((row: any, i: number) => [
            i + 1,
            truncateForExcel(row.sub, 500) || "",
            truncateForExcel(row.useCase, 500) || "",
            truncateForExcel(row.jenis, 200) || "",
            truncateForExcel(row.catatan, 500) || "",
            row.jumlahUC || 0,
            truncateForExcel(row.kompleksitas, 200) || "",
            row.bobot || 0,
            row.uucw || 0,
            "" // Placeholder for actor weight alignment
        ])),
        ["", "", "", "", "", "", "", "", "TOTAL", totalUUCW],
        ["", "", "", "", "", "", "", "", "Total UAW", totalUAW],
        ["", "", "", "", "", "", "", "", "UUCP", uucp],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet1Data), "KAK");

    // SHEET 2: TCF - EF - Technical & Environmental Factors
    const sheet2Data: any = [
        ["Technical Complexity Factor", "", "", ""],
        ["Factor", "Weight", "Relevance (0-5)", "Score", "Keterangan"],
        ...((ucpData.tcfFactors || []).length > 0 
            ? (ucpData.tcfFactors || []).map((row: any, i: number) => [
                truncateForExcel(row.factor, 500) || "",
                row.weight || 0,
                row.relevance || 0,
                (row.weight * row.relevance) || 0,
                truncateForExcel(row.keterangan, 500) || ""
            ])
            : [["", "", "", "", ""]]),
        ["", "", "Sum TCF", tcfSum.toFixed(2), ""],
        ["", "", "TCF = 0.6 + (0.01 × Sum)", tcf.toFixed(3), ""],
        ["", "", "", "", ""],
        ["Environmental Factor", "", "", ""],
        ["Factor", "Weight", "Impact (0-5)", "Score", "Keterangan"],
        ...((ucpData.ecfFactors || []).length > 0
            ? (ucpData.ecfFactors || []).map((row: any, i: number) => [
                truncateForExcel(row.factor, 500) || "",
                row.weight || 0,
                row.impact || 0,
                (row.weight * row.impact) || 0,
                truncateForExcel(row.keterangan, 500) || ""
            ])
            : [["", "", "", "", ""]]),
        ["", "", "Sum ECF", ecfSum.toFixed(2), ""],
        ["", "", "ECF = 1.4 + (-0.03 × Sum)", ecf.toFixed(3), ""],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet2Data), "TCF - EF");

    // SHEET 3: Use Case Point Per Paket - UCP Summary
    const sheet3Data = [
        [`Perhitungan Effort ${truncateForExcel(data.meta.theme, 500)}`],
        [""],
        ["No", "Sub Paket", "Total UAW", "Total UUCW", "UUCP", "UCP", "PHM", "WD", "MM"],
        [1, truncateForExcel(rd.module + " - " + rd.subModule, 500) || "Paket 1", totalUAW, totalUUCW, uucp.toFixed(2), ucp.toFixed(2), phm, wd.toFixed(2), mm.toFixed(2)],
        ["", "", "", "", "", "", "", "", ""],
        ["PHM Decision Rule:", ""],
        ["PHM 20 (Standard)", "Proyek dengan kondisi normal atau yang biasa dijumpai"],
        ["PHM 28 (Complex)", "Proyek dengan kompleksitas tinggi atau menggunakan teknologi baru"],
        ["", ""],
        ["Keterangan:", ""],
        ["UAW = Unadjusted Actor Weight (bobot dari actor yang diidentifikasi)"],
        ["UUCW = Unadjusted Use Case Weight (bobot dari use case yang diidentifikasi)"],
        ["UUCP = Unadjusted Use Case Points (UAW + UUCW)"],
        ["TCF = Technical Complexity Factor (faktor kompleksitas teknis)"],
        ["ECF = Environmental Complexity Factor (faktor kompleksitas lingkungan)"],
        ["UCP = UUCP × TCF × ECF"],
        ["WD = Working Days (Total Jam ÷ 8 jam/hari)"],
        ["MM = Man Months (WD ÷ 22 hari kerja/bulan)"],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet3Data), "Use Case Point Per Paket");

    // SHEET 4: Cost Estimation Per Paket - Biaya
    // Pre-filled roles with percentages (standard distribution)
    const costRoles = [
        { phase: "Needs Analysis (Requirement)", percent: 1.6, role: "Business Analyst", salary: 21950000 },
        { phase: "Specification", percent: 7.5, role: "System Analyst", salary: 21950000 },
        { phase: "Design", percent: 6.0, role: "System Analyst", salary: 21950000 },
        { phase: "Implementation (Coding)", percent: 52.0, role: "Programmer", salary: 21950000 },
        { phase: "Acceptance & Installation", percent: 5.5, role: "System Analyst", salary: 21950000 },
        { phase: "Project Management", percent: 3.8, role: "Project Manager", salary: 28150000 },
        { phase: "Configuration Management", percent: 4.3, role: "System Analyst", salary: 25050000 },
        { phase: "Documentation", percent: 8.4, role: "Technical Writer", salary: 13950000 },
        { phase: "Training & Technical Support", percent: 1.0, role: "Technical Writer", salary: 13950000 },
        { phase: "Integrated Testing", percent: 7.0, role: "Tester", salary: 13950000 },
        { phase: "Quality Assurance", percent: 0.9, role: "Tester", salary: 13950000 },
        { phase: "Evaluation & Testing", percent: 2.0, role: "Tester", salary: 13950000 },
    ];

    let totalEffortCost = 0;
    const costEstimationRows = costRoles.map(role => {
        const roleMM = (mm * role.percent) / 100;
        let cost = 0;
        try {
            cost = Math.min(roleMM * role.salary, 30000000);
        } catch (e) {
            cost = 0;
        }
        totalEffortCost += cost;
        return [
            truncateForExcel(role.phase, 500),
            `${role.percent}%`,
            roleMM.toFixed(2),
            truncateForExcel(role.role, 300),
            formatRupiah(role.salary),
            formatRupiah(Math.floor(cost))
        ];
    });

    const sheet4Data: any = [
        [`Cost Estimation by Use Case`],
        [`KAK Akhir Tahun`],
        [""],
        ["Phase", "Prosentase Effort Distribution", "Effort Distribution ManMonth", "PIC", "Gaji Per Bulan Inkindo 2023", "Cost Estimation"],
        ...costEstimationRows,
        ["", "", "", "", "TOTAL", formatRupiah(Math.floor(totalEffortCost))],
        ["", "", "", "", "Estimasi Garansi 25%", formatRupiah(Math.floor(totalEffortCost * 0.25))],
        ["", "", "", "", "Sub Total", formatRupiah(Math.floor(totalEffortCost * 1.25))],
        ["", "", "", "", "PPN 11%", formatRupiah(Math.floor(totalEffortCost * 1.25 * 0.11))],
        ["", "", "", "", "GRAND TOTAL", formatRupiah(Math.floor(totalEffortCost * 1.25 * 1.11))],
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheet4Data), "Cost Estimation Per Paket");

    return wb;
};

// --- MASTER PDF GENERATOR ---
export const generateMasterPDF = (data: ProjectData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DOKUMEN PENELITIAN KAJIAN KEBUTUHAN", 14, yPos);
    yPos += 10;
    doc.setFontSize(14);
    doc.text(`Proyek: ${data.meta.theme}`, 14, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.text("Ringkasan Eksekutif:", 14, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(data.researchKajian.projectDescription || "", pageWidth - 28);
    doc.text(summaryLines, 14, yPos);

    return doc.output('blob');
};

export const exportProjectPackage = async (data: ProjectData) => {
  const zip = new JSZip();
  const theme = data.meta.theme.replace(/\s+/g, '_');

  // 1. DOCX
  const researchBlob = await createStrictDocx(data, 'RESEARCH');
  zip.file(`DOKUMEN_PENELITIAN_${theme}.docx`, researchBlob);

  // 2. EXCEL
  const wb = generateResearchExcel(data);
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  zip.file(`Kajian_Kebutuhan_${theme}.xlsx`, excelBuffer);

  // 3. PDF
  const masterPdfBlob = generateMasterPDF(data);
  zip.file(`DOKUMEN_PENELITIAN_${theme}.pdf`, masterPdfBlob);

  // 4. GENERATE ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveFile(content, `Paket_Penelitian_${theme}.zip`);
};

export const exportSimulationReport = (scenarios: SavedScenario[]) => {
    const zip = new JSZip();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const wb = XLSX.utils.book_new();
    const summaryData = scenarios.map(s => ({
        Scenario: truncateForExcel(s.name),
        NPV: s.metrics?.npv,
        IRR: s.metrics?.irr
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Scenario Summary");

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    zip.file(`Simulation_Data_${timestamp}.xlsx`, excelBuffer);

    zip.generateAsync({ type: 'blob' }).then(content => {
        saveFile(content, `Simulation_Package_${timestamp}.zip`);
    });
};
