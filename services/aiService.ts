
import { GoogleGenAI } from "@google/genai";
import { ProjectData, UserSettings, PIO_Ingest, PIO_Architecture, DocumentClassification, ProjectDocuments, SavedScenario, WorkspaceDocument } from '../types';
import { generateGovtDemoData } from './mockService'; 

let ai: null | GoogleGenAI = null;

// --- GOV DOC INTELLIGENCE SYSTEM PROMPT (CEISIA 4.0 X AGDIP X AI Agents EDITION V2.0) ---
const GOV_DOC_SYSTEM_PROMPT = `
SYSTEM INSTRUCTION — CEISIA 4.0 X AGDIP X AI Agents (IMPROVED V2)

=============================================================
AGENT IDENTITY
=============================================================
Name: CEISIA 4.0 X AGDIP X AI Agents
Platform: AGDIP Workspace — GovDoc Intelligence
Version: 4.0
Primary Language: Bahasa Indonesia
Domain: Government IT Project Documentation | Indonesian Customs Systems | SPBE Compliance
=============================================================

=============================================================
SECTION 1: INITIALIZATION PROTOCOL
=============================================================

Every time this system starts, you MUST:

1. Introduce yourself as: "CEISIA 4.0 X AGDIP X AI Agents"
2. Display document status dashboard.

=============================================================
SECTION 2: DOCUMENT SCANNING & AUTO-FILL ENGINE
=============================================================

When a user uploads a file, scan for these Research Document (Dokumen Penelitian) sections:
1. Judul Penelitian
2. Abstrak
3. Latar Belakang
4. Rumusan Masalah
5. Tujuan Penelitian
6. Tinjauan Pustaka (Landasan Teori, Gap Analysis, Regulasi, Best Practice)
7. Metodologi (Pendekatan, Teknik, Langkah-langkah)
8. Hasil dan Analisis (Temuan, Komparasi, Pembahasan)
9. Rekomendasi Strategis & RTL
10. Kesimpulan
11. Daftar Pustaka
12. Lampiran

Mapping Strategy:
- Extract textual content for narratives.
- Parse tabular data into structured arrays for Regulations, Best Practices, Methodology Steps, Findings, and Recommendations.

=============================================================
SECTION 3: OUTPUT FORMATS
=============================================================
Support exports to:
- WORD (.docx): Maintain heading structure (H1 for sections, H2 for sub-sections).
- EXCEL (.xlsx): Separate sheets for each extracted table.
- PDF (.pdf): Standard A4 report layout.
`;

// Helper to initialize and retrieve the Gemini API client
const getAiClient = () => {
  if (!ai) {
    const apiKey = ((import.meta as any).env?.VITE_API_KEY) || process.env.VITE_API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is missing. Please check your .env.local file and ensure VITE_API_KEY is set.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const robustJSONParse = (input: string): any => {
    let text = input || "{}";
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        return JSON.parse(text);
    } catch { 
        const firstCurly = text.indexOf('{');
        const lastCurly = text.lastIndexOf('}');
        if (firstCurly !== -1 && lastCurly !== -1) {
            try {
                return JSON.parse(text.substring(firstCurly, lastCurly + 1));
            } catch (e) { return {}; }
        }
        return {};
    }
};

export const orchestrateProjectAnalysis = async (input: string, settings: UserSettings, isFile: boolean, onProgress?: (msg: string) => void): Promise<ProjectData> => {
    onProgress?.("📡 AGDIP Layer 1: Intelligent Ingestion...");
    
    // In a real app, this would involve multiple AI calls. 
    // Here we simulate the pipeline based on the provided theme/file content.
    
    const mock = generateGovtDemoData(input);
    
    onProgress?.("✅ Finalizing artifacts...");
    
    return {
        ...mock,
        meta: {
            ...mock.meta,
            theme: input.length < 100 ? input : mock.meta.theme,
            estimationLock: { isLocked: false }
        }
    };
};

export async function sendChatToAI(
    history: { role: 'user' | 'model'; text: string }[],
    message: string,
    context: ProjectData,
    attachments: { type: 'image' | 'file'; content: string; name: string }[] = []
): Promise<string> {
    const ai = getAiClient();
    const prompt = `
    ${GOV_DOC_SYSTEM_PROMPT}

    Project: ${context.meta.theme}
    Research Title: ${context.researchKajian?.projectName}
    
    User Query: ${message}
    `;
    const modelToUse = ((import.meta as any).env?.VITE_AI_MODEL) || process.env.VITE_AI_MODEL || "gemini-1.5-flash-latest";

    try {
        const response = await ai.models.generateContent({
            model: modelToUse,
            contents: prompt
        });
        return response.text || "Maaf, saya tidak dapat memproses pertanyaan tersebut.";
    } catch (error) {
        console.error("AI API Error:", error);
        throw error;
    }
}

// Analyzes multiple simulation scenarios and provides a strategic recommendation
export const analyzeSimulationScenarios = async (scenarios: SavedScenario[]): Promise<string> => {
    const ai = getAiClient();
    const prompt = `
    Analyze the following project simulation scenarios and provide a strategic recommendation in Markdown format.
    
    Scenarios Data:
    ${scenarios.map(s => `
    - Scenario: ${s.name}
      Key Metrics: NPV=${s.metrics.npv}, IRR=${s.metrics.irr}%, Risk=${s.metrics.risk}%
      Confidence Level: ${s.confidence}%
      Monte Carlo Parameters: Drift=${s.gbmParams?.drift}, Volatility=${s.gbmParams?.volatility}
    `).join('\n')}
    
    Focus on selecting the optimal scenario for a government IT context, considering both growth (Drift) and stability (Volatility).
    Provide the response in Bahasa Indonesia, formatted for a professional report.
    `;

    const modelToUse = ((import.meta as any).env?.VITE_AI_MODEL) || process.env.VITE_AI_MODEL || "gemini-1.5-flash-latest";
    
    try {
        const response = await ai.models.generateContent({
            model: modelToUse,
            contents: prompt
        });
        return response.text || "Analisis strategi tidak tersedia saat ini.";
    } catch (error) {
        console.error("Simulation analysis error:", error);
        throw error;
    }
};
