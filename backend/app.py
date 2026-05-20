from fastapi import FastAPI, File, UploadFile, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from transformers import AutoTokenizer
from PIL import Image
import io
import uvicorn
from model_loader import load_models
from database import (create_tables, get_db,
                      save_prediction, get_analytics,
                      PredictionRecord)
from datetime import datetime
import json

app = FastAPI(
    title="Rare Disease Identification API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

create_tables()

print("Loading models...")
(fusion_model, nlp_model, tokenizer, le,
 label_remap, reverse_remap,
 nlp_label_remap, nlp_reverse_remap,
 device) = load_models()

img_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225])
])


@app.get("/")
def root():
    return {
        "message" : "Rare Disease Identification API",
        "version" : "2.0",
        "status"  : "running",
        "models"  : {
            "fusion" : "BioBERT + ResNet-50 Fusion",
            "nlp_v2" : "BioBERT V2 (improved)"
        },
        "endpoints": {
            "/predict"     : "POST — image + symptoms",
            "/predict/text": "POST — symptoms only (NLP V2)",
            "/health"      : "GET  — health check",
            "/analytics"   : "GET  — prediction stats",
            "/history"     : "GET  — prediction history"
        }
    }


@app.get("/health")
def health():
    return {
        "status"      : "healthy",
        "fusion_model": "loaded",
        "nlp_v2_model": "loaded"
    }


@app.post("/predict/text")
async def predict_text(
    symptoms : str = Form(...),
    top_k    : int = Form(default=5),
    db       : Session = Depends(get_db)
):
    """Predict using improved NLP V2 model — symptoms only"""
    try:
        symptom_list = [s.strip().lower()
                        for s in symptoms.split(',')]
        symptom_text = ' [SEP] '.join(symptom_list)

        enc = tokenizer(
            symptom_text,
            max_length=128,
            truncation=True,
            padding='max_length',
            return_tensors='pt'
        )

        # Use improved NLP V2 model
        with torch.no_grad():
            logits = nlp_model(
                enc['input_ids'].to(device),
                enc['attention_mask'].to(device)
            )
            probs = F.softmax(logits, dim=1)
            topk  = probs.topk(
                min(top_k, probs.size(1)), dim=1)

        predictions = []
        for i in range(topk.indices.size(1)):
            label_idx  = topk.indices[0][i].item()
            prob       = topk.values[0][i].item()
            orig_label = nlp_reverse_remap.get(
                label_idx, label_idx)
            try:
                disease = le.inverse_transform(
                    [orig_label])[0]
            except:
                disease = f"Disease_{orig_label}"

            predictions.append({
                "rank"       : i + 1,
                "disease"    : disease,
                "probability": round(prob * 100, 2),
                "confidence" : "High"   if prob > 0.5
                               else "Medium" if prob > 0.2
                               else "Low",
                "model_used" : "NLP_V2"
            })

        save_prediction(db, symptom_list,
                        predictions,
                        has_image=False, top_k=top_k)

        return {
            "status"     : "success",
            "symptoms"   : symptom_list,
            "predictions": predictions,
            "model"      : "BioBERT V2 (improved)",
            "top_k"      : top_k,
            "timestamp"  : str(datetime.utcnow())
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.post("/predict")
async def predict(
    symptoms : str = Form(...),
    image    : UploadFile = File(...),
    top_k    : int = Form(default=5),
    db       : Session = Depends(get_db)
):
    """Predict using fusion model — image + symptoms"""
    try:
        symptom_list = [s.strip().lower()
                        for s in symptoms.split(',')]
        symptom_text = ' [SEP] '.join(symptom_list)

        enc = tokenizer(
            symptom_text,
            max_length=128,
            truncation=True,
            padding='max_length',
            return_tensors='pt'
        )

        img_bytes  = await image.read()
        img        = Image.open(
            io.BytesIO(img_bytes)).convert('RGB')
        img_tensor = img_transform(img).unsqueeze(0)

        with torch.no_grad():
            logits = fusion_model(
                enc['input_ids'].to(device),
                enc['attention_mask'].to(device),
                img_tensor.to(device)
            )
            probs = F.softmax(logits, dim=1)
            topk  = probs.topk(
                min(top_k, probs.size(1)), dim=1)

        predictions = []
        for i in range(topk.indices.size(1)):
            label_idx  = topk.indices[0][i].item()
            prob       = topk.values[0][i].item()
            orig_label = reverse_remap.get(
                label_idx, label_idx)
            try:
                disease = le.inverse_transform(
                    [orig_label])[0]
            except:
                disease = f"Disease_{orig_label}"

            predictions.append({
                "rank"       : i + 1,
                "disease"    : disease,
                "probability": round(prob * 100, 2),
                "confidence" : "High"   if prob > 0.5
                               else "Medium" if prob > 0.2
                               else "Low",
                "model_used" : "Fusion"
            })

        save_prediction(db, symptom_list,
                        predictions,
                        has_image=True, top_k=top_k)

        return {
            "status"     : "success",
            "symptoms"   : symptom_list,
            "predictions": predictions,
            "model"      : "Multimodal Fusion",
            "top_k"      : top_k,
            "timestamp"  : str(datetime.utcnow())
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    try:
        data = get_analytics(db)
        return {"status": "success", "data": data}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@app.get("/history")
def history(
    limit : int = 20,
    db    : Session = Depends(get_db)
):
    try:
        records = db.query(PredictionRecord)\
            .order_by(
                PredictionRecord.timestamp.desc()
            ).limit(limit).all()

        history = []
        for r in records:
            history.append({
                "id"          : r.id,
                "timestamp"   : str(r.timestamp),
                "symptoms"    : r.symptoms,
                "has_image"   : r.has_image,
                "top1_disease": r.top1_disease,
                "top1_prob"   : r.top1_prob,
                "top5"        : json.loads(
                    r.top5_diseases)
                    if r.top5_diseases else []
            })

        return {
            "status" : "success",
            "count"  : len(history),
            "history": history
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(
        app, host="0.0.0.0", port=8000)