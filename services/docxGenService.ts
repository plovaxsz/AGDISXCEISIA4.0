
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, VerticalAlign } from "docx";
import FileSaver from 'file-saver';
import { ProjectData } from '../types';

const BLUE_HEADER = "1F4E79";
const FONT_FAMILY = "Arial";

const createTextCell = (text: string, bold = false) => {
    return new TableCell({
        children: [new Paragraph({ 
            children: [new TextRun({ text: text || "-", bold, font: FONT_FAMILY, size: 20 })],
        })],
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        borders: {
            top: { style: BorderStyle.SINGLE, size: 2 },
            bottom: { style: BorderStyle.SINGLE, size: 2 },
            left: { style: BorderStyle.SINGLE, size: 2 },
            right: { style: BorderStyle.SINGLE, size: 2 }
        }
    });
};

export const createStrictDocx = async (data: ProjectData, type: string): Promise<Blob> => {
    const rd = data.researchKajian;
    
    const children = [
        new Paragraph({ text: "DOKUMEN PENELITIAN KAJIAN KEBUTUHAN", heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: `Sistem CEISA 4.0 — ${data.meta.theme}`, alignment: AlignmentType.CENTER }),
        new Paragraph({ text: `Nomor: ${rd.docNumber}`, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),

        new Paragraph({ text: "1. INFORMASI UMUM", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: `Nama Proyek: ${rd.projectName}` }),
        new Paragraph({ text: `Uraian Singkat: ${rd.projectDescription}` }),
        new Paragraph({ text: `Unit Pengampu: ${rd.processOwner}` }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "2. ANALISIS PROSES BISNIS", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: `Modul: ${rd.module}` }),
        new Paragraph({ text: `Sub Modul: ${rd.subModule}` }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "3. KONDISI AS-IS TO-BE", heading: HeadingLevel.HEADING_1 }),
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({ children: [createTextCell("No", true), createTextCell("Faktor", true), createTextCell("As Is", true), createTextCell("To Be", true)] }),
                ...rd.asIsToBe.map((r, i) => new TableRow({ children: [createTextCell(String(i+1)), createTextCell(r.factor), createTextCell(r.asIs), createTextCell(r.toBe)] }))
            ]
        }),
        new Paragraph({ text: "" }),

        new Paragraph({ text: "4. ALUR PROSES BISNIS", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: rd.processFlowDescription }),

        new Paragraph({ text: "10. KESIMPULAN", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: rd.conclusion }),
    ];

    const doc = new DocxDocument({
        sections: [{ children }]
    });

    return await Packer.toBlob(doc);
};
