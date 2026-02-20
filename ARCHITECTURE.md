
# GENIE-CEISA 4.0 — Enterprise Architecture Blueprint

## 1. Architecture Overview

```mermaid
graph TD
    User((Government User)) -->|HTTPS/TLS 1.3| LoadBalancer[Nginx Ingress Controller]
    
    subgraph "KUBERNETES CLUSTER (On-Premise)"
        LoadBalancer --> API_Gateway[Kong API Gateway]
        
        API_Gateway --> Auth_Service[Identity & Access Mgmt (Keycloak)]
        API_Gateway --> App_UI[React Frontend Service]
        API_Gateway --> Core_API[FastAPI Backend Core]
        
        subgraph "INTELLIGENCE LAYER"
            Core_API --> Agent_Orchestrator[LangGraph Orchestrator]
            Agent_Orchestrator --> Doc_Parser[Document Parser Agent]
            Agent_Orchestrator --> UCP_Engine[CEISA Calculation Engine]
            Agent_Orchestrator --> Risk_Analyst[Risk Analysis Agent]
            Agent_Orchestrator --> Doc_Writer[GovDoc Writer Agent]
        end
        
        subgraph "DATA LAYER"
            Core_API --> Postgres[(PostgreSQL 16 - Relational)]
            Core_API --> VectorDB[(Milvus - Vector Embeddings)]
            Core_API --> Redis[(Redis - Cache & Queue)]
            Core_API --> MinIO[(MinIO - Document Storage)]
        end
    end
    
    subgraph "EXTERNAL"
        Agent_Orchestrator --> LLM_Provider[Local LLM / Azure OpenAI (Secure Tunnel)]
    end
```

## 2. Agent Topology (AGDIS Core)

The system utilizes a multi-agent system to ensure precision and tone compliance.

*   **Ingestion Agent:** Handles OCR (Tesseract/Azure Doc Intelligence), chunking, and semantic classification.
*   **Extraction Agent:** Identifies "Entities" (Actors, Use Cases) using Named Entity Recognition (NER) to feed the CEISA Engine.
*   **Calculation Agent (The Cortex):** Pure deterministic logic. Executes the Constitutional Formulas (UCP, TCF, ECF). **NO LLM hallucination allowed here.**
*   **Writer Agent:** Takes structured data + Gov Templates and generates compliant KAK/BRD/FSD.
*   **Auditor Agent:** Cross-checks outputs against PER-19/BC/2023 regulations before user download.

## 3. Database Schema (PostgreSQL)

```sql
-- Project Metadata
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    department VARCHAR(100),
    created_at TIMESTAMP,
    security_level VARCHAR(20) -- 'UNCLASSIFIED', 'CONFIDENTIAL', 'SECRET'
);

-- The "Constitution" - Locked Estimates
CREATE TABLE ucp_calculations (
    project_id UUID REFERENCES projects(id),
    uaw_score DECIMAL(10,2),
    uucw_score DECIMAL(10,2),
    tcf_score DECIMAL(5,2) DEFAULT 0.87, -- HARD LOCKED
    ecf_score DECIMAL(5,2) DEFAULT 0.77, -- HARD LOCKED
    total_ucp DECIMAL(10,2),
    estimated_man_months DECIMAL(10,2),
    estimated_cost BIGINT,
    locked_at TIMESTAMP
);

-- RAG Knowledge Base
CREATE TABLE regulation_vectors (
    id UUID PRIMARY KEY,
    content TEXT,
    embedding VECTOR(1536),
    metadata JSONB
);
```

## 4. Security Architecture

*   **Zero Trust Network:** mTLS between all microservices.
*   **Data Sovereignty:** All document processing occurs within the VPC. No data leaves the perimeter unless sent to a sanctioned secure LLM endpoint.
*   **Audit Logging:** Every AI prompt, calculation change, and document export is logged to an immutable append-only ledger.
*   **RBAC:** Strict separation between 'Drafter', 'Reviewer', 'Approver', and 'Auditor'.

## 5. Deployment Pattern

*   **Containerization:** Docker multi-stage builds for minimal footprint.
*   **Orchestration:** Kubernetes (K8s) via Helm Charts.
*   **CI/CD:** GitLab CI with SonarQube quality gates.
*   **Infrastructure:** 
    *   3x Worker Nodes (CPU Optimized for App).
    *   2x GPU Nodes (Optional for Local LLM hosting).
    *   High-Availability PostgreSQL Cluster.

## 6. Cost-Efficient Infra Recommendation

For an on-premise government deployment:
*   **Compute:** commodity hardware with high RAM density.
*   **Storage:** MinIO on standard SSDs (S3 compatible but cheaper).
*   **LLM:** Hosting `Llama-3-70b-Instruct` or `Qwen-2-72B` locally removes per-token API costs and resolves data privacy concerns completely.

---
*Prepared by: Senior GovTech Architect*
