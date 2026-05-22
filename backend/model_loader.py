import torch
import torch.nn as nn
import torchvision.models as models
from transformers import AutoModel, AutoTokenizer
from huggingface_hub import hf_hub_download
import pickle
import numpy as np
import os

HF_REPO_ID = os.environ.get(
    "HF_REPO_ID", "soumadhut/rare-disease-models")
HF_TOKEN   = os.environ.get("HF_TOKEN", None)


# ── Fusion Model (existing) ────────────────────────────────────
class MultimodalFusionModel(nn.Module):
    def __init__(self, num_classes,
                 text_dim=768, img_dim=2048,
                 fusion_dim=512, dropout=0.4):
        super().__init__()
        self.bert = AutoModel.from_pretrained(
            "dmis-lab/biobert-base-cased-v1.2")
        backbone = models.resnet50(
            weights=models.ResNet50_Weights.IMAGENET1K_V1)
        self.resnet = nn.Sequential(
            *list(backbone.children())[:-1])
        self.text_proj = nn.Linear(text_dim, fusion_dim)
        self.img_proj  = nn.Linear(img_dim,  fusion_dim)
        self.fusion = nn.Sequential(
            nn.LayerNorm(fusion_dim * 2),
            nn.Dropout(dropout),
            nn.Linear(fusion_dim * 2, fusion_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(fusion_dim, num_classes)
        )

    def forward(self, input_ids, attention_mask, images):
        text_out  = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask)
        text_feat = text_out.last_hidden_state[:, 0, :]
        text_proj = self.text_proj(text_feat)
        img_feat  = self.resnet(
            images).squeeze(-1).squeeze(-1)
        img_proj  = self.img_proj(img_feat)
        fused     = torch.cat([text_proj, img_proj], dim=1)
        return self.fusion(fused)


# ── Improved NLP V2 Model ──────────────────────────────────────
class BioBERTClassifierV2(nn.Module):
    def __init__(self, num_classes, dropout=0.3):
        super().__init__()
        self.bert = AutoModel.from_pretrained(
            "dmis-lab/biobert-base-cased-v1.2")
        hidden = self.bert.config.hidden_size
        self.classifier = nn.Sequential(
            nn.LayerNorm(hidden),
            nn.Dropout(dropout),
            nn.Linear(hidden, 768),
            nn.GELU(),
            nn.LayerNorm(768),
            nn.Dropout(dropout),
            nn.Linear(768, 512),
            nn.GELU(),
            nn.Dropout(dropout / 2),
            nn.Linear(512, num_classes)
        )

    def forward(self, input_ids, attention_mask):
        out  = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask)
        mask = attention_mask.unsqueeze(-1).float()
        token = out.last_hidden_state
        mean  = (token * mask).sum(1) / mask.sum(1)
        return self.classifier(mean)


def download_models():
    os.makedirs("models", exist_ok=True)
    files = [
        "fusion_model.pt",
        "label_encoder.pkl",
        "improved_nlp_v2.pt",
        "cnn_v2_full.pt"
    ]
    for fname in files:
        path = f"models/{fname}"
        if not os.path.exists(path):
            print(f"Downloading {fname}...")
            hf_hub_download(
                repo_id=HF_REPO_ID,
                filename=fname,
                token=HF_TOKEN,
                local_dir="models"
            )
            print(f"✓ {fname} downloaded")
        else:
            print(f"✓ {fname} already exists")


def load_models():
    device = torch.device("cpu")
    download_models()

    # ── Load fusion model ──────────────────────────────────
    ckpt = torch.load(
        "models/fusion_model.pt",
        map_location=device,
        weights_only=False
    )
    NUM_CLASSES   = ckpt['num_classes']
    label_remap   = ckpt['label_remap']
    reverse_remap = ckpt['reverse_remap']

    fusion_model = MultimodalFusionModel(NUM_CLASSES)
    fusion_model.load_state_dict(
        ckpt['model_state_dict'], strict=False)
    fusion_model.eval()

    # ── Load improved NLP V2 ───────────────────────────────
    nlp_ckpt = torch.load(
        "models/improved_nlp_v2.pt",
        map_location=device,
        weights_only=False
    )
    NLP_CLASSES      = nlp_ckpt['num_classes']
    nlp_label_remap  = nlp_ckpt['label_remap']
    nlp_reverse_remap= nlp_ckpt['reverse_remap']

    nlp_model = BioBERTClassifierV2(NLP_CLASSES)
    nlp_model.load_state_dict(
        nlp_ckpt['model_state_dict'], strict=False)
    nlp_model.eval()

    # ── Shared tokenizer ───────────────────────────────────
    tokenizer = AutoTokenizer.from_pretrained(
        "dmis-lab/biobert-base-cased-v1.2")

    # ── Label encoder ──────────────────────────────────────
    with open("models/label_encoder.pkl", "rb") as f:
        le = pickle.load(f)

    print(f"✓ Fusion model loaded  | Classes: {NUM_CLASSES}")
    print(f"✓ NLP V2 model loaded  | Classes: {NLP_CLASSES}")
    print(f"✓ Ready")

    return (fusion_model, nlp_model, tokenizer, le,
            label_remap, reverse_remap,
            nlp_label_remap, nlp_reverse_remap, device)