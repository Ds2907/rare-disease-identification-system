import torch
import pickle
import numpy as np

print(f"NumPy version: {np.__version__}")
print(f"PyTorch version: {torch.__version__}")

# Load with weights_only=False (trusted local file)
print("Loading model...")
ckpt = torch.load(
    "models/fusion_model.pt",
    map_location="cpu",
    weights_only=False  # ← add this
)

print(f"✓ Loaded | Classes: {ckpt['num_classes']}")

# Convert any numpy types to pure Python
def convert_numpy(obj):
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {convert_numpy(k): convert_numpy(v)
                for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy(i) for i in obj]
    return obj

print("Converting label maps...")
clean_remap   = convert_numpy(ckpt['label_remap'])
clean_reverse = convert_numpy(ckpt['reverse_remap'])

new_ckpt = {
    'model_state_dict': ckpt['model_state_dict'],
    'label_remap'     : clean_remap,
    'reverse_remap'   : clean_reverse,
    'num_classes'     : int(ckpt['num_classes']),
    'metrics'         : convert_numpy(
                            ckpt.get('metrics', {}))
}

torch.save(new_ckpt, "models/fusion_model_clean.pt")
print("✓ Clean model saved: fusion_model_clean.pt")

# Verify
test = torch.load(
    "models/fusion_model_clean.pt",
    map_location="cpu",
    weights_only=False
)
print(f"✓ Verified | Classes: {test['num_classes']}")
print(f"  label_remap sample : {list(test['label_remap'].items())[:2]}")
print(f"  key type : {type(list(test['label_remap'].keys())[0])}")
print("\n✓ Ready to upload to HuggingFace!")