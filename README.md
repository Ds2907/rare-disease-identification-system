# 🦓 AI-Powered Rare Disease Identification System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.119-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-BioBERT-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

<br/>

> **Simulating data scarcity · GAN augmentation · Multimodal deep learning · Top-K disease ranking**

<br/>

*A complete end-to-end AI pipeline that identifies rare diseases from symptoms and medical images — specifically engineered to tackle the fundamental challenge of extremely limited training data in rare disease diagnosis.*

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Results](#-key-results)
- [System Architecture](#-system-architecture)
- [Datasets](#-datasets)
- [Experiments](#-experiments)
- [Models](#-models)
- [GAN Augmentation](#-gan-augmentation)
- [Backend API](#-backend-api)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Results Dashboard](#-results-dashboard)
- [Tech Stack](#-tech-stack)
- [References](#-references)

---

## 🔭 Overview

Rare diseases affect **300 million people worldwide**, yet each individual disease has so few documented cases that traditional machine learning fails. This project directly tackles that problem.

### The Core Challenge

```
582 diseases  →  ≤ 5 clinical cases each   (ultra-rare)
403 diseases  →  6–20 clinical cases each  (rare)
389 diseases  →  > 20 clinical cases each  (common)
```

### Our Approach

```
Real data (5–10%)  →  Train FastGAN  →  Generate synthetic images
        ↓                                         ↓
   Baseline model                    Real + Synthetic combined
        ↓                                         ↓
   Low accuracy              Retrained model → Higher accuracy
                                      ↓
                          Top-K disease ranking output
```

---

## 🏆 Key Results

<div align="center">

| Experiment | Dataset | Model | Accuracy | Top-5 Accuracy |
|:---:|:---:|:---:|:---:|:---:|
| Scarcity Baseline | ZebraMap | BioBERT | 10.16% | 17.74% |
| Scarcity Baseline | HAM10000 | ResNet-50 | 77.59% | 94.80% |
| **GAN Augmented ⭐** | **HAM10000** | **ResNet-50 + GAN** | **87.97%** | **100.00%** |
| Full Dataset | HAM10000 | ResNet-50 | 87.52% | 99.50% |
| ZebraMap Baseline | ZebraMap | BioBERT | 16.56% | 35.98% |
| ZebraMap + Aug | ZebraMap | BioBERT + TextAug | 16.89% | 36.39% |
| **Tier-A Improved** | **ZebraMap** | **BioBERT** | **31.82%** | **60.35%** |

</div>

### 🌟 Star Finding

> **GAN-augmented model (87.97%) BEATS the full dataset model (87.52%) by +0.45%**
> — achieving a **+10.38% accuracy gain** over the scarcity baseline with only 5–10% real data

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT LAYER                              │
│         Symptoms (text)  +  Medical Image                   │
└──────────────────┬──────────────────┬───────────────────────┘
                   │                  │
         ┌─────────▼──────┐  ┌────────▼────────┐
         │  NLP Pipeline  │  │  CNN Pipeline   │
         │                │  │                 │
         │  BioBERT       │  │  ResNet-50      │
         │  Tokenizer     │  │  ImageNet       │
         │  [CLS] token   │  │  pretrained     │
         │  → 768-dim     │  │  → 2048-dim     │
         └─────────┬──────┘  └────────┬────────┘
                   │                  │
         ┌─────────▼──────────────────▼────────┐
         │         FUSION LAYER                │
         │   Text Proj (512) + Img Proj (512)  │
         │   → Concatenate → LayerNorm         │
         │   → MLP → Dropout → Output          │
         └─────────────────┬───────────────────┘
                           │
         ┌─────────────────▼───────────────────┐
         │         TOP-K RANKING               │
         │   Softmax → Top-1 / Top-3 / Top-5  │
         │   Disease + Probability + Confidence│
         └─────────────────────────────────────┘
```

---

## 📊 Datasets

### ZebraMap — Real Rare Disease Dataset
```
Total cases      : 36,487 clinical case reports
Unique diseases  : 1,374 rare diseases
Images           : 79,478 clinical images
Avg symptoms     : 8.5 per case
Image subtypes   : MRI, CT Scan, Radiography, Dermatology,
                   Histopathology, Fundus Photography, and more
Source           : PubMed case reports + Orphanet registry
```

### HAM10000 — Benchmark Skin Disease Dataset
```
Total images     : 10,015 dermoscopy images
Disease classes  : 7 (nv, mel, bkl, bcc, akiec, vasc, df)
Use case         : Scarcity simulation + GAN augmentation benchmark
Source           : ISIC Archive
```

---

## 🧪 Experiments

### Experiment Design

| # | Name | Training Data | Purpose |
|---|---|---|---|
| Exp 1 | Scarcity Baseline | 5–10% per class | Simulate rare disease conditions |
| Exp 2 | GAN Augmented ⭐ | 5–10% real + GAN synthetic | Measure GAN uplift |
| Exp 3 | Full Dataset | 80% of full data | Upper bound ceiling |
| Exp 4 | ZebraMap Baseline | ZebraMap full | Real rare disease baseline |
| Exp 5 | ZebraMap + GAN | ZebraMap + synthetic | GAN on real rare diseases |

### Scarcity Simulation Strategy
```python
# Class-wise stratified sampling — NOT random global split
for each disease class:
    train = 5-10% of class samples
    test  = remaining 90-95%
    minimum = 3 samples (edge case handling)
```

---

## 🤖 Models

### 1. NLP Model — BioBERT Classifier
```
Base     : dmis-lab/biobert-base-cased-v1.2
Input    : Symptom text joined with [SEP] tokens
Encoding : Max length 128 tokens
Head     : Dropout → Linear(768→512) → ReLU → Linear(512→N)
Training : AdamW, lr=2e-5, 20 epochs, warmup scheduler
```

### 2. CNN Model — ResNet-50 Classifier
```
Base     : ResNet-50 pretrained on ImageNet
Strategy : Freeze first 7 layers, fine-tune last 2 blocks
Input    : 224×224 RGB images, normalized
Head     : Flatten → Dropout → Linear(2048→512) → BN → Linear(512→N)
Training : AdamW, lr=1e-4, 15 epochs, CosineAnnealing
```

### 3. Multimodal Fusion Model
```
Text     : BioBERT → CLS token → Linear projection (512-dim)
Image    : ResNet-50 → Global avg pool → Linear projection (512-dim)
Fusion   : Concatenate [text_proj, img_proj] → 1024-dim
           LayerNorm → Dropout → Linear(1024→512) → GELU
           → Dropout → Linear(512→N classes)
Output   : Top-K ranked diseases with softmax probabilities
```

---

## 🎨 GAN Augmentation

### FastGAN Architecture
```
Generator    : ConvTranspose layers 4→8→16→32→64→128px
               + ResBlocks for stable training
               + Tanh activation
Discriminator: Spectral Norm Conv layers
               + Hinge loss for training stability
Latent dim   : 128
Image size   : 128×128 (HAM10000), 64×64 (ZebraMap)
```

### HAM10000 GAN Results
```
Classes trained : 6 (skipped majority class nv)
Epochs          : 500 per class
Generated       : 4,368 synthetic images

df    : 115 real  + 998  synthetic = 1,113 total
vasc  : 142 real  + 971  synthetic = 1,113 total
akiec : 327 real  + 786  synthetic = 1,113 total
bcc   : 514 real  + 599  synthetic = 1,113 total
bkl   : 1099 real + 14   synthetic = 1,113 total
```

### ZebraMap GAN — Subtype Grouped Strategy
```
Approach  : Group by image subtype for consistent generation
Subtypes  : MRI (88 classes) · CT Scan (40) · Radiography (39)
            Dermatology (33) · Histopathology (29)
Epochs    : 300 per subtype group
Generated : 4,580 synthetic images (20 per ultra-rare class)
```

---

## 🚀 Backend API

### Endpoints

```
GET  /              → API info and available endpoints
GET  /health        → Health check
POST /predict       → Multimodal prediction (image + symptoms)
POST /predict/text  → Text-only prediction (symptoms only)
GET  /analytics     → Prediction statistics dashboard
GET  /history       → Recent prediction history
```

### Sample Request
```bash
# Text-only prediction
curl -X POST "http://localhost:8000/predict/text" \
  -F "symptoms=fever,headache,fatigue,vomiting" \
  -F "top_k=5"
```

### Sample Response
```json
{
  "status": "success",
  "symptoms": ["fever", "headache", "fatigue", "vomiting"],
  "predictions": [
    {"rank": 1, "disease": "Sarcoidosis",    "probability": 23.45, "confidence": "Medium"},
    {"rank": 2, "disease": "Amyloidosis",    "probability": 18.32, "confidence": "Low"},
    {"rank": 3, "disease": "CACH syndrome",  "probability": 12.11, "confidence": "Low"},
    {"rank": 4, "disease": "Microlissencephaly", "probability": 9.87, "confidence": "Low"},
    {"rank": 5, "disease": "Multiple myeloma",   "probability": 7.23, "confidence": "Low"}
  ],
  "top_k": 5,
  "timestamp": "2026-05-13 10:23:11"
}
```

### Database Schema
```sql
TABLE predictions (
  id            INTEGER PRIMARY KEY,
  timestamp     DATETIME,
  symptoms      TEXT,
  has_image     VARCHAR(10),
  top1_disease  VARCHAR(200),
  top1_prob     FLOAT,
  top3_diseases TEXT,
  top5_diseases TEXT,
  top_k         INTEGER
)
```

---

## 📁 Project Structure

```
rare-disease-identification-system/
│
├── 📓 notebooks/
│   ├── colab/
│   │   ├── Day_1_Setup.ipynb
│   │   ├── Day_2_EDA_NLP_Baseline.ipynb
│   │   ├── Day_3_NLP_Baseline.ipynb
│   │   ├── Day_4_CNN_Baseline.ipynb
│   │   ├── Day_5_Full_Dataset_Upperbound.ipynb
│   │   ├── Day_7_ZebraMap_Baseline.ipynb
│   │   ├── Day_9_GAN_Setup.ipynb
│   │   ├── Day_12_13_ZebraMap_GAN_Retrain.ipynb
│   │   ├── Day_14_15_16_Fusion_Model.ipynb
│   │   └── Day_18_19_Final_Analysis.ipynb
│   └── kaggle/
│       ├── Day6_HAM10000_Scarcity.ipynb
│       ├── Day10_11_HAM_GAN.ipynb
│       └── Day14_15_16_Fusion_Model.ipynb
│
├── 🔧 backend/
│   ├── app.py              ← FastAPI application
│   ├── model_loader.py     ← Model loading utilities
│   ├── database.py         ← SQLite database + ORM
│   ├── requirements.txt    ← Python dependencies
│   └── models/             ← Trained model checkpoints
│       ├── fusion_model.pt
│       ├── label_encoder.pkl
│       └── ...
│
├── 🎨 frontend/
|    |
│     ....
|
├── 📊 results/
│   ├── experiment_tracker.json
│   ├── day18_master_dashboard.png
│   ├── day18_19_final_report.json
│   └── ...
│
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
```bash
Python 3.10+
Node.js 18+
Git
```

### 1. Clone Repository
```bash
git clone https://github.com/SoumajyotiDhut/rare-disease-identification-system.git
cd rare-disease-identification-system
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
```

### 3. Download Models
Download trained model files and place in `backend/models/`:
- `fusion_model.pt`
- `label_encoder.pkl`

### 4. Run Backend
```bash
python app.py
# API running at http://localhost:8000
# Swagger UI at http://localhost:8000/docs
```

### 5. Setup Frontend
```bash
.......Pending
```

---

## 📈 Results Dashboard

### GAN Uplift — HAM10000

```
Baseline  (5-10%) : ████████████████░░░░ 77.59%
GAN Aug   ⭐       : ████████████████████ 87.97%  (+10.38%)
Full Data          : ████████████████████ 87.52%
```

### Top-K Accuracy — ZebraMap Tier-A

```
Top-1  : ████████████░░░░░░░░░░░░░░░░░░ 31.82%
Top-3  : █████████████████████░░░░░░░░░ 51.94%
Top-5  : ████████████████████████░░░░░░ 60.35%
```

### Dataset Difficulty Comparison

```
HAM10000  (7 classes)    : 87.97% ← Specialized dermatology
ZebraMap  (1,374 classes): 31.82% ← Broad rare disease spectrum
Difficulty ratio          : 196x more classes
```

---

## 💻 Tech Stack

<div align="center">

| Category | Technology |
|:---:|:---:|
| **Deep Learning** | PyTorch 2.0, TorchVision |
| **NLP Model** | BioBERT (dmis-lab/biobert-base-cased-v1.2) |
| **CNN Model** | ResNet-50 (ImageNet pretrained) |
| **GAN** | FastGAN with Spectral Norm Discriminator |
| **Backend** | FastAPI + Uvicorn |
| **Database** | SQLite + SQLAlchemy ORM |
| **Frontend** | ---- |
| **Data Science** | scikit-learn, pandas, numpy, matplotlib |
| **Training Platform** | Google Colab (T4 GPU) + Kaggle (T4 x2) |
| **Version Control** | Git + GitHub |

</div>

---

## 📚 References

1. Goodfellow, I. et al. (2014). *Generative Adversarial Nets.* NeurIPS
2. Lee, J. et al. (2020). *BioBERT: a pre-trained biomedical language representation model.* Bioinformatics
3. He, K. et al. (2016). *Deep Residual Learning for Image Recognition.* CVPR
4. Liu, B. et al. (2021). *Towards Faster and Stabilized GAN Training for High-fidelity Few-shot Image Synthesis.* ICLR (FastGAN)
5. Frid-Adar, M. et al. (2018). *GAN-based Synthetic Medical Image Augmentation.* Neurocomputing
6. Baltrusaitis, T. et al. (2019). *Multimodal Machine Learning: A Survey.* IEEE TPAMI
7. ZebraMap Dataset (2023). *A Multimodal Rare Disease Case Report Dataset.* MDPI Diagnostics

---

## 👤 Author

**Soumajyoti Dhut**


[![GitHub](https://img.shields.io/badge/GitHub-SoumajyotiDhut-181717?style=for-the-badge&logo=github)](https://github.com/SoumajyotiDhut)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

*Built as part of Final Year Project*

</div>