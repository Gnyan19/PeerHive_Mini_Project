import torch
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import DistilBertTokenizer, DistilBertForSequenceClassification

# --- Configuration ---
MODEL_NAME = 'distilbert-base-uncased'
NUM_LABELS = 3
MODEL_PATH = './models/distilbert_goemotions' # IMPORTANT: Path where your trained model is saved

# --- Initialize Flask App & CORS ---
app = Flask(__name__)
CORS(app) # Allow requests from your React app

# --- Load Model and Tokenizer ---
print("🔥 Loading DistilBERT model and tokenizer...")
try:
    tokenizer = DistilBertTokenizer.from_pretrained(MODEL_PATH)
    model = DistilBertForSequenceClassification.from_pretrained(MODEL_PATH)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)
    model.eval()
    print(f"✅ Model loaded successfully on device: {device}")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("👉 Make sure your fine-tuned model files are in the '{MODEL_PATH}' directory.")
    model = None

# --- API Endpoint ---
@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500

    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Tokenize and predict
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128).to(device)
    with torch.no_grad():
        logits = model(**inputs).logits
    
    probabilities = torch.nn.functional.softmax(logits, dim=1).cpu().numpy()[0]
    prediction_idx = int(torch.argmax(logits, dim=1).cpu().numpy()[0])
    
    zone_map = {0: 'Calm', 1: 'Stressed', 2: 'Overwhelmed'}
    predicted_zone = zone_map.get(prediction_idx, 'Unknown')

    response = {
        'predicted_zone': predicted_zone,
        'probabilities': {
            'Calm': float(probabilities[0]),
            'Stressed': float(probabilities[1]),
            'Overwhelmed': float(probabilities[2])
        }
    }
    return jsonify(response)

if __name__ == '__main__':
    # Before running, make sure to install dependencies:
    # pip install Flask Flask-Cors torch transformers
    app.run(port=5000, debug=True)
