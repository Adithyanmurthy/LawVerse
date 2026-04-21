# GLAW: AI-POWERED LEGAL INTELLIGENCE PLATFORM

## A Project Report

Submitted in partial fulfillment of the requirements for the award of the degree of

**Bachelor of Technology / Master of Technology**

in

**Computer Science and Engineering**

by

| Name | Roll No. | Role |
|------|----------|------|
| Adithyan S | [Roll No.] | Team Lead & Full Stack Developer |
| Arjun R | [Roll No.] | Backend Developer & ML Engineer |
| Priya M | [Roll No.] | Frontend Developer & UI/UX Designer |
| Karthik V | [Roll No.] | Data Engineer & DevOps |

Under the guidance of

**Dr. Ramesh Kumar**
Professor, Department of Computer Science and Engineering

**[Institution Name]**

**Department of Computer Science and Engineering**

**[Month], 2025**

---

## CERTIFICATE

This is to certify that the project report titled **"GLAW: AI-Powered Legal Intelligence Platform"** submitted by **Adithyan S, Arjun R, Priya M, and Karthik V** to the Department of Computer Science and Engineering, [Institution Name], in partial fulfillment of the requirements for the award of the degree of **Bachelor of Technology / Master of Technology** in **Computer Science and Engineering**, is a bonafide record of the work carried out by them under my supervision and guidance during the academic year 2024–2025.

The results embodied in this project report have not been submitted to any other university or institution for the award of any degree or diploma.

<br><br>

**Dr. Ramesh Kumar**
Professor
Department of Computer Science and Engineering
[Institution Name]

Date: [Date]
Place: [City]

<br>

**External Examiner**

---

## DECLARATION

We hereby declare that the project report titled **"GLAW: AI-Powered Legal Intelligence Platform"** submitted to the Department of Computer Science and Engineering, [Institution Name], is a record of original work done by us under the guidance of **Dr. Ramesh Kumar**, Professor, Department of Computer Science and Engineering, [Institution Name].

The results embodied in this report have not been submitted to any other university or institution for the award of any degree or diploma, to the best of our knowledge and belief.

| | |
|---|---|
| Adithyan S | Arjun R |
| Priya M | Karthik V |

Date: [Date]
Place: [City]

---

## ACKNOWLEDGEMENT

We would like to express our sincere gratitude to our project guide, **Dr. Ramesh Kumar**, Professor, Department of Computer Science and Engineering, for his invaluable guidance, constant encouragement, and constructive criticism throughout the course of this project. His deep understanding of both the theoretical and practical aspects of natural language processing and software engineering helped us navigate the many challenges we encountered during development.

We are grateful to **[Head of Department Name]**, Head of the Department of Computer Science and Engineering, for providing us with the necessary infrastructure and support to carry out this project. We also extend our thanks to the faculty members of the department who offered their time and expertise during our project reviews and evaluations.

We wish to acknowledge the open-source community, particularly the developers behind Hugging Face Transformers, FastAPI, Next.js, and the various pre-trained language models we employed. Without their contributions, a project of this scope would not have been feasible within our timeline.

Finally, we thank our families and friends for their patience and moral support throughout this endeavor.

**Adithyan S, Arjun R, Priya M, Karthik V**

---

## ABSTRACT

The legal profession has historically been slow to adopt computational tools, despite the enormous volume of textual data it generates. Court judgments, statutes, contracts, and regulatory filings collectively form one of the largest and most complex corpora of natural language text in existence. Yet, the tools available to legal professionals for navigating this corpus remain rudimentary — keyword-based search engines, manual contract review, and static legal databases that fail to capture how the law itself evolves over time.

This project presents **Glaw**, an AI-powered legal intelligence platform that addresses two fundamental challenges in legal technology. The first is the problem of **semantic drift in legal concepts** — the phenomenon where legal terms like "due process," "reasonable doubt," or "natural justice" shift in meaning across decades of judicial interpretation. To tackle this, we developed the **Legal Concept Evolution Tracker (LCET)**, a module that employs a multi-model NLP pipeline consisting of LexLM Legal-RoBERTa-Large, BGE-Large-EN-v1.5, DeBERTa-v3-Large-MNLI, and GLiNER Large v2.1 to compute a novel metric called the **Semantic Movement Index (SMI)**. The SMI quantifies how much a legal concept's meaning has shifted between two time periods by comparing averaged contextual embeddings drawn from actual court judgments.

The second challenge is **automated contract risk analysis**. Glaw's Contract Copilot module ingests legal contracts in PDF or DOCX format, segments them into individual clauses, applies 14 deterministic rule-based checks, and then enhances the analysis through a cascading LLM pipeline (Groq → Gemini → Cloudflare Workers AI) to identify risks, missing protections, and potentially unfavorable terms. A weighted risk scoring algorithm produces an overall contract health score.

The platform was built using a modern technology stack — FastAPI for the backend, Next.js 14 with React for the frontend, and a containerized deployment architecture using Docker and Kubernetes. Our dataset comprises over 120,000 Indian court cases sourced from Hugging Face, 800 US federal cases from CourtListener, European Court of Human Rights cases from HUDOC, and additional Indian cases scraped from Indian Kanoon spanning 1950 to 2026. Evaluation results demonstrate that the SMI metric reliably captures known historical shifts in legal interpretation, and the contract analysis module achieves high accuracy in identifying common contractual risks.

**Keywords:** Legal NLP, Semantic Drift, Contract Analysis, Transformer Models, Legal Intelligence, Semantic Movement Index

---

## TABLE OF CONTENTS

| Chapter | Title | Page |
|---------|-------|------|
| | Certificate | i |
| | Declaration | ii |
| | Acknowledgement | iii |
| | Abstract | iv |
| | Table of Contents | v |
| | List of Figures | vii |
| | List of Tables | viii |
| **1** | **Introduction** | **1** |
| 1.1 | Background and Motivation | 1 |
| 1.2 | Problem Statement | 3 |
| 1.3 | Objectives | 4 |
| 1.4 | Scope of the Project | 5 |
| 1.5 | Organization of the Report | 6 |
| **2** | **Literature Review** | **7** |
| 2.1 | Legal Technology Landscape | 7 |
| 2.2 | NLP in Legal Domain | 8 |
| 2.3 | Semantic Similarity and Drift Detection | 10 |
| 2.4 | Contract Analysis Systems | 11 |
| 2.5 | Existing Solutions and Their Limitations | 12 |
| 2.6 | Research Gap | 13 |
| **3** | **System Analysis and Design** | **14** |
| 3.1 | System Requirements | 14 |
| 3.2 | System Architecture | 17 |
| 3.3 | Data Flow Diagrams | 20 |
| 3.4 | Database Design | 21 |
| 3.5 | Module Design | 22 |
| **4** | **Implementation** | **23** |
| 4.1 | Technology Stack | 23 |
| 4.2 | Multi-Model NLP Pipeline | 25 |
| 4.3 | Semantic Movement Index (SMI) | 28 |
| 4.4 | Data Pipeline | 31 |
| 4.5 | Contract Analysis Pipeline | 34 |
| 4.6 | API Gateway and Service Integration | 37 |
| 4.7 | Frontend Implementation | 38 |
| 4.8 | DevOps and Deployment | 40 |
| **5** | **Testing and Results** | **42** |
| 5.1 | Unit Testing | 42 |
| 5.2 | Integration Testing | 43 |
| 5.3 | Performance Testing | 44 |
| 5.4 | SMI Validation Results | 45 |
| 5.5 | Search Accuracy Evaluation | 46 |
| 5.6 | Contract Analysis Accuracy | 47 |
| 5.7 | Screenshots | 48 |
| **6** | **Conclusion and Future Work** | **50** |
| 6.1 | Summary of Achievements | 50 |
| 6.2 | Limitations | 51 |
| 6.3 | Future Enhancements | 52 |
| 6.4 | Conclusion | 53 |
| | **References** | **54** |
| | **Appendix A: API Endpoint Documentation** | **57** |
| | **Appendix B: Database Schema** | **59** |
| | **Appendix C: Configuration Files** | **61** |

---

## LIST OF FIGURES

| Figure No. | Title | Page |
|------------|-------|------|
| 3.1 | Overall System Architecture of Glaw | 17 |
| 3.2 | LCET Module Architecture | 18 |
| 3.3 | Contract Analysis Module Architecture | 19 |
| 3.4 | API Gateway Architecture | 20 |
| 3.5 | Level-0 Data Flow Diagram | 20 |
| 3.6 | Level-1 Data Flow Diagram — LCET Module | 21 |
| 3.7 | Level-1 Data Flow Diagram — Contract Module | 21 |
| 3.8 | Entity-Relationship Diagram | 22 |
| 4.1 | Multi-Model NLP Pipeline Flow | 25 |
| 4.2 | SMI Computation Workflow | 28 |
| 4.3 | Data Pipeline Architecture | 31 |
| 4.4 | Contract Analysis Pipeline | 34 |
| 4.5 | Frontend Search Interface | 38 |
| 4.6 | Timeline Visualization Component | 39 |
| 5.1 | SMI Values for "Due Process" (1950–2024) | 45 |
| 5.2 | Search Precision-Recall Curve | 46 |
| 5.3 | Contract Risk Score Distribution | 47 |

## LIST OF TABLES

| Table No. | Title | Page |
|-----------|-------|------|
| 3.1 | Functional Requirements | 14 |
| 3.2 | Non-Functional Requirements | 15 |
| 3.3 | Hardware Requirements | 16 |
| 3.4 | Software Requirements | 16 |
| 4.1 | Model Specifications | 26 |
| 4.2 | Drift Classification Thresholds | 30 |
| 4.3 | Data Source Summary | 32 |
| 4.4 | Contract Analysis Rules | 35 |
| 4.5 | Risk Weight Configuration | 36 |
| 4.6 | Pricing Tiers | 40 |
| 5.1 | Unit Test Coverage Summary | 42 |
| 5.2 | API Response Time Benchmarks | 44 |
| 5.3 | SMI Validation Against Known Shifts | 45 |
| 5.4 | Contract Analysis Precision and Recall | 47 |


---

## CHAPTER 1: INTRODUCTION

### 1.1 Background and Motivation

Law is, at its core, a system built on language. Every statute, every judgment, every contract is a carefully constructed arrangement of words intended to convey precise meaning. But language is not static. Words shift in meaning over decades, and in the legal domain, this shift carries enormous consequences. When the Indian Supreme Court interprets "personal liberty" under Article 21 of the Constitution in 2024, it draws on — but does not necessarily agree with — interpretations from 1950, 1975, or 2000. The phrase remains the same; the legal meaning has evolved through hundreds of judgments, each adding nuance, expanding scope, or occasionally narrowing it.

This phenomenon, which we refer to as **semantic drift in legal concepts**, is well understood by legal scholars but has received surprisingly little attention from the computational linguistics community. Legal professionals spend enormous amounts of time tracing how a concept has been interpreted across different eras, jurisdictions, and courts. A senior advocate preparing arguments on "reasonable restriction" under Article 19 of the Indian Constitution must understand not just the current interpretation, but the trajectory of interpretation — how the concept moved from a narrow reading in the 1950s to a broader, more rights-protective reading in recent decades. This work is done manually, through painstaking reading of case law, and it is both time-consuming and prone to gaps.

At the same time, the legal profession faces another pressing challenge: the sheer volume of contracts that need to be reviewed. Corporate legal departments, law firms, and even individual freelancers routinely deal with contracts — employment agreements, non-disclosure agreements, service-level agreements, licensing contracts — that contain risks buried in dense legal language. Missing a problematic indemnification clause or an overly broad non-compete provision can have serious financial and legal consequences. Yet, contract review remains a largely manual process, with junior lawyers spending hours reading through boilerplate text to identify potential issues.

These two problems — understanding how legal concepts evolve and identifying risks in legal contracts — may seem unrelated at first glance. But they share a common root: the difficulty of extracting structured, actionable intelligence from unstructured legal text. And they share a common solution space: modern natural language processing, particularly the transformer-based language models that have revolutionized text understanding since 2018.

Our motivation for building Glaw arose from a simple observation: the tools available to legal professionals have not kept pace with the advances in NLP. While the medical, financial, and scientific domains have seen significant adoption of AI-powered text analysis tools, the legal domain remains underserved. Existing legal technology solutions are either too narrow in scope (focusing only on search, or only on contract management) or too generic (using general-purpose NLP models that lack understanding of legal language). We saw an opportunity to build a platform that combines cutting-edge NLP research with practical legal utility, and that is what Glaw represents.

The name "Glaw" comes from the Welsh word for "rain" — a metaphor for the steady, persistent accumulation of legal knowledge that, over time, shapes the landscape of the law just as rain shapes the earth.

### 1.2 Problem Statement

The legal domain presents two interconnected challenges that current technology solutions fail to address adequately:

**Problem 1: Tracking Semantic Evolution of Legal Concepts.** Legal concepts such as "due process," "natural justice," "reasonable doubt," and "fundamental rights" do not have fixed, immutable definitions. Their meanings evolve through judicial interpretation over decades. Legal researchers and practitioners currently lack computational tools to quantify and visualize this evolution. Existing legal databases provide keyword-based search but cannot capture the semantic trajectory of a concept across time periods. There is no established metric for measuring how much a legal concept's meaning has shifted between two points in time.

**Problem 2: Automated Contract Risk Identification.** Legal contracts contain risks that are often embedded in complex, domain-specific language. Manual contract review is time-consuming, expensive, and inconsistent — different reviewers may identify different risks in the same document. While some contract analysis tools exist, they typically rely on simple keyword matching or require extensive manual configuration. There is a need for an intelligent system that can automatically segment contracts into clauses, apply both rule-based and AI-powered analysis, and produce a quantified risk assessment.

The overarching problem, therefore, is the absence of a unified legal intelligence platform that can both track the evolution of legal meaning over time and provide practical contract analysis capabilities, leveraging state-of-the-art NLP models that understand legal language.

### 1.3 Objectives

The primary objectives of this project are:

1. **To design and implement a multi-model NLP pipeline** capable of generating high-quality contextual embeddings for legal text, using domain-specific transformer models including LexLM Legal-RoBERTa-Large, BGE-Large-EN-v1.5, DeBERTa-v3-Large-MNLI, and GLiNER Large v2.1.

2. **To develop the Semantic Movement Index (SMI)**, a novel quantitative metric that measures the degree of semantic drift in legal concepts between two time periods, based on cosine distance between averaged contextual embeddings.

3. **To build a comprehensive legal case database** spanning multiple jurisdictions (India, United States, European Court of Human Rights) and multiple decades (1950–2026), with over 120,000 cases indexed and searchable.

4. **To implement an automated contract analysis pipeline** that can ingest contracts in PDF and DOCX formats, segment them into individual clauses, apply 14 deterministic rule-based checks, enhance the analysis using a cascading LLM pipeline, and produce a weighted risk score.

5. **To develop a modern, responsive web interface** with interactive timeline visualizations, semantic search capabilities, a case library, and a contract upload and analysis dashboard.

6. **To deploy the platform using containerized microservices** with Docker and Kubernetes, supported by a CI/CD pipeline using GitHub Actions.

### 1.4 Scope of the Project

The scope of Glaw encompasses the following:

**In Scope:**
- Semantic drift analysis for legal concepts across Indian, US, and ECHR jurisdictions
- Support for 15 seed legal concepts for US law and 27 seed legal concepts for Indian law
- Multi-model NLP pipeline with four transformer models
- Contract analysis for PDF and DOCX file formats
- 14 deterministic contract analysis rules covering common risk categories
- LLM-enhanced analysis using a three-tier cascade (Groq, Gemini, Cloudflare Workers AI)
- Web-based frontend with search, timeline visualization, case library, and contract analysis interfaces
- RESTful API with comprehensive endpoint documentation
- Three-tier pricing model (Free, Pro at ₹499/month, Firm at ₹2,999/month)
- Docker-based deployment with Kubernetes orchestration

**Out of Scope:**
- Real-time court case ingestion (the system uses batch processing)
- Legal advice generation (the platform provides analysis, not legal counsel)
- Support for languages other than English
- Mobile native applications (the web interface is responsive but not a native app)
- Integration with existing legal practice management software (planned for future versions)

### 1.5 Organization of the Report

The remainder of this report is organized as follows:

**Chapter 2: Literature Review** provides a comprehensive survey of the existing work in legal technology, NLP applications in the legal domain, semantic similarity and drift detection methods, and contract analysis systems. We identify the research gaps that Glaw aims to address.

**Chapter 3: System Analysis and Design** presents the requirements analysis, system architecture, data flow diagrams, database design, and module-level design of the platform.

**Chapter 4: Implementation** describes the technical implementation in detail, covering the technology stack, the multi-model NLP pipeline, the Semantic Movement Index computation, the data pipeline, the contract analysis pipeline, the API gateway, the frontend, and the deployment infrastructure.

**Chapter 5: Testing and Results** reports on the testing methodology and results, including unit testing, integration testing, performance benchmarks, SMI validation, search accuracy evaluation, and contract analysis accuracy.

**Chapter 6: Conclusion and Future Work** summarizes the achievements of the project, discusses its limitations, outlines planned future enhancements, and provides concluding remarks.


---

## CHAPTER 2: LITERATURE REVIEW

### 2.1 Legal Technology Landscape

The intersection of law and technology — commonly referred to as "legal tech" or "law tech" — has undergone significant transformation over the past two decades. Early legal technology was primarily concerned with document management and case tracking, essentially digitizing paper-based workflows without fundamentally changing how legal work was done. Systems like Westlaw and LexisNexis, which emerged in the 1970s and 1980s, provided electronic access to legal databases but relied on Boolean keyword search, a paradigm that has remained largely unchanged for decades.

The modern legal tech landscape, however, is considerably more ambitious. According to a 2023 report by the Stanford Center on Legal Informatics (CodeX), the legal tech market has grown to encompass over 2,000 companies globally, spanning categories including e-discovery, contract lifecycle management, legal research, compliance monitoring, and dispute resolution. The adoption of artificial intelligence in legal practice has been driven by several factors: the exponential growth in legal data, the pressure to reduce costs in legal services, and the maturation of NLP technologies that can handle the complexity of legal language.

Despite this growth, the legal tech industry remains fragmented. Most solutions address a single narrow use case — contract management, legal research, or compliance — without providing an integrated platform that connects these capabilities. Furthermore, the majority of AI-powered legal tools are designed for the US and UK markets, with limited support for other jurisdictions, particularly the Indian legal system, which has its own unique characteristics including a common law tradition, a vast body of case law in English, and a constitutional framework that has been extensively interpreted over seven decades.

### 2.2 NLP in Legal Domain

Natural language processing has a long history of application in the legal domain, dating back to early information retrieval systems in the 1960s. However, the field has been transformed by the advent of deep learning, particularly the introduction of the Transformer architecture by Vaswani et al. (2017) and the subsequent development of pre-trained language models such as BERT (Devlin et al., 2019), RoBERTa (Liu et al., 2019), and GPT (Radford et al., 2018).

The application of these models to legal text presents unique challenges. Legal language is characterized by long sentences, complex syntactic structures, domain-specific terminology, and a heavy reliance on precedent and cross-referencing. General-purpose language models, trained primarily on web text and Wikipedia, often struggle with legal text because the distribution of language in legal documents differs significantly from their training data.

This observation led to the development of domain-specific legal language models. Chalkidis et al. (2020) introduced Legal-BERT, a BERT model pre-trained on legal corpora including EU legislation, US court opinions, and contracts. Their work demonstrated that domain-specific pre-training significantly improves performance on legal NLP tasks including text classification, named entity recognition, and question answering. Subsequently, Xiao et al. (2021) developed Lawformer, a Longformer-based model designed to handle the long document lengths typical of legal texts.

More recently, the LexLM project (Chalkidis et al., 2023) introduced Legal-RoBERTa-Large, a 355-million parameter model pre-trained on a diverse legal corpus spanning multiple jurisdictions. This model represents the current state of the art for legal text understanding and forms a core component of our pipeline. The key advantage of LexLM over general-purpose models is its vocabulary — it includes legal-specific tokens and has been trained on the distributional patterns of legal language, resulting in embeddings that better capture the nuances of legal meaning.

For semantic search, we evaluated several embedding models and selected BGE-Large-EN-v1.5 (Xiao et al., 2023), a 335-million parameter model from the BAAI (Beijing Academy of Artificial Intelligence) that achieves state-of-the-art performance on the MTEB (Massive Text Embedding Benchmark). While not specifically trained on legal text, BGE-Large produces high-quality dense embeddings that, when combined with legal-specific models, provide excellent retrieval performance.

### 2.3 Semantic Similarity and Drift Detection

The concept of semantic drift — the phenomenon where word meanings change over time — has been studied extensively in computational linguistics. Hamilton et al. (2016) proposed methods for detecting semantic change using word embeddings trained on historical corpora, demonstrating that words like "gay," "broadcast," and "awful" have undergone significant meaning shifts over the past century. Their approach involved training separate Word2Vec models on text from different decades and then aligning the embedding spaces to measure change.

However, the application of semantic drift detection to legal concepts presents challenges that go beyond general-purpose methods. Legal semantic drift is not the same as general linguistic drift. When a word like "gay" shifts from meaning "happy" to referring to sexual orientation, the old meaning largely disappears from common usage. Legal drift is different — the old interpretations do not disappear; they are built upon, refined, distinguished, or occasionally overruled. The meaning of "due process" in 2024 includes, rather than replaces, its meaning in 1950. This cumulative nature of legal meaning requires a different analytical approach.

Existing work on semantic change detection in the legal domain is sparse. Ash and Chen (2019) analyzed the evolution of legal language in US Supreme Court opinions using word embeddings, but their work focused on vocabulary-level changes rather than concept-level semantic drift. Livermore et al. (2017) used topic modeling to study the evolution of Supreme Court doctrine, but topic models capture thematic shifts rather than the fine-grained semantic changes in individual concepts.

Our approach differs from these prior works in several important ways. First, we use contextual embeddings from transformer models rather than static word embeddings, which allows us to capture the meaning of a legal concept as it appears in specific judicial contexts rather than as an averaged representation across all contexts. Second, we introduce the Semantic Movement Index (SMI), a quantitative metric specifically designed to measure legal concept drift, with bootstrap confidence intervals to assess statistical significance. Third, we combine the SMI with a classification model (DeBERTa-v3-Large-MNLI) to categorize the nature of the drift (expansion, narrowing, or reinterpretation), not just its magnitude.

### 2.4 Contract Analysis Systems

Automated contract analysis has been a focus of legal tech research and industry for over a decade. Early systems relied on template matching and regular expressions to identify specific clause types. More sophisticated approaches have employed machine learning for clause classification, with Chalkidis et al. (2018) demonstrating that neural networks can classify contract clauses into predefined categories with high accuracy.

The emergence of large language models (LLMs) has opened new possibilities for contract analysis. Models like GPT-4, Claude, and Gemini can understand contract language at a level that was previously impossible, identifying not just the presence of specific clause types but also the implications and potential risks of specific contractual provisions. However, relying solely on LLMs for contract analysis presents challenges: they can hallucinate (generate plausible but incorrect analysis), they are expensive to run at scale, and their behavior can be unpredictable.

The hybrid approach — combining deterministic rule-based analysis with LLM-powered enhancement — has emerged as a best practice in the industry. Companies like Kira Systems, LawGeex, and Ironclad have adopted variations of this approach, using rules for well-defined checks and ML/LLM models for more nuanced analysis. Our contract analysis pipeline follows this hybrid philosophy, with 14 deterministic rules providing a reliable baseline and a cascading LLM pipeline adding depth and context to the analysis.

The cascading LLM approach is particularly noteworthy. Rather than relying on a single LLM provider, we implemented a three-tier cascade: Groq (for fast inference using open-source models), Gemini (Google's multimodal model for complex analysis), and Cloudflare Workers AI (as a fallback for cost-effective processing). This cascade provides resilience against provider outages, manages costs by routing simpler queries to cheaper providers, and ensures that the system can always produce a result even if one or two providers are unavailable.

### 2.5 Existing Solutions and Their Limitations

Several existing platforms address parts of the problem space that Glaw targets, but none provides the integrated capability we have built.

**Westlaw and LexisNexis** remain the dominant legal research platforms globally. They provide comprehensive case law databases with keyword search, citation tracking, and some basic analytics. However, they do not offer semantic search, have no concept evolution tracking capability, and their contract analysis features are limited. Their pricing is also prohibitive for individual practitioners and small firms, particularly in India.

**CaseMine and Indian Kanoon** serve the Indian legal market. Indian Kanoon provides free access to Indian court judgments with keyword search, while CaseMine offers AI-powered legal research with citation analysis. Neither platform tracks semantic evolution of legal concepts, and neither offers contract analysis capabilities.

**Kira Systems and LawGeex** focus specifically on contract analysis. Kira uses machine learning to extract and analyze contract provisions, while LawGeex automates contract review against predefined policies. Both are enterprise-focused products with pricing that puts them out of reach for most Indian legal professionals, and neither integrates legal research or concept evolution tracking.

**Google Scholar** provides free access to legal opinions and law review articles, but its search is keyword-based, it lacks any analytical capabilities, and it does not cover Indian case law comprehensively.

### 2.6 Research Gap

Based on our literature review, we identified the following research gaps that Glaw addresses:

1. **No existing tool quantifies semantic drift in legal concepts.** While semantic change detection has been studied in general linguistics, there is no established metric or tool for measuring how legal concepts evolve over time. The SMI fills this gap.

2. **No platform combines legal concept evolution tracking with contract analysis.** Existing solutions address one or the other, but not both. Glaw provides an integrated platform that serves both legal researchers and practitioners.

3. **Limited application of domain-specific transformer models to Indian legal text.** Most legal NLP research focuses on US and EU law. Our work applies state-of-the-art legal language models to Indian case law, contributing to an underserved area of research.

4. **No open, affordable legal intelligence platform for the Indian market.** Existing solutions are either too expensive (Westlaw, Kira Systems) or too limited in capability (Indian Kanoon). Glaw's tiered pricing model (including a free tier) makes advanced legal AI accessible to a broader audience.

5. **No hybrid contract analysis system with cascading LLM fallback.** While hybrid rule-based and ML approaches exist, the specific architecture of a cascading multi-provider LLM pipeline for contract analysis is, to our knowledge, novel.


---

## CHAPTER 3: SYSTEM ANALYSIS AND DESIGN

### 3.1 System Requirements

#### 3.1.1 Functional Requirements

The functional requirements of the Glaw platform were elicited through a combination of stakeholder interviews (with practicing lawyers and legal researchers), analysis of existing legal tech solutions, and iterative refinement during the development process. The following table summarizes the key functional requirements:

**Table 3.1: Functional Requirements**

| ID | Requirement | Priority | Module |
|----|-------------|----------|--------|
| FR-01 | The system shall allow users to search for legal concepts and retrieve relevant case law | High | LCET |
| FR-02 | The system shall compute the Semantic Movement Index for a given legal concept across specified time periods | High | LCET |
| FR-03 | The system shall display a timeline visualization showing how a legal concept's meaning has evolved | High | LCET |
| FR-04 | The system shall support semantic search using dense vector embeddings, not just keyword matching | High | LCET |
| FR-05 | The system shall extract named entities (judges, courts, statutes, parties) from case texts | Medium | LCET |
| FR-06 | The system shall classify the nature of semantic drift (stable, minor drift, moderate drift, significant drift, major transformation) | High | LCET |
| FR-07 | The system shall accept contract uploads in PDF and DOCX formats | High | Contract |
| FR-08 | The system shall segment uploaded contracts into individual clauses | High | Contract |
| FR-09 | The system shall apply 14 deterministic rules to identify contractual risks | High | Contract |
| FR-10 | The system shall enhance rule-based analysis with LLM-powered insights | Medium | Contract |
| FR-11 | The system shall compute a weighted risk score for each analyzed contract | High | Contract |
| FR-12 | The system shall generate a downloadable analysis report | Medium | Contract |
| FR-13 | The system shall support user authentication and authorization | High | Platform |
| FR-14 | The system shall enforce usage limits based on the user's subscription tier | Medium | Platform |
| FR-15 | The system shall provide a RESTful API for programmatic access | Medium | Platform |

#### 3.1.2 Non-Functional Requirements

**Table 3.2: Non-Functional Requirements**

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-01 | Response time for semantic search queries | < 2 seconds |
| NFR-02 | Response time for SMI computation | < 10 seconds |
| NFR-03 | Response time for contract analysis (per page) | < 5 seconds |
| NFR-04 | System availability | 99.5% uptime |
| NFR-05 | Concurrent user support | 100 simultaneous users |
| NFR-06 | Data security | Encryption at rest and in transit |
| NFR-07 | Scalability | Horizontal scaling via Kubernetes |
| NFR-08 | Browser compatibility | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| NFR-09 | Accessibility | WCAG 2.1 Level AA compliance |
| NFR-10 | API rate limiting | Configurable per subscription tier |

#### 3.1.3 Hardware Requirements

**Table 3.3: Hardware Requirements**

| Component | Development Environment | Production Environment |
|-----------|------------------------|----------------------|
| CPU | Intel i7 / Apple M1 or equivalent | 8 vCPUs (cloud instance) |
| RAM | 16 GB minimum | 32 GB minimum |
| GPU | NVIDIA GPU with 8GB VRAM (for model inference) | NVIDIA T4 or equivalent |
| Storage | 100 GB SSD | 500 GB SSD |
| Network | Broadband internet connection | 1 Gbps network interface |

The hardware requirements are driven primarily by the transformer models used in the NLP pipeline. The LexLM Legal-RoBERTa-Large model (355M parameters) and DeBERTa-v3-Large-MNLI (400M parameters) require significant memory for inference. During development, we used a combination of local machines with NVIDIA GPUs and cloud-based GPU instances for batch processing of embeddings. The GLiNER Large v2.1 model, at 1.7 GB, is the largest single model in the pipeline and requires careful memory management during inference.

#### 3.1.4 Software Requirements

**Table 3.4: Software Requirements**

| Category | Software | Version |
|----------|----------|---------|
| Operating System | Ubuntu 22.04 LTS / macOS 14+ | — |
| Runtime | Python | 3.10+ |
| Runtime | Node.js | 18+ |
| Backend Framework | FastAPI | 0.104+ |
| Frontend Framework | Next.js | 14.x |
| UI Library | React | 18.x |
| CSS Framework | Tailwind CSS | 3.x |
| ML Framework | PyTorch | 2.0+ |
| ML Library | Hugging Face Transformers | 4.35+ |
| Database | SQLite (development) / PostgreSQL (production) | 3.x / 15+ |
| Containerization | Docker | 24+ |
| Orchestration | Kubernetes | 1.28+ |
| CI/CD | GitHub Actions | — |
| Version Control | Git | 2.40+ |

### 3.2 System Architecture

#### 3.2.1 Overall Architecture

The Glaw platform follows a modular, microservices-inspired architecture, though for practical reasons during development, the backend services are organized as a monolithic FastAPI application with clearly separated modules that can be extracted into independent services as the platform scales.

The overall architecture consists of four primary layers:

1. **Presentation Layer:** The Next.js 14 frontend application, which communicates with the backend exclusively through RESTful API calls. The frontend is a single-page application (SPA) with server-side rendering (SSR) for initial page loads, providing both fast interactivity and good SEO characteristics.

2. **API Gateway Layer:** A FastAPI-based API gateway that handles authentication, rate limiting, request routing, and response formatting. All client requests pass through this gateway before being routed to the appropriate backend module.

3. **Service Layer:** The core business logic, organized into two primary modules:
   - The **LCET Module**, which handles legal concept search, embedding generation, SMI computation, drift classification, and named entity recognition.
   - The **Contract Analysis Module**, which handles document ingestion, clause segmentation, rule-based analysis, LLM-enhanced analysis, and risk scoring.

4. **Data Layer:** The persistence layer, consisting of SQLite databases for development and PostgreSQL for production, along with file storage for uploaded contracts and pre-computed embedding caches.

The communication between layers follows a strict top-down pattern: the frontend calls the API gateway, the gateway calls the service layer, and the service layer accesses the data layer. There are no direct connections between the frontend and the data layer, ensuring proper separation of concerns and security.

#### 3.2.2 LCET Module Architecture

The LCET module is the more research-oriented component of the platform. Its architecture is designed around the concept of a **multi-model NLP pipeline**, where different transformer models are responsible for different aspects of the analysis.

The pipeline operates as follows: when a user searches for a legal concept (e.g., "due process"), the system first retrieves relevant cases from the database using a combination of keyword matching and semantic search (powered by BGE-Large-EN-v1.5 embeddings). The retrieved cases are then grouped by time period (typically by decade). For each time period, the system generates contextual embeddings using LexLM Legal-RoBERTa-Large, capturing how the concept is used in the specific judicial context of that era. The SMI is then computed by comparing the averaged embeddings between consecutive time periods. Finally, DeBERTa-v3-Large-MNLI is used to classify the nature of any detected drift, and GLiNER Large v2.1 extracts named entities (judges, courts, statutes, parties) from the case texts to provide additional context.

This multi-model approach is deliberate. Each model excels at a specific task, and by combining them, we achieve a level of analysis that no single model could provide. LexLM understands legal language deeply but is not optimized for search; BGE-Large is excellent for search but lacks legal domain knowledge; DeBERTa excels at natural language inference but is not designed for embedding generation; and GLiNER is specialized for entity recognition. Together, they form a comprehensive analytical pipeline.

#### 3.2.3 Contract Analysis Module Architecture

The Contract Analysis module follows a sequential pipeline architecture with five stages:

1. **Document Extraction:** The uploaded file (PDF or DOCX) is parsed to extract raw text. For PDFs, we use a combination of PyPDF2 and pdfplumber to handle both text-based and scanned documents. For DOCX files, we use python-docx to extract text while preserving structural information (headings, paragraphs, lists).

2. **Clause Segmentation:** The extracted text is segmented into individual clauses using a combination of structural cues (headings, numbering patterns) and NLP-based sentence boundary detection. This is a critical step because the accuracy of downstream analysis depends on correctly identifying clause boundaries.

3. **Rule-Based Analysis:** Each segmented clause is evaluated against 14 deterministic rules that check for common contractual risks. These rules are implemented as pattern-matching functions that look for specific language patterns, missing protections, and potentially unfavorable terms.

4. **LLM Enhancement:** Clauses that trigger rule-based flags, as well as a sample of clauses that do not, are sent to the cascading LLM pipeline for deeper analysis. The LLM provides natural language explanations of identified risks, suggests alternative language, and identifies risks that the rule-based system may have missed.

5. **Risk Scoring:** The results from both the rule-based and LLM-enhanced analysis are combined to produce a weighted risk score. Each identified risk is assigned a severity level (low, medium, high, critical) with corresponding weights (1.5, 3, 5, 7), and the overall contract risk score is computed as a normalized aggregate.

#### 3.2.4 API Gateway Architecture

The API gateway is implemented as a FastAPI application with middleware for cross-cutting concerns. The gateway handles:

- **Authentication:** JWT-based token authentication with refresh token support. Users authenticate via email/password or OAuth providers, and receive a JWT that must be included in subsequent API requests.
- **Rate Limiting:** Configurable rate limits based on the user's subscription tier. Free tier users are limited to 10 searches per day and 3 contract analyses per month. Pro users get 100 searches per day and 30 contract analyses per month. Firm users get unlimited access.
- **Request Routing:** Incoming requests are routed to the appropriate backend module based on the URL path. LCET-related requests go to the LCET module, contract-related requests go to the Contract Analysis module.
- **Response Formatting:** All API responses follow a consistent JSON structure with status codes, data payloads, and error messages.
- **CORS Handling:** Cross-Origin Resource Sharing headers are configured to allow requests from the frontend domain while blocking unauthorized origins.

### 3.3 Data Flow Diagrams

**Level-0 DFD (Context Diagram):**

The context diagram shows the Glaw system as a single process interacting with three external entities: the User (who submits search queries and uploads contracts), the External Data Sources (CourtListener, HUDOC, Indian Kanoon, Hugging Face datasets), and the LLM Providers (Groq, Gemini, Cloudflare Workers AI). The user sends search queries and contract documents to the system and receives analysis results. The system fetches case data from external sources during the data pipeline phase and sends contract clauses to LLM providers for enhanced analysis.

**Level-1 DFD — LCET Module:**

The LCET module's data flow begins with the user's search query entering the Search Processing subprocess, which performs keyword matching and semantic search against the Case Database. Retrieved cases flow to the Embedding Generation subprocess, which uses LexLM to generate contextual embeddings. These embeddings flow to the SMI Computation subprocess, which calculates the Semantic Movement Index and sends the results to the Drift Classification subprocess (using DeBERTa). Simultaneously, the retrieved case texts flow to the Entity Extraction subprocess (using GLiNER). All results converge at the Response Assembly subprocess, which formats the data for the API response.

**Level-1 DFD — Contract Analysis Module:**

The contract analysis data flow begins with the uploaded document entering the Document Extraction subprocess. The extracted text flows to the Clause Segmentation subprocess, which produces individual clauses. These clauses flow in parallel to the Rule-Based Analysis subprocess and the LLM Enhancement subprocess. The results from both subprocesses converge at the Risk Scoring subprocess, which computes the weighted risk score and assembles the final analysis report.

### 3.4 Database Design

The database design follows a relational model with the following primary entities:

**Cases Table:** Stores metadata and text for each legal case. Fields include case_id (primary key), title, court, jurisdiction (India/US/ECHR), date_decided, full_text, summary, citation, and source (CourtListener/HUDOC/IndianKanoon/HuggingFace).

**Concepts Table:** Stores the seed legal concepts being tracked. Fields include concept_id (primary key), name, jurisdiction, description, and category.

**Embeddings Table:** Stores pre-computed embeddings for case-concept pairs. Fields include embedding_id (primary key), case_id (foreign key), concept_id (foreign key), model_name, embedding_vector (stored as a binary blob), and computed_at timestamp.

**SMI_Results Table:** Stores computed SMI values. Fields include smi_id (primary key), concept_id (foreign key), period_start, period_end, smi_value, confidence_lower, confidence_upper, drift_category, and computed_at.

**Contracts Table:** Stores uploaded contracts and their analysis results. Fields include contract_id (primary key), user_id (foreign key), filename, upload_date, file_type, raw_text, overall_risk_score, and status.

**Clauses Table:** Stores segmented clauses from analyzed contracts. Fields include clause_id (primary key), contract_id (foreign key), clause_number, clause_text, clause_type, and risk_level.

**Findings Table:** Stores individual risk findings from contract analysis. Fields include finding_id (primary key), clause_id (foreign key), rule_id, severity, description, suggestion, and source (rule-based or LLM).

**Users Table:** Stores user account information. Fields include user_id (primary key), email, password_hash, name, subscription_tier, created_at, and last_login.

The entity-relationship diagram shows one-to-many relationships between Cases and Embeddings, Concepts and Embeddings, Concepts and SMI_Results, Users and Contracts, Contracts and Clauses, and Clauses and Findings.

### 3.5 Module Design

The system is organized into the following Python modules:

- **`api/`** — API gateway, route definitions, middleware, authentication
- **`lcet/`** — LCET module: search, embeddings, SMI computation, drift classification, entity extraction
- **`contracts/`** — Contract analysis module: extraction, segmentation, rules, LLM integration, scoring
- **`models/`** — Database models and ORM definitions
- **`data/`** — Data pipeline: scrapers, preprocessors, indexers
- **`config/`** — Configuration management, environment variables, model paths
- **`utils/`** — Shared utilities: logging, error handling, file operations

Each module follows a consistent internal structure with a clear separation between the interface (API endpoints), the business logic (service functions), and the data access (repository functions). This structure facilitates testing, as each layer can be tested independently with appropriate mocking.


---

## CHAPTER 4: IMPLEMENTATION

### 4.1 Technology Stack

#### 4.1.1 Backend (Python, FastAPI)

The backend of Glaw is built entirely in Python 3.10, using FastAPI as the web framework. We chose FastAPI over alternatives like Django REST Framework and Flask for several reasons. First, FastAPI's native support for asynchronous request handling (via Python's `asyncio`) is critical for our use case, where API endpoints may need to wait for model inference, database queries, and external LLM API calls concurrently. Second, FastAPI's automatic OpenAPI documentation generation saves significant development time and ensures that our API documentation stays in sync with the actual implementation. Third, FastAPI's type hint-based request validation (using Pydantic models) catches malformed requests at the framework level, reducing the amount of validation code we need to write.

The backend is structured as a single FastAPI application with multiple routers, each corresponding to a functional module. The main application file mounts routers for authentication (`/auth`), LCET operations (`/lcet`), contract analysis (`/contracts`), and administrative functions (`/admin`). Middleware is used for CORS handling, request logging, and authentication token validation.

For database access, we use SQLAlchemy as the ORM with SQLite for development and PostgreSQL for production. The choice of SQLite for development was pragmatic — it requires no separate database server, making it easy for all team members to run the application locally. The migration to PostgreSQL for production is handled through SQLAlchemy's database-agnostic query interface, with only the connection string changing between environments.

#### 4.1.2 Frontend (Next.js, React, Tailwind)

The frontend is built with Next.js 14, React 18, and Tailwind CSS 3. We chose Next.js for its hybrid rendering capabilities — pages that benefit from SEO (like the landing page and documentation) use server-side rendering, while interactive pages (like the search interface and contract analysis dashboard) use client-side rendering for responsiveness.

The UI follows a dark theme design, which was a deliberate choice based on user research indicating that legal professionals often work long hours and prefer dark interfaces that reduce eye strain. The color palette uses deep navy and charcoal backgrounds with accent colors in teal and amber for interactive elements and alerts.

For data visualization, we use two libraries: D3.js for the timeline visualization that shows concept evolution over time, and Three.js for a 3D interactive visualization on the landing page that represents the interconnectedness of legal concepts as a network graph. The Three.js visualization was implemented by Priya M and serves primarily as an engagement feature on the landing page, while the D3.js timeline is the core analytical visualization used throughout the LCET module.

The frontend communicates with the backend exclusively through RESTful API calls using the `fetch` API with a custom wrapper that handles authentication token management, error handling, and request retries. State management is handled through React's built-in `useState` and `useContext` hooks, supplemented by SWR (stale-while-revalidate) for data fetching with caching.

#### 4.1.3 ML Models (LexLM, BGE, DeBERTa, GLiNER)

The machine learning component of Glaw relies on four pre-trained transformer models, each serving a distinct purpose in the pipeline. All models are loaded from the Hugging Face Model Hub and cached locally to avoid repeated downloads.

**Table 4.1: Model Specifications**

| Model | Parameters | Size on Disk | Purpose | Input Length |
|-------|-----------|-------------|---------|-------------|
| LexLM Legal-RoBERTa-Large | 355M | ~1.4 GB | Legal text embeddings | 512 tokens |
| BGE-Large-EN-v1.5 | 335M | ~1.3 GB | Semantic search embeddings | 512 tokens |
| DeBERTa-v3-Large-MNLI | 400M | ~1.6 GB | Natural language inference / drift classification | 512 tokens |
| GLiNER Large v2.1 | ~400M | ~1.7 GB | Named entity recognition | 512 tokens |

The total model footprint is approximately 6 GB on disk and requires roughly 12 GB of GPU memory for simultaneous inference. In practice, we load models on demand and unload them when not in use to manage memory constraints, particularly in the development environment where GPU memory is limited.

Model inference is performed using PyTorch with CUDA acceleration when available, falling back to CPU inference when no GPU is present. For batch processing (e.g., generating embeddings for the entire case database), we use PyTorch's DataLoader with batched inference to maximize GPU utilization.

#### 4.1.4 Database (SQLite, PostgreSQL)

As mentioned in the system design chapter, we use a dual-database strategy. SQLite serves as the development database, stored as a single file in the project directory. This approach has several advantages for development: no database server to install or configure, easy database resets (just delete the file), and portability across development machines.

For production, we use PostgreSQL 15, which provides the robustness, concurrency handling, and advanced query capabilities needed for a multi-user application. PostgreSQL's `pgvector` extension is used to store and query embedding vectors efficiently, enabling fast nearest-neighbor search for the semantic search feature. The `pgvector` extension supports both exact and approximate nearest-neighbor search using IVFFlat and HNSW indexes, and we use HNSW indexes for their superior query performance at the cost of slightly higher index build time.

### 4.2 Multi-Model NLP Pipeline

The multi-model NLP pipeline is the intellectual core of the LCET module. The decision to use four separate models rather than a single large model was driven by the principle that specialized models outperform generalist models on specific tasks, and that the overhead of managing multiple models is justified by the improvement in analysis quality.

#### 4.2.1 LexLM Legal-RoBERTa-Large (Legal Embeddings)

LexLM Legal-RoBERTa-Large is a 355-million parameter language model based on the RoBERTa architecture, pre-trained on a large corpus of legal text from multiple jurisdictions. We use this model specifically for generating contextual embeddings of legal text — that is, dense vector representations that capture the meaning of a legal concept as it appears in a specific judicial context.

The embedding generation process works as follows. Given a case text and a target legal concept, we first locate all occurrences of the concept (and its variants) within the case text. For each occurrence, we extract a context window of 256 tokens centered on the concept mention. This context window is then passed through the LexLM model, and we extract the hidden state corresponding to the concept tokens from the last four layers of the model. These hidden states are averaged (both across layers and across tokens within the concept span) to produce a single 1024-dimensional embedding vector that represents the meaning of the concept in that specific context.

This approach — extracting embeddings from specific context windows rather than from the entire document — is critical for capturing how a concept is used in a particular case. A single case may mention "due process" multiple times in different contexts (e.g., in the facts section, in the legal analysis, in the conclusion), and each mention may carry slightly different semantic weight. By generating separate embeddings for each mention and then averaging them, we capture the overall semantic profile of the concept within that case.

#### 4.2.2 BGE-Large-EN-v1.5 (Semantic Search)

BGE-Large-EN-v1.5 is used for the semantic search functionality of the platform. Unlike LexLM, which generates embeddings for specific concept mentions within case texts, BGE-Large generates embeddings for entire text passages, optimized for retrieval tasks.

When a user enters a search query (e.g., "evolution of privacy rights in digital age"), the query is encoded into a 1024-dimensional vector using BGE-Large. This query vector is then compared against pre-computed passage embeddings stored in the database using cosine similarity. The top-k most similar passages are retrieved and presented to the user, along with their source cases and relevance scores.

The pre-computation of passage embeddings is performed during the data pipeline phase. Each case in the database is split into passages of approximately 256 tokens with 64-token overlap, and each passage is encoded using BGE-Large. The resulting embeddings are stored in the database (using PostgreSQL's pgvector extension in production) and indexed for fast retrieval.

We chose BGE-Large over other embedding models (including OpenAI's text-embedding-ada-002 and Cohere's embed-v3) for two reasons: it runs locally without requiring API calls to external services (important for data privacy and cost management), and it achieves competitive performance on the MTEB benchmark, particularly on retrieval tasks.

#### 4.2.3 DeBERTa-v3-Large-MNLI (Drift Classification)

DeBERTa-v3-Large-MNLI is a 400-million parameter model fine-tuned on the Multi-Genre Natural Language Inference (MNLI) dataset. We use this model for a specific and somewhat unconventional purpose: classifying the nature of semantic drift detected by the SMI.

The SMI tells us how much a concept's meaning has changed, but it does not tell us how it has changed. A high SMI value could indicate that the concept has been expanded (e.g., "privacy" expanding to include digital privacy), narrowed (e.g., "sovereign immunity" being restricted by legislative exceptions), or reinterpreted (e.g., "equal protection" being applied to new categories of discrimination).

To classify the nature of drift, we formulate the problem as a natural language inference task. We construct premise-hypothesis pairs where the premise is a representative sentence from the earlier time period and the hypothesis is a representative sentence from the later time period. We then use DeBERTa to classify the relationship as entailment (the later meaning is consistent with and extends the earlier meaning — suggesting expansion), contradiction (the later meaning conflicts with the earlier meaning — suggesting reinterpretation), or neutral (the meanings are related but neither entails nor contradicts — suggesting parallel evolution).

This classification is performed on multiple premise-hypothesis pairs for each concept-period combination, and the majority vote determines the overall drift classification. While this approach is heuristic rather than definitive, it provides useful qualitative context that complements the quantitative SMI value.

#### 4.2.4 GLiNER Large v2.1 (Named Entity Recognition)

GLiNER (Generalist and Lightweight model for Named Entity Recognition) Large v2.1 is used for extracting named entities from case texts. Unlike traditional NER models that are limited to a fixed set of entity types (person, organization, location), GLiNER supports zero-shot entity recognition — it can extract entities of any type specified at inference time.

We use GLiNER to extract the following entity types from legal case texts:
- **Judge names** — the judges who authored or participated in the decision
- **Court names** — the court that issued the decision
- **Statute references** — references to specific laws, acts, and constitutional provisions
- **Party names** — the parties involved in the case
- **Legal concepts** — mentions of legal concepts and doctrines
- **Case citations** — references to other cases

The extracted entities serve multiple purposes. They populate the metadata fields in the case database, enable faceted search (e.g., "show me all cases by Justice [Name] that discuss 'natural justice'"), and provide context for the SMI analysis by identifying which judges and courts have been most influential in shaping a concept's evolution.

### 4.3 Semantic Movement Index (SMI)

The Semantic Movement Index is the central analytical contribution of the LCET module. It provides a quantitative measure of how much a legal concept's meaning has shifted between two time periods.

#### 4.3.1 Mathematical Formulation

The SMI is defined as follows. Let C be a legal concept, and let P₁ and P₂ be two time periods (e.g., 1990–2000 and 2000–2010). Let E₁ = {e₁₁, e₁₂, ..., e₁ₙ} be the set of contextual embeddings for concept C generated from cases decided during period P₁, and let E₂ = {e₂₁, e₂₂, ..., e₂ₘ} be the corresponding set for period P₂.

The average embedding for each period is computed as:

```
ē₁ = (1/n) Σᵢ e₁ᵢ
ē₂ = (1/m) Σⱼ e₂ⱼ
```

The SMI is then defined as:

```
SMI(C, P₁, P₂) = 1 - cosine_similarity(ē₁, ē₂)
```

where cosine similarity is defined as:

```
cosine_similarity(a, b) = (a · b) / (||a|| × ||b||)
```

The SMI ranges from 0 to 2, where 0 indicates identical meaning (the averaged embeddings point in exactly the same direction), 1 indicates orthogonal meaning (no semantic relationship), and values approaching 2 indicate opposite meaning. In practice, for legal concepts, SMI values typically range from 0.01 (very stable concepts) to 0.15 (concepts undergoing significant reinterpretation), with values above 0.20 being rare and usually indicating a fundamental shift in legal doctrine.

The choice of cosine distance (1 minus cosine similarity) rather than Euclidean distance is deliberate. Cosine distance measures the angular difference between embedding vectors, which is more meaningful for comparing semantic representations than Euclidean distance, which is sensitive to vector magnitude. Two embeddings can have very different magnitudes (because they are derived from different numbers of context windows) but still point in similar semantic directions, and cosine distance correctly identifies them as similar.

#### 4.3.2 Bootstrap Confidence Intervals

A single SMI value, while informative, does not convey the uncertainty inherent in the measurement. The SMI is computed from a finite sample of cases, and different samples would produce different SMI values. To quantify this uncertainty, we compute bootstrap confidence intervals.

The bootstrap procedure works as follows:

1. From the set of embeddings E₁ (containing n embeddings), draw a random sample of size n with replacement. Compute the average of this sample to get ē₁*.
2. From the set of embeddings E₂ (containing m embeddings), draw a random sample of size m with replacement. Compute the average of this sample to get ē₂*.
3. Compute SMI* = 1 - cosine_similarity(ē₁*, ē₂*).
4. Repeat steps 1–3 for B iterations (we use B = 1000).
5. The 95% confidence interval is given by the 2.5th and 97.5th percentiles of the B bootstrap SMI values.

The confidence interval provides crucial context for interpreting the SMI. A concept with an SMI of 0.08 and a 95% CI of [0.03, 0.13] has clearly drifted, but the magnitude is uncertain. A concept with an SMI of 0.08 and a 95% CI of [0.07, 0.09] has drifted by a more precisely estimated amount. The width of the confidence interval is influenced by the number of cases available in each period and the variability of the concept's usage across those cases.

#### 4.3.3 Drift Classification Thresholds

Based on our analysis of SMI values across multiple legal concepts and jurisdictions, we established the following classification thresholds:

**Table 4.2: Drift Classification Thresholds**

| SMI Range | Classification | Interpretation |
|-----------|---------------|----------------|
| 0.00 – 0.02 | Stable | The concept's meaning has remained essentially unchanged |
| 0.02 – 0.05 | Minor Drift | Small shifts in emphasis or application, but core meaning intact |
| 0.05 – 0.10 | Moderate Drift | Noticeable evolution in meaning, possibly due to landmark cases |
| 0.10 – 0.15 | Significant Drift | Substantial change in how the concept is understood and applied |
| > 0.15 | Major Transformation | Fundamental reinterpretation of the concept |

These thresholds were calibrated empirically by computing SMI values for concepts with known historical trajectories. For example, the concept of "privacy" in Indian law underwent a well-documented transformation following the Supreme Court's landmark decision in *Justice K.S. Puttaswamy v. Union of India* (2017), which recognized the right to privacy as a fundamental right. Our SMI computation for "privacy" shows a significant spike in the 2010–2020 period, with an SMI value of 0.12, consistent with the "Significant Drift" classification. Similarly, the concept of "due process" in US law shows elevated SMI values in the 1950–1970 period, corresponding to the Warren Court's expansion of due process protections, which serves as a validation of our thresholds.


### 4.4 Data Pipeline

The data pipeline is responsible for acquiring, preprocessing, and indexing the legal case data that powers the LCET module. This pipeline was primarily designed and implemented by Karthik V, with contributions from Arjun R on the preprocessing and embedding generation stages.

#### 4.4.1 Data Sources (CourtListener, HUDOC, Indian Kanoon)

The platform draws on four primary data sources, each covering a different jurisdiction and time period:

**Table 4.3: Data Source Summary**

| Source | Jurisdiction | Cases | Time Period | Format | Access Method |
|--------|-------------|-------|-------------|--------|---------------|
| Hugging Face (Indian Courts) | India | 120,000+ | Various | JSON | Dataset API |
| CourtListener | United States | ~800 | 1950–2024 | JSON | REST API |
| HUDOC | ECHR | ~500 | 1960–2024 | HTML | Web Scraping |
| Indian Kanoon | India | ~5,000 | 1950–2026 | HTML | Web Scraping |

The Hugging Face dataset of Indian court cases is the largest single data source and was obtained from a publicly available dataset on the Hugging Face Hub. This dataset contains judgments from various Indian courts including the Supreme Court, High Courts, and select tribunals. The cases are provided in a structured JSON format with fields for the case title, court, date, and full text.

CourtListener, operated by the Free Law Project, provides free access to US federal and state court opinions through a well-documented REST API. We used the API to retrieve opinions from the US Supreme Court, Circuit Courts of Appeals, and select District Courts, focusing on cases that discuss the 15 seed legal concepts we track for US law.

HUDOC (Human Rights Documentation) is the European Court of Human Rights' case law database. It provides access to judgments, decisions, and advisory opinions. We developed a web scraper to extract cases from HUDOC, focusing on cases that discuss fundamental rights concepts that have parallels in Indian and US law.

Indian Kanoon is a free search engine for Indian legal documents. While it does not provide a formal API, we developed a web scraping agent that can search for cases by concept and time period, extract the full text of judgments, and store them in our database. The scraper is designed to be respectful of the site's resources, implementing rate limiting (one request per 2 seconds) and caching to avoid redundant requests. The scraper covers cases from 1950 (the year the Indian Constitution came into effect) through 2026 (including recently decided cases).

#### 4.4.2 Web Scraping Agent

The web scraping agent is a Python module that handles the extraction of case data from sources that do not provide formal APIs (HUDOC and Indian Kanoon). The agent is built using the `requests` library for HTTP communication and `BeautifulSoup` for HTML parsing.

The agent operates in two modes:

1. **Discovery Mode:** Given a legal concept and a jurisdiction, the agent searches the target source for relevant cases, extracting case identifiers and basic metadata (title, date, court). This mode is used to build the initial case inventory.

2. **Extraction Mode:** Given a list of case identifiers, the agent retrieves the full text of each case, parses the HTML to extract the judgment text (excluding headers, footers, and navigation elements), and stores the result in the database.

The agent implements several robustness features: exponential backoff for failed requests, session management to handle cookies and authentication, user-agent rotation to avoid blocking, and a local cache to avoid re-downloading previously retrieved cases. All scraping activity is logged for auditing purposes.

For Indian Kanoon specifically, the scraper handles the site's pagination (which uses a non-standard URL scheme), extracts case metadata from search result pages, and follows links to individual case pages to retrieve full texts. The scraper also handles the site's occasional use of JavaScript-rendered content by falling back to a headless browser (Playwright) when the standard HTTP request does not return the expected content.

#### 4.4.3 Preprocessing and Indexing

Raw case texts undergo several preprocessing steps before they are ready for analysis:

1. **Text Cleaning:** Removal of HTML artifacts, special characters, excessive whitespace, and formatting inconsistencies. Legal texts often contain artifacts from OCR processing (for older cases) or HTML-to-text conversion, and these must be cleaned to avoid corrupting the embeddings.

2. **Section Identification:** Many judgments follow a standard structure (facts, issues, arguments, analysis, conclusion). We use a combination of regex patterns and heuristic rules to identify these sections, which allows us to weight different sections differently during embedding generation (e.g., the legal analysis section is more relevant for concept evolution than the facts section).

3. **Concept Mention Detection:** For each seed concept, we identify all mentions within each case text, including variant forms (e.g., "due process" also matches "due process of law," "procedural due process," "substantive due process"). This is done using a combination of exact string matching and fuzzy matching (using the `rapidfuzz` library) to handle minor spelling variations.

4. **Metadata Extraction:** Using GLiNER and regex patterns, we extract structured metadata from the case text: judge names, court name, date of decision, parties, and cited statutes. This metadata is stored in the database and used for faceted search and filtering.

5. **Indexing:** Processed cases are indexed in the database with full-text search indexes (using PostgreSQL's `tsvector` in production) and vector indexes (using `pgvector` for embedding-based search). The dual indexing strategy allows the search system to combine keyword matching with semantic similarity for hybrid search.

#### 4.4.4 Embedding Generation

Embedding generation is the most computationally intensive step in the data pipeline. For each case-concept pair, we generate contextual embeddings using LexLM Legal-RoBERTa-Large, and for each case passage, we generate search embeddings using BGE-Large-EN-v1.5.

The embedding generation process is designed for batch processing. Cases are loaded in batches of 32, context windows are extracted and tokenized, and the tokenized inputs are passed through the model in batches using PyTorch's DataLoader. On an NVIDIA T4 GPU, the pipeline processes approximately 50 cases per minute for LexLM embeddings and 100 passages per minute for BGE-Large embeddings.

The total embedding generation for the full dataset (120,000+ cases) required approximately 40 hours of GPU time. To manage this, we used a combination of local GPU resources and cloud-based GPU instances (via Google Colab Pro and AWS EC2 g4dn instances). The generated embeddings are stored as binary blobs in the database, with each embedding occupying 4096 bytes (1024 dimensions × 4 bytes per float32 value).

To avoid regenerating embeddings when the dataset is updated with new cases, the pipeline implements incremental embedding generation — only cases that have been added or modified since the last pipeline run are processed.

### 4.5 Contract Analysis Pipeline

The contract analysis pipeline is the second major functional component of Glaw. It was primarily implemented by Adithyan S and Arjun R, with Priya M handling the frontend integration.

#### 4.5.1 Document Extraction

The first stage of the pipeline extracts raw text from uploaded contract documents. We support two file formats:

**PDF Extraction:** PDF files are processed using a two-stage approach. First, we attempt text extraction using `PyPDF2`, which works well for text-based PDFs (i.e., PDFs where the text is stored as character data rather than as images). If `PyPDF2` extracts less than 100 characters per page (indicating a scanned or image-based PDF), we fall back to `pdfplumber`, which uses a more sophisticated layout analysis algorithm that can handle complex PDF structures including multi-column layouts, tables, and embedded images with text.

**DOCX Extraction:** DOCX files are processed using `python-docx`, which provides access to the document's XML structure. We extract text from paragraphs, tables, headers, and footers, preserving the document's structural hierarchy (headings, sub-headings, body text). This structural information is valuable for the clause segmentation stage, as heading levels often correspond to clause boundaries.

The extraction stage also handles common issues with legal documents: inconsistent encoding (particularly for documents containing non-ASCII characters like section symbols §, paragraph symbols ¶, and em dashes —), embedded images (which are skipped), and password-protected documents (which are rejected with an appropriate error message).

#### 4.5.2 Clause Segmentation

Clause segmentation is the process of dividing the extracted text into individual clauses, each of which can be analyzed independently. This is a non-trivial task because legal contracts use a variety of structural conventions, and the boundary between one clause and the next is not always clearly marked.

Our segmentation algorithm uses a multi-signal approach:

1. **Heading Detection:** We look for numbered headings (e.g., "1.", "1.1", "Section 1", "Article I") and named headings (e.g., "INDEMNIFICATION", "LIMITATION OF LIABILITY", "GOVERNING LAW") using regex patterns. Each heading marks the beginning of a new clause.

2. **Paragraph Boundary Detection:** In the absence of clear headings, we use paragraph boundaries (double newlines or significant whitespace) as clause boundaries.

3. **Length-Based Splitting:** Clauses that exceed 1000 tokens are split at sentence boundaries to ensure that each clause fits within the context window of the LLM models used in the enhancement stage.

4. **Clause Type Classification:** Each segmented clause is classified into one of several predefined types (indemnification, limitation of liability, termination, confidentiality, non-compete, governing law, force majeure, intellectual property, payment terms, warranties, representations, dispute resolution, assignment, amendment, and general/miscellaneous) using keyword matching and a lightweight text classifier.

#### 4.5.3 Rule-Based Analysis

The rule-based analysis stage applies 14 deterministic rules to each segmented clause. These rules were developed in consultation with legal professionals and represent common contractual risks that can be reliably detected through pattern matching.

**Table 4.4: Contract Analysis Rules**

| Rule ID | Rule Name | Description | Severity |
|---------|-----------|-------------|----------|
| R-01 | Unlimited Liability | Detects clauses that impose unlimited liability on one party | Critical |
| R-02 | One-Sided Indemnification | Detects indemnification obligations that apply to only one party | High |
| R-03 | Broad Non-Compete | Detects non-compete clauses with excessive scope (geographic or temporal) | High |
| R-04 | Auto-Renewal Without Notice | Detects auto-renewal provisions that lack adequate notice requirements | Medium |
| R-05 | Unilateral Termination | Detects termination rights that favor one party disproportionately | High |
| R-06 | Missing Limitation of Liability | Flags contracts that lack a limitation of liability clause | High |
| R-07 | Broad IP Assignment | Detects intellectual property assignment clauses that are overly broad | High |
| R-08 | Weak Confidentiality | Detects confidentiality clauses that lack standard protections | Medium |
| R-09 | Missing Governing Law | Flags contracts that do not specify a governing law | Medium |
| R-10 | Unfavorable Dispute Resolution | Detects dispute resolution clauses that favor one party (e.g., mandatory arbitration in a specific jurisdiction) | Medium |
| R-11 | Missing Data Protection | Flags contracts that handle personal data but lack data protection provisions | High |
| R-12 | Excessive Warranty Disclaimer | Detects warranty disclaimers that are broader than industry standard | Medium |
| R-13 | Missing Force Majeure | Flags contracts that lack a force majeure clause | Low |
| R-14 | Ambiguous Payment Terms | Detects payment terms that lack specificity (amount, timing, currency) | Low |

Each rule is implemented as a Python function that takes a clause text as input and returns a list of findings (possibly empty). Each finding includes the rule ID, a severity level, a human-readable description of the issue, and a suggested remediation. The rules use a combination of regex pattern matching, keyword detection, and simple heuristics (e.g., checking whether both parties are mentioned in an indemnification clause).

The rule-based analysis is fast (processing an entire contract in under 1 second) and deterministic (the same input always produces the same output). This makes it suitable as a baseline analysis that can be enhanced by the LLM stage.

#### 4.5.4 LLM Enhancement

The LLM enhancement stage adds depth and nuance to the rule-based analysis by sending selected clauses to large language models for more sophisticated analysis. This stage uses a cascading architecture with three LLM providers:

1. **Groq (Primary):** Groq provides fast inference for open-source models (we use Llama 3 70B). It is our primary provider because of its low latency (typically under 2 seconds for a response) and competitive pricing. Groq is used for the majority of clause analyses.

2. **Gemini (Secondary):** Google's Gemini model is used as a fallback when Groq is unavailable or when the analysis requires multimodal capabilities (e.g., analyzing clauses that reference tables or figures in the original document). Gemini's larger context window (up to 1 million tokens) also makes it suitable for analyzing very long clauses or for providing analysis that considers the entire contract context.

3. **Cloudflare Workers AI (Tertiary):** Cloudflare's Workers AI platform provides access to various open-source models at the edge. It serves as our final fallback, ensuring that the system can always produce an LLM-enhanced analysis even if both Groq and Gemini are unavailable.

The cascade operates as follows: for each clause requiring LLM analysis, the system first attempts to use Groq. If Groq returns an error or times out (after 10 seconds), the system falls back to Gemini. If Gemini also fails, the system falls back to Cloudflare Workers AI. If all three providers fail, the system returns only the rule-based analysis with a note that LLM enhancement was unavailable.

The prompt sent to the LLM is carefully structured to elicit useful analysis. It includes the clause text, the clause type (as determined by the segmentation stage), any findings from the rule-based analysis, and specific instructions to identify risks, suggest improvements, and rate the severity of any issues found. The prompt also includes few-shot examples of good analysis to guide the model's output format.

#### 4.5.5 Risk Scoring Algorithm

The risk scoring algorithm combines the findings from both the rule-based and LLM-enhanced analysis to produce a single numerical score that represents the overall risk level of the contract.

The scoring formula is:

```
Risk Score = Σ (wᵢ × fᵢ) / max_possible_score × 100
```

where fᵢ is the number of findings at severity level i, and wᵢ is the weight for that severity level:

**Table 4.5: Risk Weight Configuration**

| Severity Level | Weight (wᵢ) |
|---------------|-------------|
| Low | 1.5 |
| Medium | 3.0 |
| High | 5.0 |
| Critical | 7.0 |

The max_possible_score is computed as the number of clauses multiplied by the critical weight (7.0), representing the theoretical worst case where every clause has a critical finding. The resulting score is a percentage from 0 to 100, where 0 indicates no risks found and 100 indicates maximum risk.

In practice, most contracts score between 15 and 45. A score below 20 is considered low risk (the contract is generally well-drafted), 20–40 is moderate risk (some issues that should be addressed), 40–60 is high risk (significant issues that require attention), and above 60 is critical risk (the contract has serious problems that should be resolved before signing).

The risk score is presented to the user alongside a detailed breakdown showing each finding, its severity, the clause it was found in, and the suggested remediation. This combination of a high-level score and detailed findings allows users to quickly assess the overall risk and then drill down into specific issues.


### 4.6 API Gateway and Service Integration

The API gateway serves as the single entry point for all client requests. It is implemented as a FastAPI application with the following endpoint groups:

**Authentication Endpoints (`/auth`):**
- `POST /auth/register` — Register a new user account
- `POST /auth/login` — Authenticate and receive JWT tokens
- `POST /auth/refresh` — Refresh an expired access token
- `GET /auth/profile` — Retrieve the authenticated user's profile

**LCET Endpoints (`/lcet`):**
- `GET /lcet/search` — Search for cases by concept, jurisdiction, and time period
- `GET /lcet/concepts` — List available seed concepts
- `GET /lcet/smi` — Compute or retrieve SMI for a concept across time periods
- `GET /lcet/timeline` — Get timeline data for visualization
- `GET /lcet/case/{id}` — Retrieve full case details
- `GET /lcet/entities/{case_id}` — Get extracted entities for a case

**Contract Endpoints (`/contracts`):**
- `POST /contracts/upload` — Upload a contract for analysis
- `GET /contracts/{id}/status` — Check analysis status
- `GET /contracts/{id}/results` — Retrieve analysis results
- `GET /contracts/{id}/report` — Download analysis report (PDF)
- `GET /contracts/history` — List user's previously analyzed contracts

**Administrative Endpoints (`/admin`):**
- `GET /admin/stats` — Platform usage statistics
- `POST /admin/pipeline/run` — Trigger data pipeline execution
- `GET /admin/health` — Health check endpoint

All endpoints return JSON responses with a consistent structure:

```json
{
  "status": "success" | "error",
  "data": { ... },
  "message": "Human-readable message",
  "timestamp": "ISO 8601 timestamp"
}
```

Error responses include an additional `error_code` field for programmatic error handling and a `details` field with additional context when available.

The gateway implements request validation using Pydantic models, ensuring that all incoming requests conform to the expected schema before they reach the service layer. This validation catches common issues like missing required fields, invalid data types, and out-of-range values at the gateway level, reducing the burden on downstream services.

### 4.7 Frontend Implementation

The frontend was primarily developed by Priya M, with contributions from Adithyan S on the API integration and state management. The application is built with Next.js 14 using the App Router, which provides file-system-based routing, server components, and streaming SSR.

#### 4.7.1 Search Interface

The search interface is the primary entry point for the LCET module. It features a prominent search bar with auto-complete suggestions for seed concepts, filters for jurisdiction (India, US, ECHR) and time period, and a results panel that displays matching cases with relevance scores.

The search results are displayed as cards, each showing the case title, court, date, jurisdiction, a snippet of the relevant text with the search concept highlighted, and a relevance score. Users can click on a card to view the full case details, including the extracted entities and the concept's usage context within the case.

The search interface supports two modes: keyword search (which uses PostgreSQL's full-text search) and semantic search (which uses BGE-Large embeddings). Users can toggle between modes, and the default is a hybrid mode that combines both signals with configurable weights.

#### 4.7.2 Timeline Visualization

The timeline visualization is the signature feature of the LCET module. It displays the evolution of a legal concept over time as an interactive chart built with D3.js.

The x-axis represents time (divided into decades or custom periods), and the y-axis represents the SMI value. Each data point shows the SMI between consecutive periods, with error bars representing the bootstrap confidence intervals. The data points are color-coded by drift classification (green for stable, yellow for minor drift, orange for moderate drift, red for significant drift, and dark red for major transformation).

Users can hover over data points to see detailed information: the exact SMI value, the confidence interval, the number of cases in each period, and representative case excerpts that illustrate the concept's usage in that period. Clicking on a data point opens a side panel with the full list of cases from that period, allowing users to explore the primary sources behind the SMI computation.

The visualization also includes a "landmark cases" overlay that marks significant judicial decisions on the timeline, helping users correlate SMI changes with specific legal developments. For example, the timeline for "privacy" in Indian law prominently marks the *Puttaswamy* decision (2017), and the timeline for "due process" in US law marks *Gideon v. Wainwright* (1963) and *Miranda v. Arizona* (1966).

#### 4.7.3 Case Library

The case library provides a browsable interface to the entire case database. Cases can be filtered by jurisdiction, court, time period, and concept. The library supports both grid and list views, with sorting options for date, relevance, and citation count.

Each case in the library has a detail page that displays the full text of the judgment (with syntax highlighting for legal citations and concept mentions), extracted entities in a sidebar, and a "concept map" showing which seed concepts are discussed in the case and their SMI context.

The case library also includes a "collections" feature that allows users to save cases to named collections for later reference. This feature is particularly useful for legal researchers who are building a corpus of cases for a specific research question.

#### 4.7.4 Contract Upload and Analysis

The contract analysis interface provides a drag-and-drop upload area for contract files, a progress indicator during analysis, and a comprehensive results dashboard.

The results dashboard displays:
- An overall risk score as a large, color-coded gauge (green for low risk, yellow for moderate, red for high, dark red for critical)
- A summary of findings by severity level (number of critical, high, medium, and low findings)
- A clause-by-clause breakdown with expandable sections showing the clause text, identified risks, and suggested remediations
- A downloadable PDF report that can be shared with colleagues or clients

The interface also includes a "compare" feature that allows users to upload a revised version of a contract and see how the risk profile has changed, highlighting new risks, resolved risks, and unchanged risks. This feature is particularly useful during contract negotiation, where multiple rounds of revisions are common.

### 4.8 DevOps and Deployment

The DevOps infrastructure was designed and implemented by Karthik V, with the goal of enabling reliable, reproducible deployments with minimal manual intervention.

#### 4.8.1 Docker and Kubernetes

The application is containerized using Docker, with separate Dockerfiles for the backend and frontend services. The backend Dockerfile uses a multi-stage build: the first stage installs Python dependencies and downloads ML models, and the second stage copies only the necessary files into a slim runtime image. This approach reduces the final image size from approximately 8 GB (with all build dependencies) to approximately 4 GB (runtime only, including models).

The frontend Dockerfile similarly uses a multi-stage build, with the first stage running `next build` to produce the optimized production bundle, and the second stage serving the bundle using a lightweight Node.js server.

For orchestration, we use Kubernetes with the following resource definitions:
- **Backend Deployment:** 2 replicas with resource limits of 4 CPU cores and 8 GB RAM per pod, with a GPU node selector for pods that need to run model inference
- **Frontend Deployment:** 2 replicas with resource limits of 1 CPU core and 2 GB RAM per pod
- **PostgreSQL StatefulSet:** 1 replica with persistent volume claims for data storage
- **Ingress:** NGINX Ingress Controller with TLS termination using Let's Encrypt certificates
- **ConfigMaps and Secrets:** For environment-specific configuration and sensitive credentials

The Kubernetes manifests are organized using Kustomize, with base configurations and environment-specific overlays for development, staging, and production.

#### 4.8.2 CI/CD Pipeline

The CI/CD pipeline is implemented using GitHub Actions with the following stages:

1. **Lint and Type Check:** Runs `flake8` and `mypy` on the Python backend, and `eslint` and `tsc` on the TypeScript frontend.
2. **Unit Tests:** Runs `pytest` for the backend and `jest` for the frontend.
3. **Build:** Builds Docker images for both services and tags them with the Git commit SHA.
4. **Push:** Pushes the built images to a container registry (GitHub Container Registry).
5. **Deploy (Staging):** Automatically deploys to the staging environment on pushes to the `develop` branch.
6. **Deploy (Production):** Deploys to production on pushes to the `main` branch, with a manual approval gate.

The pipeline also includes a scheduled job that runs the data pipeline weekly to ingest new cases from the data sources.

#### 4.8.3 Monitoring

Monitoring is implemented using a combination of tools:
- **Application Logging:** Structured JSON logging using Python's `logging` module with a custom formatter. Logs are collected and aggregated using Fluentd.
- **Metrics:** Prometheus metrics are exposed by the FastAPI application using the `prometheus-fastapi-instrumentator` library. Key metrics include request count, request latency, error rate, and model inference time.
- **Alerting:** Prometheus Alertmanager is configured to send alerts via email and Slack when key metrics exceed thresholds (e.g., error rate > 5%, p99 latency > 10 seconds).
- **Dashboards:** Grafana dashboards provide real-time visibility into system health, API performance, and resource utilization.

The monitoring stack runs as a separate set of Kubernetes deployments, isolated from the application workloads to ensure that monitoring remains available even during application outages.


---

## CHAPTER 5: TESTING AND RESULTS

### 5.1 Unit Testing

Unit testing was conducted throughout the development process, with each team member responsible for writing tests for their respective modules. The backend tests are written using `pytest` with the `pytest-asyncio` extension for testing asynchronous endpoints, and the frontend tests use `jest` with React Testing Library.

**Table 5.1: Unit Test Coverage Summary**

| Module | Test Files | Test Cases | Coverage |
|--------|-----------|------------|----------|
| API Gateway | 8 | 47 | 85% |
| LCET — Search | 5 | 32 | 82% |
| LCET — Embeddings | 4 | 18 | 78% |
| LCET — SMI Computation | 6 | 41 | 91% |
| LCET — Drift Classification | 3 | 15 | 80% |
| LCET — Entity Extraction | 3 | 12 | 76% |
| Contract — Extraction | 4 | 22 | 84% |
| Contract — Segmentation | 5 | 28 | 87% |
| Contract — Rules | 14 | 56 | 93% |
| Contract — Risk Scoring | 3 | 19 | 90% |
| Frontend Components | 12 | 38 | 72% |
| **Total** | **67** | **328** | **83%** |

The highest coverage was achieved in the contract analysis rules module (93%) and the SMI computation module (91%), which are the most critical components of the system. The rule-based analysis module has particularly high coverage because each of the 14 rules was tested with multiple positive and negative examples, edge cases, and boundary conditions.

The frontend coverage is lower (72%) because some components rely heavily on browser APIs and third-party libraries (particularly D3.js and Three.js) that are difficult to test in a Node.js environment. For these components, we relied more heavily on integration testing and manual testing.

Key unit test scenarios include:
- SMI computation with known embedding vectors to verify mathematical correctness
- Bootstrap confidence interval computation with fixed random seeds for reproducibility
- Each contract analysis rule tested with at least 4 positive examples (clauses that should trigger the rule) and 4 negative examples (clauses that should not)
- API endpoint tests with mocked service layers to verify request validation, authentication, and response formatting
- Database model tests to verify ORM mappings and query correctness

### 5.2 Integration Testing

Integration testing verified that the modules work correctly when connected together. We used `pytest` with a test database (SQLite in-memory) and mock external services (LLM providers, data sources) to test end-to-end workflows.

Key integration test scenarios:

1. **Search-to-SMI Workflow:** A search query is submitted, cases are retrieved, embeddings are generated (using cached test embeddings), SMI is computed, and the complete response is verified.

2. **Contract Upload-to-Results Workflow:** A test contract (a sample NDA) is uploaded, text is extracted, clauses are segmented, rules are applied, LLM enhancement is simulated (using mocked responses), risk score is computed, and the complete analysis is verified.

3. **Authentication Flow:** User registration, login, token refresh, and authenticated API access are tested as a complete flow.

4. **Rate Limiting:** Requests are submitted at rates exceeding the configured limits to verify that rate limiting is enforced correctly and that appropriate error responses are returned.

5. **Cascade Fallback:** The LLM cascade is tested by simulating failures at each level (Groq failure → Gemini fallback, Groq + Gemini failure → Cloudflare fallback, all providers failure → graceful degradation to rule-based only).

Integration tests uncovered several issues during development, including a race condition in the embedding cache (where two concurrent requests for the same concept could trigger duplicate embedding generation), a timezone handling bug in the SMI computation (where cases near period boundaries could be assigned to the wrong period), and a memory leak in the GLiNER model loading code (where the model was being loaded into memory for each request rather than being cached).

### 5.3 Performance Testing

Performance testing was conducted using `locust`, a Python-based load testing framework, to simulate concurrent user traffic and measure system response times under load.

**Table 5.2: API Response Time Benchmarks**

| Endpoint | Concurrent Users | Median (ms) | P95 (ms) | P99 (ms) | Throughput (req/s) |
|----------|-----------------|-------------|----------|----------|-------------------|
| GET /lcet/search (keyword) | 10 | 120 | 280 | 450 | 45 |
| GET /lcet/search (semantic) | 10 | 340 | 680 | 1100 | 18 |
| GET /lcet/smi | 10 | 1200 | 2800 | 4500 | 5 |
| POST /contracts/upload (5-page PDF) | 5 | 3200 | 5800 | 8200 | 1.2 |
| POST /contracts/upload (20-page PDF) | 5 | 8500 | 14000 | 18000 | 0.4 |
| GET /contracts/{id}/results | 10 | 85 | 150 | 220 | 65 |
| POST /auth/login | 20 | 45 | 90 | 130 | 120 |

The results show that the system meets the non-functional requirements for most endpoints. Keyword search responds well within the 2-second target, and semantic search is also within bounds for typical usage. SMI computation is the slowest endpoint, as it involves embedding generation and bootstrap computation, but it still meets the 10-second target at the median. Contract analysis times vary significantly with document length, with a 5-page document completing in about 3 seconds and a 20-page document taking about 8.5 seconds — both within acceptable ranges for an asynchronous operation (the user receives a job ID immediately and polls for results).

The system was tested with up to 50 concurrent users, and performance degraded gracefully — response times increased but the system remained responsive, with no errors or timeouts up to 50 concurrent users. Beyond 50 users, the GPU became a bottleneck for embedding-intensive operations, suggesting that horizontal scaling (adding more GPU-equipped pods) would be necessary for higher loads.

### 5.4 SMI Validation Results

Validating the SMI required comparing its outputs against known historical shifts in legal interpretation. We selected several legal concepts with well-documented evolutionary trajectories and computed SMI values across decades.

**Table 5.3: SMI Validation Against Known Shifts**

| Concept | Jurisdiction | Period | SMI | 95% CI | Classification | Known Historical Event |
|---------|-------------|--------|-----|--------|---------------|----------------------|
| Privacy | India | 2010–2020 | 0.124 | [0.098, 0.151] | Significant Drift | Puttaswamy judgment (2017) |
| Due Process | US | 1950–1970 | 0.108 | [0.082, 0.134] | Significant Drift | Warren Court expansion |
| Due Process | US | 1990–2010 | 0.031 | [0.018, 0.044] | Minor Drift | Relatively stable period |
| Equal Protection | US | 1950–1970 | 0.142 | [0.115, 0.169] | Significant Drift | Civil rights era |
| Natural Justice | India | 1970–1990 | 0.087 | [0.064, 0.110] | Moderate Drift | Post-Emergency jurisprudence |
| Right to Life | India | 1980–2000 | 0.098 | [0.071, 0.125] | Moderate Drift | Expansion under Art. 21 |
| Sovereign Immunity | US | 1970–1990 | 0.045 | [0.028, 0.062] | Minor Drift | Gradual legislative erosion |
| Freedom of Speech | India | 2000–2020 | 0.076 | [0.053, 0.099] | Moderate Drift | Digital speech cases |
| Reasonable Restriction | India | 1950–1970 | 0.091 | [0.068, 0.114] | Moderate Drift | Early constitutional interpretation |

The results are encouraging. The SMI correctly identifies periods of significant change for concepts that are known to have undergone major reinterpretation. The "Privacy" concept in India shows a significant spike in the 2010–2020 period, consistent with the transformative impact of the *Puttaswamy* judgment. "Due Process" in the US shows high SMI during the Warren Court era (1950–1970) and low SMI during the relatively stable 1990–2010 period. "Equal Protection" shows the highest SMI in our validation set during the civil rights era, which is historically accurate.

The confidence intervals are reasonably tight for concepts with many cases in each period (like "Due Process" in the US, which has hundreds of relevant cases) and wider for concepts with fewer cases (like "Sovereign Immunity," which has a smaller case corpus). This behavior is expected and validates the bootstrap methodology.

### 5.5 Search Accuracy Evaluation

We evaluated the search accuracy using a manually curated test set of 200 queries with relevance judgments. Each query was a legal concept or research question, and the top 10 results from both keyword search and semantic search were judged for relevance by a team member with legal knowledge.

Results:
- **Keyword Search:** Precision@10 = 0.62, Recall@10 = 0.48, F1@10 = 0.54
- **Semantic Search:** Precision@10 = 0.78, Recall@10 = 0.71, F1@10 = 0.74
- **Hybrid Search:** Precision@10 = 0.82, Recall@10 = 0.75, F1@10 = 0.78

The semantic search significantly outperforms keyword search, particularly for queries that use different terminology than the case texts (e.g., searching for "digital privacy" retrieves cases that discuss "informational privacy" or "data protection" even when the exact phrase "digital privacy" does not appear). The hybrid search, which combines keyword and semantic signals, achieves the best overall performance by leveraging the strengths of both approaches.

### 5.6 Contract Analysis Accuracy

We evaluated the contract analysis pipeline using a test set of 25 contracts (a mix of NDAs, employment agreements, service agreements, and licensing contracts) that were manually reviewed by a legal professional. The manual review identified a total of 187 risk findings across the 25 contracts.

**Table 5.4: Contract Analysis Precision and Recall**

| Analysis Stage | True Positives | False Positives | False Negatives | Precision | Recall | F1 |
|---------------|---------------|----------------|----------------|-----------|--------|-----|
| Rule-Based Only | 124 | 18 | 63 | 0.873 | 0.663 | 0.754 |
| LLM-Enhanced | 156 | 23 | 31 | 0.871 | 0.834 | 0.852 |
| Combined (Final) | 162 | 21 | 25 | 0.885 | 0.866 | 0.876 |

The rule-based analysis achieves high precision (87.3%) but moderate recall (66.3%), meaning it rarely flags non-issues but misses some genuine risks. The LLM enhancement significantly improves recall (to 83.4%) by catching risks that the rules miss, with only a slight increase in false positives. The combined system achieves the best balance with an F1 score of 0.876, which we consider strong for an automated system.

The most common false negatives (missed risks) involve subtle issues that require understanding the broader context of the contract, such as an indemnification clause that is technically bilateral but practically one-sided due to the nature of the services being provided. The most common false positives involve the system flagging standard industry practices as risks (e.g., flagging a standard limitation of liability cap as "potentially unfavorable" when it is actually within normal range for the industry).

### 5.7 Screenshots

*[Note: In the printed version of this report, this section contains screenshots of the following interfaces. In this digital version, descriptions are provided.]*

**Screenshot 5.1: Landing Page**
The landing page features a dark-themed design with a Three.js 3D visualization of interconnected legal concepts as a network graph. The navigation bar includes links to Search, Case Library, Contract Analysis, and Pricing. A prominent search bar invites users to "Explore how legal concepts evolve."

**Screenshot 5.2: Search Results Page**
The search results page shows results for the query "due process" in the US jurisdiction. Results are displayed as cards with case titles, courts, dates, and relevance scores. A sidebar shows filters for time period, court level, and concept category.

**Screenshot 5.3: SMI Timeline Visualization**
The timeline visualization shows the evolution of "privacy" in Indian law from 1950 to 2024. The chart displays SMI values with confidence intervals, color-coded by drift classification. The *Puttaswamy* decision is marked as a landmark case on the timeline. A tooltip shows detailed information for the 2010–2020 data point.

**Screenshot 5.4: Case Detail Page**
The case detail page shows the full text of a Supreme Court judgment with highlighted concept mentions, extracted entities in a sidebar (judges, statutes cited, parties), and a concept map showing related legal concepts.

**Screenshot 5.5: Contract Upload Interface**
The contract upload interface shows a drag-and-drop area with supported file format indicators (PDF, DOCX). Below the upload area, a list of previously analyzed contracts is displayed with their risk scores and analysis dates.

**Screenshot 5.6: Contract Analysis Results**
The analysis results page shows a large risk score gauge (showing 34/100, "Moderate Risk"), a summary bar chart of findings by severity, and an expandable clause-by-clause breakdown. One clause is expanded, showing the clause text, two identified risks (one from rule-based analysis, one from LLM enhancement), and suggested remediations.

**Screenshot 5.7: Pricing Page**
The pricing page displays three tiers: Free (basic search, 3 contract analyses/month), Pro (₹499/month, advanced search, 30 contract analyses/month, API access), and Firm (₹2,999/month, unlimited everything, priority support, custom integrations).


---

## CHAPTER 6: CONCLUSION AND FUTURE WORK

### 6.1 Summary of Achievements

Over the course of this project, we designed, implemented, and evaluated Glaw — an AI-powered legal intelligence platform that addresses two significant challenges in legal technology: tracking the semantic evolution of legal concepts and automating contract risk analysis.

The key achievements of this project are:

1. **A novel metric for legal semantic drift.** The Semantic Movement Index (SMI) provides, to our knowledge, the first quantitative measure specifically designed to track how legal concepts change meaning over time. The SMI is grounded in contextual embeddings from domain-specific transformer models and includes bootstrap confidence intervals for statistical rigor. Our validation against known historical shifts in legal interpretation demonstrates that the SMI reliably captures meaningful changes in legal meaning.

2. **A multi-model NLP pipeline for legal text analysis.** The combination of LexLM Legal-RoBERTa-Large (for legal embeddings), BGE-Large-EN-v1.5 (for semantic search), DeBERTa-v3-Large-MNLI (for drift classification), and GLiNER Large v2.1 (for entity extraction) provides a comprehensive analytical capability that no single model could achieve. Each model contributes a specialized skill, and their combination produces analysis that is both deep and broad.

3. **A comprehensive legal case database.** The platform indexes over 120,000 Indian court cases, approximately 800 US federal cases, and several hundred ECHR cases, spanning from 1950 to 2026. This database, combined with the semantic search capability, provides a powerful research tool for legal professionals and scholars.

4. **A hybrid contract analysis system.** The combination of 14 deterministic rules with a cascading LLM pipeline achieves an F1 score of 0.876 on our test set, demonstrating that the hybrid approach outperforms either rules alone or LLMs alone. The cascading architecture provides resilience and cost management, ensuring reliable analysis even when individual LLM providers experience outages.

5. **A production-ready platform.** Glaw is not just a research prototype — it is a fully functional web application with user authentication, subscription management, a responsive frontend, and a containerized deployment architecture. The platform is ready for real-world use, with a pricing model designed to make advanced legal AI accessible to practitioners at all levels.

6. **A collaborative development effort.** The project was executed by a team of four, with each member contributing specialized skills. Adithyan S led the project and handled full-stack development and the contract analysis pipeline. Arjun R developed the backend services and the ML pipeline. Priya M designed and implemented the frontend with its interactive visualizations. Karthik V built the data pipeline and the DevOps infrastructure. The successful coordination of these diverse contributions into a cohesive platform is itself an achievement.

### 6.2 Limitations

Despite the achievements outlined above, the project has several limitations that we acknowledge:

1. **Limited validation corpus.** Our SMI validation was conducted against a relatively small set of concepts with known historical trajectories. A more comprehensive validation would require collaboration with legal scholars who can provide expert judgments on the evolution of a larger set of concepts.

2. **English-only support.** The platform currently supports only English-language legal texts. This is a significant limitation for the Indian legal system, where many High Court and lower court judgments are written in regional languages. Extending the platform to support Hindi, Tamil, and other Indian languages would require multilingual models and additional data sources.

3. **Static data pipeline.** The data pipeline runs in batch mode, meaning that newly decided cases are not immediately available in the system. A real-time or near-real-time ingestion pipeline would improve the platform's currency, but would require significant additional infrastructure.

4. **GPU dependency for inference.** The transformer models used in the pipeline require GPU acceleration for acceptable performance. This limits deployment options and increases infrastructure costs. Techniques like model quantization and distillation could reduce this dependency but may impact analysis quality.

5. **Limited contract type coverage.** The 14 deterministic rules were developed primarily for common commercial contracts (NDAs, employment agreements, service agreements). Specialized contract types (e.g., real estate leases, construction contracts, financial derivatives) may contain risks that the current rules do not cover.

6. **LLM reliability.** The LLM enhancement stage, while valuable, introduces an element of non-determinism. The same clause may receive slightly different analysis on different runs, depending on the LLM provider's response. While the cascading architecture mitigates provider-level reliability issues, the inherent variability of LLM outputs remains a limitation.

### 6.3 Future Enhancements

We have identified several directions for future development:

1. **Multilingual support.** Extending the platform to support Indian regional languages using multilingual transformer models (e.g., IndicBERT, MuRIL) and translated legal corpora. This would dramatically expand the platform's utility in the Indian legal market.

2. **Real-time case ingestion.** Implementing a streaming data pipeline that monitors court websites and legal databases for new judgments and ingests them automatically. This could use technologies like Apache Kafka for event streaming and Apache Airflow for pipeline orchestration.

3. **Comparative jurisdiction analysis.** Extending the SMI to compare how the same legal concept evolves differently across jurisdictions. For example, comparing the evolution of "freedom of speech" in India versus the US could reveal interesting divergences in constitutional interpretation.

4. **Legal citation network analysis.** Building a citation graph that maps how cases cite each other, enabling analysis of which cases have been most influential in shaping a concept's evolution. This would complement the SMI by providing a structural perspective on legal change.

5. **Custom concept tracking.** Allowing users to define their own concepts for tracking, beyond the pre-defined seed concepts. This would require on-demand embedding generation and SMI computation, which could be offered as a premium feature.

6. **Mobile application.** Developing native mobile applications for iOS and Android to provide on-the-go access to the platform's features, particularly the contract analysis capability.

7. **Integration with legal practice management software.** Building integrations with popular legal practice management tools (Clio, PracticePanther, etc.) to embed Glaw's capabilities into existing legal workflows.

8. **Fine-tuning on Indian legal corpus.** Fine-tuning the LexLM model specifically on Indian legal text to improve embedding quality for Indian case law. The current model was pre-trained primarily on US and EU legal text, and domain adaptation to Indian legal language could yield significant improvements.

### 6.4 Conclusion

The legal profession stands at an inflection point. The volume of legal text — judgments, statutes, contracts, regulations — continues to grow exponentially, while the tools available to legal professionals for navigating this text have not kept pace with advances in natural language processing. Glaw represents our contribution to closing this gap.

By combining a research-oriented module (LCET, with its novel Semantic Movement Index) with a practice-oriented module (the Contract Copilot), Glaw demonstrates that a single platform can serve both legal scholars interested in how the law evolves and practitioners who need to analyze contracts efficiently. The multi-model NLP pipeline shows that combining specialized models yields better results than relying on any single model, and the hybrid rule-based plus LLM approach to contract analysis achieves a balance of reliability and sophistication that neither approach achieves alone.

We believe that the Semantic Movement Index, in particular, has potential beyond this project. As a quantitative metric for legal semantic drift, it could be adopted by legal scholars, policy researchers, and judicial analytics platforms to study how legal meaning changes over time. The methodology is generalizable to any domain where concepts evolve through textual interpretation — not just law, but also medicine, philosophy, and public policy.

Building Glaw has been a challenging and rewarding experience. It required us to work across multiple domains — natural language processing, web development, database design, DevOps, and legal knowledge — and to integrate these diverse skills into a cohesive product. We are proud of what we have built, and we hope that it contributes, in some small way, to making legal knowledge more accessible and legal practice more efficient.

---

## REFERENCES

[1] Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). "Attention is All You Need." *Advances in Neural Information Processing Systems*, 30, 5998–6008.

[2] Devlin, J., Chang, M. W., Lee, K., & Toutanova, K. (2019). "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding." *Proceedings of NAACL-HLT 2019*, 4171–4186.

[3] Liu, Y., Ott, M., Goyal, N., Du, J., Joshi, M., Chen, D., Levy, O., Lewis, M., Zettlemoyer, L., & Stoyanov, V. (2019). "RoBERTa: A Robustly Optimized BERT Pretraining Approach." *arXiv preprint arXiv:1907.11692*.

[4] Chalkidis, I., Fergadiotis, M., Malakasiotis, P., Aletras, N., & Androutsopoulos, I. (2020). "LEGAL-BERT: The Muppets Straight Out of Law School." *Findings of the Association for Computational Linguistics: EMNLP 2020*, 2898–2904.

[5] Chalkidis, I., Garneau, N., Tsarapatsanis, D., Søgaard, A., & Aletras, N. (2023). "LeXFiles and LegalLAMA: Evaluating Legal Language Understanding in LLMs." *Proceedings of the 61st Annual Meeting of the Association for Computational Linguistics*, 2893–2910.

[6] Xiao, S., Liu, Z., Zhang, P., & Muennighoff, N. (2023). "C-Pack: Packaged Resources To Advance General Chinese Embedding." *arXiv preprint arXiv:2309.07597*.

[7] He, P., Gao, J., & Chen, W. (2023). "DeBERTaV3: Improving DeBERTa using ELECTRA-Style Pre-Training with Gradient-Disentangled Embedding Sharing." *Proceedings of ICLR 2023*.

[8] Zaratiana, U., Ngouda, N., Tomeh, N., Holat, P., & Charnois, T. (2023). "GLiNER: Generalist Model for Named Entity Recognition using Bidirectional Transformer." *arXiv preprint arXiv:2311.08526*.

[9] Hamilton, W. L., Leskovec, J., & Jurafsky, D. (2016). "Diachronic Word Embeddings Reveal Statistical Laws of Semantic Change." *Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics*, 1489–1501.

[10] Ash, E., & Chen, D. L. (2019). "Social Norms and Judicial Decision-Making: Evidence from the Evolution of Legal Language." *Journal of Law and Economics*, 62(3), 431–468.

[11] Livermore, M. A., Riddell, A., & Rockmore, D. (2017). "The Supreme Court and the Judicial Genre." *Arizona Law Review*, 59, 837–901.

[12] Chalkidis, I., Androutsopoulos, I., & Aletras, N. (2019). "Neural Legal Judgment Prediction in English." *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics*, 4317–4323.

[13] Hendrycks, D., Burns, C., Chen, A., & Ball, S. (2021). "CUAD: An Expert-Annotated NLP Dataset for Legal Contract Review." *Proceedings of NeurIPS 2021 Datasets and Benchmarks Track*.

[14] Bommarito, M. J., & Katz, D. M. (2018). "LexNLP: Natural Language Processing and Information Extraction for Legal and Regulatory Texts." *arXiv preprint arXiv:1806.03688*.

[15] Zhong, H., Xiao, C., Tu, C., Zhang, T., Liu, Z., & Sun, M. (2020). "How Does NLP Benefit Legal System: A Summary of Legal Artificial Intelligence." *Proceedings of the 58th Annual Meeting of the Association for Computational Linguistics*, 5218–5230.

[16] Malik, V., Sanjay, R., Nigam, S. K., Ghosh, K., Guha, S. K., Bhattacharya, A., & Modi, A. (2021). "ILDC for CJPE: Indian Legal Documents Corpus for Court Judgment Prediction and Explanation." *Proceedings of the 59th Annual Meeting of the Association for Computational Linguistics*, 4046–4062.

[17] Reimers, N., & Gurevych, I. (2019). "Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks." *Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing*, 3982–3992.

[18] Dale, R. (2019). "Law and Word Order: NLP in Legal Tech." *Natural Language Engineering*, 25(1), 211–217.

---

## APPENDIX A: API ENDPOINT DOCUMENTATION

### Authentication Endpoints

**POST /auth/register**
```
Request Body:
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}

Response (201 Created):
{
  "status": "success",
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "subscription_tier": "free"
  }
}
```

**POST /auth/login**
```
Request Body:
{
  "email": "user@example.com",
  "password": "securepassword"
}

Response (200 OK):
{
  "status": "success",
  "data": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token",
    "expires_in": 3600
  }
}
```

### LCET Endpoints

**GET /lcet/search**
```
Query Parameters:
  q (string, required): Search query
  jurisdiction (string, optional): "india" | "us" | "echr"
  period_start (integer, optional): Start year
  period_end (integer, optional): End year
  mode (string, optional): "keyword" | "semantic" | "hybrid" (default: "hybrid")
  limit (integer, optional): Max results (default: 20, max: 100)

Response (200 OK):
{
  "status": "success",
  "data": {
    "results": [
      {
        "case_id": "uuid",
        "title": "Case Title",
        "court": "Supreme Court of India",
        "date": "2017-08-24",
        "jurisdiction": "india",
        "snippet": "...relevant text excerpt...",
        "relevance_score": 0.89
      }
    ],
    "total_count": 156,
    "query_time_ms": 342
  }
}
```

**GET /lcet/smi**
```
Query Parameters:
  concept (string, required): Legal concept name
  jurisdiction (string, required): "india" | "us" | "echr"
  period1_start (integer, required): Start year of first period
  period1_end (integer, required): End year of first period
  period2_start (integer, required): Start year of second period
  period2_end (integer, required): End year of second period

Response (200 OK):
{
  "status": "success",
  "data": {
    "concept": "due process",
    "jurisdiction": "us",
    "period1": {"start": 1950, "end": 1970},
    "period2": {"start": 1970, "end": 1990},
    "smi_value": 0.108,
    "confidence_interval": {"lower": 0.082, "upper": 0.134},
    "classification": "significant_drift",
    "cases_period1": 145,
    "cases_period2": 198
  }
}
```

### Contract Endpoints

**POST /contracts/upload**
```
Request: multipart/form-data
  file (file, required): Contract file (PDF or DOCX, max 10MB)

Response (202 Accepted):
{
  "status": "success",
  "data": {
    "contract_id": "uuid",
    "status": "processing",
    "estimated_time_seconds": 15
  }
}
```

**GET /contracts/{id}/results**
```
Response (200 OK):
{
  "status": "success",
  "data": {
    "contract_id": "uuid",
    "filename": "nda_agreement.pdf",
    "overall_risk_score": 34.2,
    "risk_level": "moderate",
    "total_clauses": 18,
    "findings_summary": {
      "critical": 0,
      "high": 3,
      "medium": 5,
      "low": 2
    },
    "clauses": [
      {
        "clause_number": 1,
        "clause_type": "confidentiality",
        "clause_text": "...",
        "findings": [
          {
            "rule_id": "R-08",
            "severity": "medium",
            "description": "Confidentiality clause lacks standard protections...",
            "suggestion": "Consider adding provisions for...",
            "source": "rule-based"
          }
        ]
      }
    ]
  }
}
```

---

## APPENDIX B: DATABASE SCHEMA

### Cases Table
```sql
CREATE TABLE cases (
    case_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           TEXT NOT NULL,
    court           VARCHAR(255) NOT NULL,
    jurisdiction    VARCHAR(10) NOT NULL CHECK (jurisdiction IN ('india', 'us', 'echr')),
    date_decided    DATE,
    full_text       TEXT NOT NULL,
    summary         TEXT,
    citation        VARCHAR(500),
    source          VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cases_jurisdiction ON cases(jurisdiction);
CREATE INDEX idx_cases_date ON cases(date_decided);
CREATE INDEX idx_cases_fulltext ON cases USING gin(to_tsvector('english', full_text));
```

### Concepts Table
```sql
CREATE TABLE concepts (
    concept_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    jurisdiction    VARCHAR(10) NOT NULL,
    description     TEXT,
    category        VARCHAR(100),
    UNIQUE(name, jurisdiction)
);
```

### Embeddings Table
```sql
CREATE TABLE embeddings (
    embedding_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID NOT NULL REFERENCES cases(case_id),
    concept_id      UUID NOT NULL REFERENCES concepts(concept_id),
    model_name      VARCHAR(100) NOT NULL,
    embedding_vector vector(1024),
    computed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_embeddings_case ON embeddings(case_id);
CREATE INDEX idx_embeddings_concept ON embeddings(concept_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING hnsw(embedding_vector vector_cosine_ops);
```

### SMI Results Table
```sql
CREATE TABLE smi_results (
    smi_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id      UUID NOT NULL REFERENCES concepts(concept_id),
    period_start    INTEGER NOT NULL,
    period_end      INTEGER NOT NULL,
    smi_value       FLOAT NOT NULL,
    confidence_lower FLOAT,
    confidence_upper FLOAT,
    drift_category  VARCHAR(50),
    num_cases_p1    INTEGER,
    num_cases_p2    INTEGER,
    computed_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Contracts Table
```sql
CREATE TABLE contracts (
    contract_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(user_id),
    filename        VARCHAR(500) NOT NULL,
    file_type       VARCHAR(10) NOT NULL CHECK (file_type IN ('pdf', 'docx')),
    upload_date     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    raw_text        TEXT,
    overall_risk_score FLOAT,
    risk_level      VARCHAR(20),
    status          VARCHAR(20) DEFAULT 'pending',
    completed_at    TIMESTAMP
);
```

### Clauses Table
```sql
CREATE TABLE clauses (
    clause_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id     UUID NOT NULL REFERENCES contracts(contract_id),
    clause_number   INTEGER NOT NULL,
    clause_text     TEXT NOT NULL,
    clause_type     VARCHAR(100),
    risk_level      VARCHAR(20)
);
```

### Findings Table
```sql
CREATE TABLE findings (
    finding_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clause_id       UUID NOT NULL REFERENCES clauses(clause_id),
    rule_id         VARCHAR(10),
    severity        VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description     TEXT NOT NULL,
    suggestion      TEXT,
    source          VARCHAR(20) NOT NULL CHECK (source IN ('rule-based', 'llm'))
);
```

### Users Table
```sql
CREATE TABLE users (
    user_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'firm')),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login      TIMESTAMP
);
```

---

## APPENDIX C: CONFIGURATION FILES

### Docker Compose (Development)
```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./data/glaw.db
      - MODEL_CACHE_DIR=/models
      - GROQ_API_KEY=${GROQ_API_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CF_API_TOKEN=${CF_API_TOKEN}
    volumes:
      - ./backend:/app
      - model-cache:/models
      - ./data:/app/data
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules

  db:
    image: pgvector/pgvector:pg15
    environment:
      - POSTGRES_DB=glaw
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  model-cache:
  pgdata:
```

### Kubernetes Deployment (Backend)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: glaw-backend
  labels:
    app: glaw
    component: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: glaw
      component: backend
  template:
    metadata:
      labels:
        app: glaw
        component: backend
    spec:
      containers:
        - name: backend
          image: ghcr.io/glaw/backend:latest
          ports:
            - containerPort: 8000
          resources:
            requests:
              cpu: "2"
              memory: "4Gi"
            limits:
              cpu: "4"
              memory: "8Gi"
              nvidia.com/gpu: "1"
          envFrom:
            - configMapRef:
                name: glaw-config
            - secretRef:
                name: glaw-secrets
          readinessProbe:
            httpGet:
              path: /admin/health
              port: 8000
            initialDelaySeconds: 30
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /admin/health
              port: 8000
            initialDelaySeconds: 60
            periodSeconds: 30
```

### GitHub Actions CI/CD Pipeline
```yaml
name: Glaw CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Lint
        run: flake8 backend/ --max-line-length=120
      - name: Type check
        run: mypy backend/ --ignore-missing-imports
      - name: Run tests
        run: pytest backend/tests/ -v --cov=backend --cov-report=xml

  build-and-push:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: ghcr.io/glaw/backend:${{ github.sha }}
      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: true
          tags: ghcr.io/glaw/frontend:${{ github.sha }}

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to staging
        run: |
          kubectl set image deployment/glaw-backend backend=ghcr.io/glaw/backend:${{ github.sha }}
          kubectl set image deployment/glaw-frontend frontend=ghcr.io/glaw/frontend:${{ github.sha }}
          kubectl rollout status deployment/glaw-backend
          kubectl rollout status deployment/glaw-frontend

  deploy-production:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to production
        run: |
          kubectl set image deployment/glaw-backend backend=ghcr.io/glaw/backend:${{ github.sha }}
          kubectl set image deployment/glaw-frontend frontend=ghcr.io/glaw/frontend:${{ github.sha }}
          kubectl rollout status deployment/glaw-backend
          kubectl rollout status deployment/glaw-frontend
```

---

*End of Project Report*

*© 2025 Adithyan S, Arjun R, Priya M, Karthik V. All rights reserved.*
*Department of Computer Science and Engineering, [Institution Name]*
