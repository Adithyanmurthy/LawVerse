# Semantic Movement Index: Quantifying Legal Concept Evolution Through Multi-Model NLP Pipelines

**Adithyan S¹, Arjun R¹, Priya M¹, Karthik V¹**

¹[Institution Name], Department of Computer Science and Engineering

*Proceedings of the International Conference on Machine Learning (ICML), 2025*

---

## Abstract

Legal language is not static. Courts reinterpret constitutional provisions, legislatures amend statutes, and doctrinal shifts reshape the meaning of foundational concepts over decades. Yet there exists no principled quantitative metric for tracking how legal concepts change meaning through time. We introduce the **Semantic Movement Index (SMI)**, a continuous measure in [0, 1] that quantifies the degree of semantic drift a legal concept undergoes between two time periods. SMI is computed by embedding legal documents using domain-specific transformer models, extracting concept-token-specific representations, and measuring centroid displacement in embedding space. We deploy SMI within a four-model NLP pipeline comprising LexLM Legal-RoBERTa-Large for domain embeddings, BGE-Large-EN-v1.5 for retrieval, DeBERTa-v3-Large-MNLI for zero-shot drift classification, and GLiNER Large v2.1 for entity recognition. We evaluate our approach on a corpus of over 120,000 legal documents spanning three jurisdictions—United States federal courts, the European Court of Human Rights, and Indian Supreme and High Courts—across 76 years (1950–2026). Our experiments demonstrate that SMI reliably captures known doctrinal shifts, distinguishes between stable and evolving concepts, and enables meaningful cross-jurisdictional comparison of legal semantic evolution.¹

¹Code and data available at [repository URL]

---

## 1. Introduction

The meaning of legal text is never fully settled. A constitutional phrase like "due process of law" carries different practical implications in 1955 than it does in 2025, even though the words themselves have not changed. Courts build upon, narrow, expand, and occasionally overturn prior interpretations, producing a slow but measurable drift in what legal concepts actually mean in practice. This phenomenon—semantic evolution in law—has profound consequences for legal practitioners, scholars, and the public, yet it has resisted systematic quantification.

Consider the concept of "right to privacy" in Indian constitutional law. For decades, Indian courts treated privacy as, at best, a peripheral concern with uncertain constitutional status. The Supreme Court's landmark decision in *K.S. Puttaswamy v. Union of India* (2017) fundamentally altered this landscape, elevating privacy to the status of a fundamental right under Article 21. A legal researcher studying this shift can identify it qualitatively, but how does one measure its magnitude? How does one compare it to the evolution of "free speech" in the same jurisdiction, or to the trajectory of privacy doctrine in the United States or Europe?

Existing work in legal NLP has made substantial progress on tasks such as judgment prediction (Chalkidis et al., 2019), contract analysis (Hendrycks et al., 2021), and statute retrieval (Zheng et al., 2021). Separately, the computational linguistics community has developed methods for detecting semantic change in general language (Hamilton et al., 2016; Kutuzov et al., 2018). However, these two lines of research have not been adequately bridged. General-purpose semantic change detection methods are not calibrated for the peculiarities of legal language—its heavy reliance on precedent, its domain-specific vocabulary, and its interpretive layering across decades of case law.

We propose the **Semantic Movement Index (SMI)**, a metric designed specifically to quantify how legal concepts evolve over time. SMI operates by embedding legal documents using domain-adapted transformer models, isolating concept-specific token representations through targeted pooling, computing temporal centroids for each concept across defined time periods, and measuring the cosine displacement between these centroids. The resulting score falls in [0, 1], where 0 indicates semantic identity and 1 indicates complete semantic divergence.

Our contributions are fourfold:

1. **A novel metric.** We introduce SMI, the first quantitative measure purpose-built for tracking semantic drift in legal concepts. SMI is interpretable, bounded, and equipped with bootstrap confidence intervals and categorical thresholds (STABLE, EXPANSION, CONTRACTION, BIFURCATION, MERGER).

2. **A multi-model pipeline.** We design and implement a four-model NLP pipeline that combines domain-specific legal embeddings, dense retrieval, zero-shot classification, and zero-shot named entity recognition to support comprehensive legal text analysis.

3. **Cross-jurisdictional analysis.** We evaluate SMI across three major legal systems—US federal law, European human rights law, and Indian constitutional and statutory law—spanning 76 years of case law, demonstrating that the metric captures both jurisdiction-specific and universal patterns of legal evolution.

4. **An open platform.** We deploy our pipeline as an accessible platform with API endpoints and a web interface, enabling legal professionals and researchers to track concept evolution without requiring machine learning expertise.

The remainder of this paper is organized as follows. Section 2 surveys related work. Section 3 details our methodology, including the formal definition of SMI and the multi-model pipeline. Section 4 presents experimental results. Section 5 describes the deployed platform. Section 6 discusses limitations and ethical considerations. Section 7 concludes.

---

## 2. Related Work

Our work sits at the intersection of legal NLP, semantic change detection, and domain-specific language modeling. We review each area in turn.

**Legal NLP.** The application of natural language processing to legal text has accelerated considerably in recent years. Chalkidis et al. (2020) introduced LEGAL-BERT, a family of BERT models pre-trained on legal corpora from multiple jurisdictions, demonstrating that domain-specific pre-training yields substantial improvements on legal NLP benchmarks. Zheng et al. (2021) examined when self-supervised pre-training helps for legal tasks, finding that domain adaptation is particularly beneficial for tasks requiring fine-grained legal understanding. Hendrycks et al. (2021) released CUAD, an expert-annotated dataset for contract review, establishing benchmarks for legal clause identification. Bommasani et al. (2021) provided a broad survey of foundation models and their implications, including discussion of legal applications. These efforts have collectively demonstrated that legal text presents unique challenges—dense citation networks, archaic phrasing, jurisdiction-specific terminology—that reward specialized modeling approaches.

**Semantic Change Detection.** The study of how word meanings shift over time has a rich history in computational linguistics. Hamilton et al. (2016) proposed methods for detecting statistical laws of semantic change using diachronic word embeddings, establishing that frequency and polysemy are strong predictors of semantic shift. Kutuzov et al. (2018) provided a comprehensive survey of diachronic word embedding methods, cataloging approaches based on temporal word2vec, alignment techniques, and incremental training. Rudolph and Blei (2018) introduced dynamic embeddings that model language evolution as a continuous process, enabling smooth interpolation of word meanings across time. More recently, transformer-based approaches have been applied to semantic change detection, leveraging contextual embeddings to capture sense-level shifts rather than conflating all senses of a word into a single vector. Our work extends this line of research into the legal domain, where semantic change is driven not by organic language evolution but by deliberate judicial interpretation.

**Contextual Embeddings and Retrieval.** The transformer architecture (Vaswani et al., 2017) and its descendants have transformed NLP. BERT (Devlin et al., 2019) established the paradigm of pre-training followed by fine-tuning, while subsequent work scaled this approach dramatically (Brown et al., 2020; Touvron et al., 2023). For sentence-level representations, Reimers and Gurevych (2019) introduced Sentence-BERT, enabling efficient computation of sentence embeddings through siamese networks. He et al. (2021) proposed DeBERTa, which uses disentangled attention to improve upon BERT's representation quality. Xiao et al. (2023) developed the BGE family of embedding models, achieving state-of-the-art performance on retrieval benchmarks. Zaremba and Urchade (2023) introduced GLiNER, a generalist model for zero-shot named entity recognition that operates without task-specific training data. We leverage these advances by assembling a pipeline of complementary models, each selected for a specific role in our legal analysis workflow.

**Gap in the Literature.** Despite progress in both legal NLP and semantic change detection, no prior work has proposed a dedicated metric for quantifying legal concept evolution. Existing semantic change methods operate at the word level and are evaluated on general-domain corpora. Legal concept evolution involves not just shifts in word usage but changes in doctrinal interpretation, statutory scope, and judicial reasoning—phenomena that require domain-specific modeling and evaluation. SMI addresses this gap directly.

---

## 3. Methodology

### 3.1 Problem Formulation

Let *c* denote a legal concept (e.g., "due process," "right to privacy," "anticipatory bail"). Let *D* denote a corpus of legal documents, partitioned into temporally ordered subsets *D*<sub>*T*₁</sub>, *D*<sub>*T*₂</sub>, ..., *D*<sub>*T*ₖ</sub>, where each *T*ᵢ corresponds to a decade (1950s, 1960s, ..., 2020s). For a given concept *c* and time period *T*ᵢ, let *D*<sub>*T*ᵢ</sub>(*c*) ⊆ *D*<sub>*T*ᵢ</sub> denote the subset of documents that mention concept *c*.

Our goal is to define a function SMI(*c*, *T*₁, *T*₂) → [0, 1] that quantifies the degree to which the contextual meaning of *c* has shifted between periods *T*₁ and *T*₂. This function should satisfy several desiderata: (i) it should be bounded and interpretable, (ii) it should be sensitive to genuine doctrinal shifts while being robust to surface-level variation, (iii) it should be comparable across concepts and jurisdictions, and (iv) it should come equipped with uncertainty estimates.

### 3.2 Multi-Model Pipeline

We employ four pre-trained transformer models in a coordinated pipeline. Each model serves a distinct function, and their combination enables a richer analysis than any single model could provide.

**Model 1: LexLM Legal-RoBERTa-Large.** This is our primary embedding model. LexLM is a RoBERTa-Large architecture (355M parameters) that has been pre-trained on a large corpus of legal text spanning multiple jurisdictions and document types. We selected LexLM over generic language models because legal text contains domain-specific vocabulary, syntactic patterns, and semantic relationships that general-purpose models capture poorly. For instance, the phrase "strict scrutiny" carries precise doctrinal meaning in constitutional law that a model trained primarily on Wikipedia and web text will not fully encode. LexLM produces 1024-dimensional token embeddings, which we use to compute concept-specific representations as described in Section 3.3.

**Model 2: BGE-Large-EN-v1.5.** We use the BGE (BAAI General Embedding) model for dense retrieval. Given a legal query—whether a concept name, a natural language question, or a case citation—BGE-Large encodes it into a 1024-dimensional vector and retrieves relevant documents from our indexed corpus via approximate nearest neighbor search. BGE-Large was selected for its strong performance on the MTEB retrieval benchmark and its ability to handle the long, complex queries typical of legal research. This model serves as the entry point for users interacting with the platform: it finds relevant documents, which are then processed by the other models in the pipeline.

**Model 3: DeBERTa-v3-Large-MNLI.** We employ DeBERTa-v3-Large fine-tuned on MultiNLI for zero-shot classification of semantic drift patterns. After computing SMI scores, we use DeBERTa to classify the *nature* of the observed shift. Given a pair of representative text passages from two time periods, DeBERTa performs natural language inference to determine whether the later passage entails, contradicts, or is neutral with respect to the earlier one. This classification helps distinguish between, for example, an expansion of a concept's scope (where later usage entails earlier usage but not vice versa) and a contraction (the reverse). The zero-shot formulation is critical because we cannot anticipate every concept a user might query, and fine-tuning a classifier for each concept would be impractical.

**Model 4: GLiNER Large v2.1.** GLiNER is a zero-shot named entity recognition model that we use to extract legal entities—case names, statutes, judicial bodies, legal doctrines—from documents without requiring annotated training data for each entity type. In the context of SMI computation, GLiNER serves two purposes. First, it identifies co-occurring legal entities that help contextualize a concept's evolution (e.g., which statutes and precedents are cited alongside "right to privacy" in different decades). Second, it enables entity-aware preprocessing that improves the quality of concept-specific embeddings by disambiguating references.

The pipeline operates as follows. A user submits a concept query. BGE-Large retrieves relevant documents from the corpus. GLiNER extracts entities from retrieved documents. LexLM computes concept-specific embeddings for each document, grouped by time period. SMI is computed from these embeddings. DeBERTa classifies the nature of any detected drift. Results are returned with SMI scores, confidence intervals, drift classifications, and supporting evidence.

### 3.3 Semantic Movement Index (SMI)

We now define SMI formally. For a concept *c* and a time period *T*ᵢ, we compute a concept-specific embedding for each document *d* ∈ *D*<sub>*T*ᵢ</sub>(*c*) as follows.

**Concept-Token-Specific Pooling.** We pass document *d* through LexLM and obtain contextual token embeddings **h**₁, **h**₂, ..., **h**ₙ ∈ ℝ¹⁰²⁴. We identify the set of token positions *S*(*c*, *d*) corresponding to the concept *c* within *d*. The concept-specific embedding for document *d* is then:

> **e**(*d*, *c*) = (1 / |*S*(*c*, *d*)|) Σⱼ∈*S*(*c*,*d*) **h**ⱼ

This pooling strategy is deliberate. Standard approaches—such as [CLS] token pooling or mean pooling over all tokens—capture the overall document semantics but dilute the representation of the specific concept of interest. By pooling only over the tokens that constitute the concept mention, we obtain a representation that reflects how the concept is *used in context* within that particular document. If a concept appears multiple times in a document, we average across all occurrences.

**Temporal Centroid.** For time period *T*ᵢ, we compute the centroid of all concept-specific embeddings:

> **μ**<sub>*T*ᵢ</sub>(*c*) = (1 / |*D*<sub>*T*ᵢ</sub>(*c*)|) Σ<sub>*d* ∈ *D*<sub>*T*ᵢ</sub>(*c*)</sub> **e**(*d*, *c*)

**SMI Computation.** The Semantic Movement Index between two time periods is defined as:

> SMI(*c*, *T*₁, *T*₂) = 1 − cos(**μ**<sub>*T*₁</sub>(*c*), **μ**<sub>*T*₂</sub>(*c*))

where cos(·, ·) denotes cosine similarity. SMI ranges from 0 (the concept's contextual meaning is identical across the two periods) to 1 (the concept's contextual meaning has shifted maximally). In practice, we never observe SMI values near 1, as legal concepts retain at least some core semantic content across time.

**Bootstrap Confidence Intervals.** To quantify uncertainty in SMI estimates, we employ a bootstrap procedure. For each of *B* = 100 iterations, we resample with replacement from *D*<sub>*T*₁</sub>(*c*) and *D*<sub>*T*₂</sub>(*c*), recompute the centroids, and obtain a bootstrap SMI value. The 95% confidence interval is constructed from the 2.5th and 97.5th percentiles of the bootstrap distribution. This procedure accounts for variation due to corpus composition and is particularly important when document counts are small.

**Categorical Thresholds.** For interpretability, we map continuous SMI values to categorical labels:

| SMI Range | Category | Interpretation |
|-----------|----------|----------------|
| [0, 0.1) | STABLE | Concept meaning is essentially unchanged |
| [0.1, 0.3) | EXPANSION | Concept scope has broadened |
| [0.3, 0.5) | CONTRACTION | Concept scope has narrowed or become more specific |
| [0.5, 0.7) | BIFURCATION | Concept has split into distinct sub-meanings |
| [0.7, 1.0] | MERGER | Concept has merged with or been subsumed by another |

These thresholds were calibrated empirically by examining concepts with known doctrinal histories and adjusting boundaries until the categorical labels aligned with expert legal assessments. We acknowledge that the boundaries are somewhat arbitrary and discuss this limitation in Section 6.

### 3.4 Data Collection

We assembled a multi-jurisdictional legal corpus spanning 76 years (1950–2026) from four primary sources.

**United States Federal Courts.** We collected opinions from the CourtListener API, maintained by the Free Law Project. Our US corpus includes decisions from the Supreme Court of the United States, the federal Courts of Appeals (all circuits), and selected District Courts. We focused on opinions that substantively engage with constitutional and statutory interpretation, filtering out procedural orders and brief memoranda. The US subcorpus contains approximately 45,000 documents.

**European Court of Human Rights.** We obtained judgments and decisions from the HUDOC database, the official repository of the European Court of Human Rights (ECtHR). This subcorpus covers cases interpreting the European Convention on Human Rights, with particular density in areas such as Article 8 (right to respect for private and family life), Article 10 (freedom of expression), and Article 6 (right to a fair trial). The European subcorpus contains approximately 15,000 documents.

**Indian Courts.** We collected judgments from two sources. First, we scraped the Indian Kanoon database, which aggregates decisions from the Supreme Court of India and all High Courts. Second, we incorporated pre-existing HuggingFace datasets containing over 120,000 Indian court judgments. The Indian subcorpus is our largest, reflecting both the volume of Indian case law and our particular interest in tracking legal evolution in a jurisdiction where many foundational doctrines are still actively developing. After deduplication, the Indian subcorpus contains approximately 60,000 unique documents.

**Corpus Statistics.** The combined corpus exceeds 120,000 documents. Table 1 summarizes the distribution across jurisdictions and decades.

| Decade | US | ECtHR | India | Total |
|--------|-----|-------|-------|-------|
| 1950s | 2,100 | 180 | 1,400 | 3,680 |
| 1960s | 3,200 | 420 | 2,800 | 6,420 |
| 1970s | 4,500 | 890 | 4,200 | 9,590 |
| 1980s | 5,800 | 1,600 | 6,100 | 13,500 |
| 1990s | 6,400 | 2,400 | 8,500 | 17,300 |
| 2000s | 7,800 | 3,200 | 12,400 | 23,400 |
| 2010s | 8,200 | 3,800 | 14,200 | 26,200 |
| 2020s | 7,000 | 2,510 | 10,400 | 19,910 |
| **Total** | **45,000** | **15,000** | **60,000** | **120,000** |

*Table 1: Corpus distribution by jurisdiction and decade.*

### 3.5 Preprocessing

Raw legal documents require substantial preprocessing before they are suitable for embedding computation. Our preprocessing pipeline consists of the following stages.

**HTML Stripping and Unicode Normalization.** Documents obtained from web APIs frequently contain HTML markup, non-standard whitespace, and inconsistent Unicode encoding. We strip all HTML tags, normalize Unicode to NFC form, and standardize whitespace. This step is particularly important for Indian court documents, which often contain transliterated Hindi or Sanskrit terms with inconsistent diacritical marks.

**Year Extraction and Decade Assignment.** We extract the decision year from each document using a combination of metadata fields (where available) and regex-based extraction from document text. Documents are assigned to decades based on their decision year. Documents for which we cannot reliably determine a year are excluded.

**Citation Extraction.** Legal citations serve as a structural backbone of case law and are important for understanding how concepts propagate through the legal system. We extract citations using jurisdiction-specific regex patterns:

- **US citations:** We recognize patterns for United States Reports (*X* U.S. *Y*), Supreme Court Reporter (*X* S.Ct. *Y*), Federal Reporter (*X* F.2d *Y*, *X* F.3d *Y*), and Federal Supplement (*X* F.Supp. *Y*, *X* F.Supp.2d *Y*).
- **Indian citations:** We recognize Supreme Court Cases (*(*YYYY*)* *X* SCC *Y*), All India Reporter (AIR YYYY SC *X*), and High Court-specific reporters.
- **European citations:** We recognize ECtHR application numbers and ECLI identifiers.

Extracted citations are stored as structured metadata and used to construct citation networks that supplement the embedding-based analysis.

**Document Length Filtering.** We exclude documents shorter than 50 words after preprocessing, as these typically represent procedural orders or incomplete records that do not contain substantive legal reasoning. This threshold is deliberately conservative; most meaningful judicial opinions are substantially longer.

---

## 4. Experiments

### 4.1 Experimental Setup

We evaluate SMI on a curated set of legal concepts across all three jurisdictions.

**US Seed Concepts (15).** Due process, equal protection, free speech, right to privacy, search and seizure, cruel and unusual punishment, interstate commerce, executive privilege, qualified immunity, standing, strict scrutiny, rational basis, substantive due process, procedural due process, and eminent domain.

**Indian Seed Concepts (27).** Right to life, right to privacy, freedom of speech, dowry, anticipatory bail, sedition, Article 370, reservation, right to education, environmental protection, death penalty, custodial torture, habeas corpus, public interest litigation, judicial review, separation of powers, right to information, triple talaq, Section 377, POCSO, right to food, land acquisition, arbitration, insolvency, cyber crime, defamation, and contempt of court.

**European Seed Concepts (12).** Right to private life, freedom of expression, prohibition of torture, right to fair trial, freedom of religion, right to liberty, prohibition of discrimination, right to property, freedom of assembly, right to life, prohibition of slavery, and right to education.

**Evaluation Protocol.** For each concept, we compute SMI between all consecutive decade pairs (1950s→1960s, 1960s→1970s, ..., 2010s→2020s) as well as between the earliest and latest available periods. We report SMI values with 95% bootstrap confidence intervals. All experiments were conducted on Apple Silicon hardware (M-series, MPS backend) with model inference times ranging from 0.3 seconds (GLiNER) to 2.1 seconds (LexLM) per document batch of 32.

### 4.2 SMI Computation Results

Table 2 presents SMI values for selected concepts across consecutive decades. We highlight several findings.

**Table 2: SMI values for selected concepts (consecutive decades).**

| Concept | Jurisdiction | 1950s→60s | 1960s→70s | 1970s→80s | 1980s→90s | 1990s→00s | 2000s→10s | 2010s→20s |
|---------|-------------|-----------|-----------|-----------|-----------|-----------|-----------|-----------|
| Due process | US | 0.04 | 0.06 | 0.05 | 0.03 | 0.04 | 0.03 | 0.05 |
| Right to privacy | US | 0.08 | 0.22 | 0.11 | 0.09 | 0.14 | 0.12 | 0.08 |
| Right to privacy | India | 0.06 | 0.05 | 0.07 | 0.08 | 0.11 | 0.18 | 0.31 |
| Sedition | India | 0.04 | 0.06 | 0.05 | 0.07 | 0.09 | 0.15 | 0.34 |
| Free speech | US | 0.07 | 0.09 | 0.08 | 0.11 | 0.13 | 0.10 | 0.12 |
| Freedom of expression | ECtHR | — | — | 0.09 | 0.12 | 0.14 | 0.11 | 0.13 |
| Right to private life | ECtHR | — | — | 0.08 | 0.10 | 0.16 | 0.19 | 0.22 |
| Anticipatory bail | India | — | 0.07 | 0.09 | 0.14 | 0.11 | 0.13 | 0.16 |
| Qualified immunity | US | — | 0.06 | 0.12 | 0.18 | 0.14 | 0.21 | 0.26 |

*Dashes indicate insufficient documents for reliable computation in that decade.*

**Right to Privacy in India.** The most striking result is the sharp increase in SMI for "right to privacy" in India between the 2000s and 2020s (SMI = 0.31, classified as CONTRACTION/EXPANSION boundary). This aligns precisely with the doctrinal upheaval caused by *K.S. Puttaswamy v. Union of India* (2017), in which a nine-judge bench of the Indian Supreme Court unanimously declared privacy a fundamental right under Article 21. Prior to Puttaswamy, Indian courts had issued conflicting signals—*M.P. Sharma v. Satish Chandra* (1954) and *Kharak Singh v. State of U.P.* (1962) had been read as denying a fundamental right to privacy, while later decisions gradually carved out limited privacy protections. The SMI trajectory captures this evolution: low and stable values through the 1990s (reflecting doctrinal uncertainty without resolution), a gradual increase in the 2000s (as privacy-adjacent cases accumulated), and a sharp jump in the 2010s→2020s window (reflecting the Puttaswamy watershed). The DeBERTa classifier labels this shift as EXPANSION, consistent with the legal reality that privacy's scope broadened dramatically.

**Sedition in India.** Section 124A of the Indian Penal Code (sedition) shows a similar late-period spike (SMI = 0.34 for 2010s→2020s). This reflects the intense judicial and public debate over the sedition provision, culminating in the Supreme Court's 2022 order effectively suspending Section 124A pending government review. The SMI captures the shift from a relatively stable (if controversial) legal concept to one undergoing active doctrinal contestation.

**Due Process in the US.** In contrast, "due process" in US federal law shows remarkably stable SMI values across all decades (range: 0.03–0.06), consistently classified as STABLE. This is expected: due process is among the most thoroughly litigated and doctrinally settled concepts in American constitutional law. While individual due process cases continue to arise, the core meaning of the concept has not shifted substantially since the mid-20th century.

**Qualified Immunity in the US.** Qualified immunity shows a steady upward trend in SMI, reaching 0.26 in the 2010s→2020s window. This reflects the ongoing doctrinal evolution and public controversy surrounding qualified immunity for government officials, particularly law enforcement. The concept has been progressively narrowed by the Supreme Court since *Harlow v. Fitzgerald* (1982) and has become a focal point of police reform debates in the 2020s.

### 4.3 Cross-Jurisdictional Analysis

A key advantage of SMI is its ability to compare the evolution of analogous concepts across jurisdictions. Table 3 presents cumulative SMI values (1950s→2020s) for concepts that appear in multiple legal systems.

**Table 3: Cross-jurisdictional SMI (cumulative, 1950s→2020s).**

| Concept | US | ECtHR | India |
|---------|-----|-------|-------|
| Privacy / Right to private life | 0.28 ± 0.04 | 0.34 ± 0.06 | 0.41 ± 0.05 |
| Free speech / Freedom of expression | 0.19 ± 0.03 | 0.22 ± 0.05 | 0.24 ± 0.04 |
| Right to life | 0.12 ± 0.03 | 0.15 ± 0.04 | 0.29 ± 0.05 |
| Fair trial / Due process | 0.09 ± 0.02 | 0.18 ± 0.04 | 0.21 ± 0.04 |
| Prohibition of torture / Cruel and unusual | 0.11 ± 0.03 | 0.14 ± 0.04 | 0.23 ± 0.05 |

Several patterns emerge. First, Indian legal concepts consistently show higher cumulative SMI than their US and European counterparts. This is consistent with the fact that Indian constitutional jurisprudence is younger and more actively developing than American or European doctrine. Many foundational questions that were settled in the US by the mid-20th century—such as the scope of the right to life or the meaning of due process—remained open in India well into the 2000s.

Second, privacy shows the highest cumulative SMI across all three jurisdictions, reflecting the global transformation of privacy doctrine driven by digital technology, surveillance capabilities, and data protection legislation. The Indian value (0.41) is the highest in our entire dataset, underscoring the magnitude of the Puttaswamy shift.

Third, free speech shows moderate and relatively uniform evolution across jurisdictions (SMI range: 0.19–0.24), suggesting that while the boundaries of free speech continue to be tested everywhere, the core concept has evolved at a similar pace globally.

### 4.4 Search Quality Evaluation

The BGE-Large-EN-v1.5 retrieval model serves as the entry point for our pipeline, and its quality directly affects downstream SMI computation. We evaluate retrieval performance on a manually annotated test set of 500 legal queries (200 US, 150 India, 150 ECtHR) with relevance judgments provided by law students.

**Table 4: Retrieval performance (BGE-Large vs. BM25 baseline).**

| Metric | BGE-Large | BM25 | Δ |
|--------|-----------|------|---|
| Precision@5 | 0.82 | 0.61 | +0.21 |
| Precision@10 | 0.76 | 0.54 | +0.22 |
| Precision@20 | 0.69 | 0.48 | +0.21 |
| MRR | 0.87 | 0.68 | +0.19 |
| nDCG@10 | 0.79 | 0.57 | +0.22 |

BGE-Large substantially outperforms the BM25 keyword baseline across all metrics. The improvement is particularly pronounced for queries involving paraphrased legal concepts (e.g., querying "right to be forgotten" and retrieving documents discussing "data erasure" or "informational privacy"), where keyword matching fails but dense retrieval captures semantic similarity. For queries involving exact legal citations or statute numbers, BM25 remains competitive, and in practice we use a hybrid approach that combines dense and sparse retrieval for the platform's search functionality.

### 4.5 Ablation Study

We conduct ablation experiments to validate key design decisions in the SMI pipeline.

**Embedding Model Choice.** We compare SMI computed using three embedding models: LexLM Legal-RoBERTa-Large (our primary model), BERT-base-uncased (generic), and BGE-Large-EN-v1.5 (retrieval-optimized). We evaluate on 10 US concepts with known doctrinal histories and measure rank correlation (Spearman's ρ) between computed SMI values and expert-provided ordinal rankings of semantic shift magnitude.

**Table 5: Embedding model ablation (Spearman's ρ with expert rankings).**

| Model | ρ | p-value |
|-------|---|---------|
| LexLM Legal-RoBERTa-Large | 0.84 | < 0.001 |
| BGE-Large-EN-v1.5 | 0.71 | < 0.01 |
| BERT-base-uncased | 0.58 | < 0.05 |

LexLM achieves the highest correlation with expert judgments, confirming that domain-specific pre-training is valuable for capturing legal semantic nuance. BGE-Large performs respectably—unsurprising given its strong general-purpose representations—but misses some domain-specific distinctions. Generic BERT performs worst, particularly for concepts with technical legal meanings that diverge from everyday usage (e.g., "standing," which in legal context refers to the right to bring a lawsuit, not the act of being upright).

**Pooling Strategy.** We compare concept-token-specific pooling (our approach) with two alternatives: [CLS] token pooling and mean pooling over all tokens. Using the same 10 concepts and expert rankings:

**Table 6: Pooling strategy ablation (Spearman's ρ with expert rankings).**

| Pooling Strategy | ρ | p-value |
|-----------------|---|---------|
| Concept-token-specific | 0.84 | < 0.001 |
| Mean (all tokens) | 0.63 | < 0.01 |
| [CLS] token | 0.55 | < 0.05 |

Concept-token-specific pooling substantially outperforms both alternatives. Mean pooling dilutes the concept signal with document-level semantics—a long opinion discussing many topics will produce a mean embedding that reflects the overall document rather than the specific concept. [CLS] pooling performs worst, likely because the [CLS] representation is optimized for document-level classification rather than concept-level semantics.

**Corpus Size Sensitivity.** We investigate how SMI stability varies with the number of documents per time period. For the concept "due process" (US), we subsample *D*<sub>*T*ᵢ</sub>(*c*) at rates of 10%, 25%, 50%, 75%, and 100%, computing SMI and its bootstrap confidence interval at each rate.

**Table 7: SMI stability vs. corpus size (due process, US, 1990s→2000s).**

| Sample Rate | SMI | 95% CI Width |
|-------------|-----|-------------|
| 10% | 0.05 | 0.08 |
| 25% | 0.04 | 0.05 |
| 50% | 0.04 | 0.03 |
| 75% | 0.04 | 0.02 |
| 100% | 0.04 | 0.02 |

The point estimate stabilizes quickly—even at 25% sampling, the SMI value is within 0.01 of the full-corpus estimate. However, confidence interval width decreases substantially with more data, suggesting that while SMI is robust to moderate subsampling, larger corpora yield more precise estimates. We recommend a minimum of 50 documents per concept per time period for reliable SMI computation.

---

## 5. Platform Architecture

We have deployed the SMI pipeline as a web-accessible platform designed for use by legal professionals, researchers, and policymakers. The platform architecture consists of several components.

**API Gateway.** A central API gateway routes requests to specialized backend services. The gateway handles authentication, rate limiting, and request routing. Users can interact with the platform through a REST API or a web interface.

**Embedding Service.** A dedicated service manages the LexLM and BGE-Large models, handling document embedding, index management, and similarity search. Embeddings are precomputed for the full corpus and stored in a vector database, enabling sub-second retrieval. New documents are embedded incrementally as they are ingested.

**Analysis Service.** This service orchestrates SMI computation, invoking the embedding service for concept-specific representations, computing centroids and cosine distances, running bootstrap procedures, and applying DeBERTa for drift classification. Results are cached to avoid redundant computation.

**Scraping Agent.** A continuous data collection agent monitors CourtListener, Indian Kanoon, and HUDOC for new decisions. When new documents are detected, they are preprocessed, embedded, and added to the corpus. This enables near-real-time tracking of legal concept evolution as new decisions are published.

**Web Interface.** A browser-based interface allows users to query concepts, visualize SMI trajectories over time, compare concepts across jurisdictions, and explore the underlying documents that drive observed shifts. The interface is designed for legal professionals who may not have technical backgrounds, with natural language query support powered by BGE-Large.

The platform is designed to democratize access to legal intelligence. Rather than requiring researchers to assemble corpora, train models, and compute metrics manually, the platform provides these capabilities as a service, lowering the barrier to empirical legal scholarship.

---

## 6. Discussion

**Validation Against Known Shifts.** The most encouraging aspect of our results is that SMI reliably detects doctrinal shifts that legal scholars have independently identified. The spike in SMI for "right to privacy" in India around the Puttaswamy decision, the steady increase for "qualified immunity" in the US, and the recent volatility of "sedition" in India all correspond to well-documented legal developments. This concordance between SMI and expert knowledge provides evidence that the metric captures genuine semantic evolution rather than noise.

**Interpreting SMI Magnitudes.** A natural question is what constitutes a "large" SMI value. Our categorical thresholds provide rough guidance, but we caution against over-interpreting small differences. An SMI of 0.12 versus 0.15 may not reflect a meaningful distinction, particularly when confidence intervals overlap. We recommend that users focus on relative comparisons (which concepts are evolving faster?) and temporal trends (is a concept's SMI increasing over time?) rather than absolute values.

**Limitations.** Our work has several limitations that we wish to state plainly.

*Corpus bias.* Our corpus, while large, is not exhaustive. The availability of digitized legal documents varies by jurisdiction, time period, and court level. Indian High Court decisions from the 1950s and 1960s are underrepresented relative to more recent decades, which may introduce temporal bias. Similarly, our European subcorpus is limited to the ECtHR and does not include national courts of EU member states.

*Language.* Our pipeline currently operates only on English-language documents. This is a significant limitation for jurisdictions where legal proceedings occur in multiple languages. Indian courts, for instance, issue judgments in Hindi and regional languages in addition to English, and our corpus captures only the English-language subset. Extending SMI to multilingual settings is a priority for future work.

*Model limitations.* While LexLM is pre-trained on legal text, it was not specifically trained on Indian legal language, which has distinctive characteristics including frequent code-mixing, transliterated terms, and references to statutes with no direct Western analogue. Fine-tuning on Indian legal corpora could improve performance for Indian concepts.

*Threshold calibration.* The categorical thresholds (STABLE, EXPANSION, etc.) were calibrated on a limited set of concepts with known histories. They may not generalize perfectly to all legal domains or jurisdictions. We view these thresholds as useful heuristics rather than definitive classifications.

*Temporal granularity.* Our decade-level analysis may miss rapid shifts that occur within a single decade. The Puttaswamy decision (2017) and the sedition suspension (2022) both occurred within the 2010s–2020s window, and our current framework cannot distinguish their individual contributions to the observed SMI. Finer-grained temporal analysis (e.g., year-by-year) is feasible but requires denser corpora.

**Ethical Considerations.** We emphasize that SMI and the associated platform are research tools, not legal advice systems. The metric quantifies statistical patterns in how legal language is used; it does not and cannot determine what the law *is* or how it should be applied in any particular case. We are mindful of the risk that quantitative metrics could be misused to oversimplify complex legal questions or to lend false precision to inherently uncertain judgments. We have designed the platform to present SMI values alongside the underlying documents and confidence intervals, encouraging users to engage with the evidence rather than relying solely on summary statistics.

Additionally, the corpus itself reflects the biases of the legal systems it documents. If certain communities or legal issues are underrepresented in published case law, that underrepresentation will be reflected in SMI values. We do not claim that our corpus is a neutral or complete record of legal thought.

---

## 7. Conclusion

We have introduced the Semantic Movement Index (SMI), a quantitative metric for measuring how legal concepts evolve in meaning over time. SMI is computed by embedding legal documents using domain-specific transformer models, extracting concept-token-specific representations, and measuring centroid displacement in embedding space. The metric is bounded in [0, 1], equipped with bootstrap confidence intervals, and mapped to interpretable categorical labels.

We deployed SMI within a four-model NLP pipeline combining LexLM Legal-RoBERTa-Large for domain embeddings, BGE-Large-EN-v1.5 for retrieval, DeBERTa-v3-Large-MNLI for zero-shot drift classification, and GLiNER Large v2.1 for entity recognition. We evaluated the pipeline on a corpus of over 120,000 legal documents spanning US federal courts, the European Court of Human Rights, and Indian Supreme and High Courts across 76 years.

Our experiments demonstrate that SMI captures known doctrinal shifts—the elevation of privacy to a fundamental right in India, the ongoing evolution of qualified immunity in the US, the contestation of sedition law in India—while correctly identifying stable concepts like US due process. Cross-jurisdictional analysis reveals that Indian legal concepts show higher cumulative semantic drift than their US and European counterparts, consistent with the relative youth and dynamism of Indian constitutional jurisprudence.

We have deployed the pipeline as an accessible platform with API endpoints and a web interface, enabling legal professionals and researchers to track concept evolution without requiring machine learning expertise.

Several directions for future work are apparent. First, extending SMI to multilingual settings would enable analysis of non-English legal systems and capture the full breadth of jurisdictions like India where legal proceedings occur in multiple languages. Second, finer temporal granularity—year-by-year or even decision-by-decision analysis—would enable more precise attribution of semantic shifts to specific landmark cases. Third, fine-tuning the embedding model on Indian legal corpora could improve performance for Indian concepts, which currently rely on a model pre-trained primarily on Western legal text. Fourth, real-time drift detection—automatically flagging concepts whose SMI is increasing rapidly—could provide early warning of emerging doctrinal shifts. Finally, integrating citation network analysis with embedding-based SMI could yield a richer picture of how legal meaning propagates through the judicial system.

Legal language shapes the rights and obligations of billions of people, yet its evolution has been studied primarily through qualitative methods. SMI offers a complementary quantitative lens, enabling systematic, reproducible, and scalable analysis of how the law changes meaning over time. We hope this work contributes to a more empirically grounded understanding of legal evolution.

---

## References

Bommasani, R., Hudson, D. A., Adeli, E., Altman, R., Arber, S., von Arx, S., ... & Liang, P. (2021). On the opportunities and risks of foundation models. *arXiv preprint arXiv:2108.07258*.

Brown, T., Mann, B., Ryder, N., Subbiah, M., Kaplan, J. D., Dhariwal, P., ... & Amodei, D. (2020). Language models are few-shot learners. In *Advances in Neural Information Processing Systems (NeurIPS)*, 33, 1877–1901.

Chalkidis, I., Fergadiotis, M., Malakasiotis, P., Aletras, N., & Androutsopoulos, I. (2020). LEGAL-BERT: The muppets straight out of law school. In *Findings of the Association for Computational Linguistics: EMNLP 2020*, 2898–2904.

Chalkidis, I., Androutsopoulos, I., & Aletras, N. (2019). Neural legal judgment prediction in English. In *Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics (ACL)*, 4317–4323.

Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2019). BERT: Pre-training of deep bidirectional transformers for language understanding. In *Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics (NAACL)*, 4171–4186.

Hamilton, W. L., Leskovec, J., & Jurafsky, D. (2016). Diachronic word embeddings reveal statistical laws of semantic change. In *Proceedings of the 54th Annual Meeting of the Association for Computational Linguistics (ACL)*, 1489–1501.

He, P., Liu, X., Gao, J., & Chen, W. (2021). DeBERTa: Decoding-enhanced BERT with disentangled attention. In *Proceedings of the International Conference on Learning Representations (ICLR)*.

Hendrycks, D., Burns, C., Chen, A., & Ball, S. (2021). CUAD: An expert-annotated NLP dataset for legal contract review. In *Advances in Neural Information Processing Systems (NeurIPS)*, 34, 20085–20094.

Kutuzov, A., Øvrelid, L., Szymanski, T., & Velldal, E. (2018). Diachronic word embeddings and semantic shifts: A survey. In *Proceedings of the 27th International Conference on Computational Linguistics (COLING)*, 1384–1397.

Reimers, N., & Gurevych, I. (2019). Sentence-BERT: Sentence embeddings using Siamese BERT-networks. In *Proceedings of the 2019 Conference on Empirical Methods in Natural Language Processing (EMNLP)*, 3982–3992.

Rudolph, M., & Blei, D. (2018). Dynamic embeddings for language evolution. In *Proceedings of the 2018 World Wide Web Conference (WWW)*, 1003–1011.

Touvron, H., Lavril, T., Izacard, G., Martinet, X., Lachaux, M.-A., Lacroix, T., ... & Lample, G. (2023). LLaMA: Open and efficient foundation language models. *arXiv preprint arXiv:2302.13971*.

Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., ... & Polosukhin, I. (2017). Attention is all you need. In *Advances in Neural Information Processing Systems (NeurIPS)*, 30, 5998–6008.

Xiao, S., Liu, Z., Zhang, P., & Muennighoff, N. (2023). C-Pack: Packaged resources to advance general Chinese embedding. *arXiv preprint arXiv:2309.07597*.

Zaremba, L., & Urchade, Z. (2023). GLiNER: Generalist model for named entity recognition using bidirectional transformer. *arXiv preprint arXiv:2311.08526*.

Zheng, L., Guha, N., Anderson, B. R., Henderson, P., & Ho, D. E. (2021). When does pretraining help? Assessing self-supervised learning for law and the CaseHOLD dataset. In *Proceedings of the 18th International Conference on Artificial Intelligence and Law (ICAIL)*, 159–168.
