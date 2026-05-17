import torch
import torch.nn as nn
import torchvision.models as models
from transformers import AutoModel, AutoTokenizer
from huggingface_hub import hf_hub_download
import pickle
import numpy as np
import os

# ── Your HuggingFace repo details ──────────────────────────────
HF_REPO_ID = "soumadhut/rare-disease-models"  # ← update this
HF_TOKEN   = os.environ.get("HF_TOKEN", None)


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
        img_feat  = self.resnet(images).squeeze(-1).squeeze(-1)
        img_proj  = self.img_proj(img_feat)
        fused     = torch.cat([text_proj, img_proj], dim=1)
        return self.fusion(fused)


def download_models():
    """Download models from HuggingFace Hub"""
    os.makedirs("models", exist_ok=True)

    model_path = "models/fusion_model.pt"
    le_path    = "models/label_encoder.pkl"

    if not os.path.exists(model_path):
        print("Downloading fusion_model.pt from HuggingFace...")
        downloaded = hf_hub_download(
            repo_id=HF_REPO_ID,
            filename="fusion_model.pt",
            token=HF_TOKEN,
            local_dir="models"
        )
        print(f"✓ Model downloaded: {downloaded}")
    else:
        print("✓ fusion_model.pt already exists")

    if not os.path.exists(le_path):
        print("Downloading label_encoder.pkl...")
        hf_hub_download(
            repo_id=HF_REPO_ID,
            filename="label_encoder.pkl",
            token=HF_TOKEN,
            local_dir="models"
        )
        print("✓ label_encoder.pkl downloaded")
    else:
        print("✓ label_encoder.pkl already exists")


def load_models():
    device = torch.device("cpu")
    download_models()

    # PyTorch 2.0.1 compatible loading
    ckpt = torch.load(
        "models/fusion_model.pt",
        map_location=device
    )

    NUM_CLASSES   = ckpt['num_classes']
    label_remap   = ckpt['label_remap']
    reverse_remap = ckpt['reverse_remap']

    model = MultimodalFusionModel(NUM_CLASSES)
    model.load_state_dict(ckpt['model_state_dict'])
    model.eval()

    tokenizer = AutoTokenizer.from_pretrained(
        "dmis-lab/biobert-base-cased-v1.2")

    with open("models/label_encoder.pkl", "rb") as f:
        le = pickle.load(f)

    print(f"✓ Models loaded | Classes: {NUM_CLASSES}")
    return (model, tokenizer, le,
            label_remap, reverse_remap, device)