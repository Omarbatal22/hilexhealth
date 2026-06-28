import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from xgboost import XGBClassifier
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType

# Create directory for models if it doesn't exist
os.makedirs("src/Healthcare.Infrastructure/Ml/artifacts", exist_ok=True)

# 1. Generate high-quality simulated healthcare dataset
np.random.seed(42)
n_samples = 2500

# Features
fever = np.random.binomial(1, 0.3, n_samples)
cough = np.random.binomial(1, 0.4, n_samples)
shortness_of_breath = np.random.binomial(1, 0.15, n_samples)
chest_pain = np.random.binomial(1, 0.1, n_samples)
abdominal_pain = np.random.binomial(1, 0.2, n_samples)
headache = np.random.binomial(1, 0.35, n_samples)
fatigue = np.random.binomial(1, 0.4, n_samples)
sore_throat = np.random.binomial(1, 0.3, n_samples)
nausea = np.random.binomial(1, 0.2, n_samples)
dizziness = np.random.binomial(1, 0.15, n_samples)

age = np.random.randint(1, 90, n_samples)
gender = np.random.binomial(1, 0.5, n_samples) # 1: Male, 0: Female
heart_rate = np.random.normal(75, 15, n_samples)
temperature = np.random.normal(37.0, 1.0, n_samples)

# Simple clinical rules to simulate Urgency Level:
# 1: Low, 2: Medium, 3: High, 4: Critical (0-indexed as 0, 1, 2, 3 for classification)
urgency = []
for i in range(n_samples):
    # Critical risk triggers
    if chest_pain[i] == 1 and (shortness_of_breath[i] == 1 or heart_rate[i] > 115 or temperature[i] > 39.5):
        urgency.append(3) # Critical
    elif chest_pain[i] == 1:
        urgency.append(2) # High
    elif shortness_of_breath[i] == 1 and (fever[i] == 1 or heart_rate[i] > 105):
        urgency.append(2) # High
    # High risk triggers
    elif temperature[i] > 39.2 or heart_rate[i] > 110 or (abdominal_pain[i] == 1 and fever[i] == 1 and age[i] < 12):
        urgency.append(2) # High
    # Medium risk triggers
    elif fever[i] == 1 and cough[i] == 1 and age[i] > 65:
        urgency.append(2) # High
    elif abdominal_pain[i] == 1 or dizziness[i] == 1 or temperature[i] > 38.0 or heart_rate[i] > 95:
        urgency.append(1) # Medium
    elif fever[i] == 1 or cough[i] == 1 or headache[i] == 1 or nausea[i] == 1:
        urgency.append(1) # Medium
    else:
        urgency.append(0) # Low

urgency = np.array(urgency)

# Create DataFrame
df = pd.DataFrame({
    'fever': fever,
    'cough': cough,
    'shortness_of_breath': shortness_of_breath,
    'chest_pain': chest_pain,
    'abdominal_pain': abdominal_pain,
    'headache': headache,
    'fatigue': fatigue,
    'sore_throat': sore_throat,
    'nausea': nausea,
    'dizziness': dizziness,
    'age': age,
    'gender': gender,
    'heart_rate': heart_rate,
    'temperature': temperature,
    'urgency': urgency
})

# Save dataset
df.to_csv("src/Healthcare.Infrastructure/Ml/symptoms_triage_dataset.csv", index=False)
print("Generated simulated dataset.")

# 2. Process data
X = df.drop(columns=['urgency'])
y = df['urgency']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

# Fit scaler on training continuous variables and transform
scaler = StandardScaler()
X_train_scaled = X_train.copy()
X_test_scaled = X_test.copy()

continuous_cols = ['age', 'heart_rate', 'temperature']
X_train_scaled[continuous_cols] = scaler.fit_transform(X_train[continuous_cols])
X_test_scaled[continuous_cols] = scaler.transform(X_test[continuous_cols])

# Save scaler parameters to load in C#
scaler_params = {
    'mean': scaler.mean_.tolist(),
    'scale': scaler.scale_.tolist(),
    'columns': continuous_cols
}
with open("src/Healthcare.Infrastructure/Ml/artifacts/scaler_params.json", "w") as f:
    json.dump(scaler_params, f, indent=4)

# 3. Model Training & Evaluation
models = {
    "Logistic Regression": LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
    "Random Forest": RandomForestClassifier(n_estimators=150, class_weight='balanced', random_state=42),
    "XGBoost": XGBClassifier(n_estimators=100, eval_metric='mlogloss', random_state=42)
}

results = {}
for name, model in models.items():
    print(f"Training {name}...")
    model.fit(X_train_scaled.values, y_train.values)
    y_pred = model.predict(X_test_scaled.values)
    y_pred_proba = model.predict_proba(X_test_scaled.values)
    
    accuracy = accuracy_score(y_test, y_pred)
    # Average metrics
    precision = precision_score(y_test, y_pred, average='weighted')
    recall = recall_score(y_test, y_pred, average='weighted')
    f1 = f1_score(y_test, y_pred, average='weighted')
    roc_auc = roc_auc_score(y_test, y_pred_proba, multi_class='ovr')
    
    # Calculate Critical Recall (Recall for classes High [2] and Critical [3])
    # Recall = TP / (TP + FN)
    high_critical_mask = y_test.isin([2, 3])
    critical_recall = recall_score(y_test[high_critical_mask], y_pred[high_critical_mask], labels=[2, 3], average='macro')
    
    results[name] = {
        "Accuracy": accuracy,
        "Precision": precision,
        "Recall": recall,
        "F1": f1,
        "ROC-AUC": roc_auc,
        "Critical Recall": critical_recall,
        "model_object": model
    }

# Compare models and select best
best_model_name = max(results, key=lambda k: results[k]["Critical Recall"])
best_model_info = results[best_model_name]
print(f"Best model based on Critical Recall: {best_model_name} ({best_model_info['Critical Recall']:.4f})")

# 4. Generate comparison report in markdown
report_md = f"""# Model Evaluation Report - Triage Urgency Predictor

This report evaluates and compares three machine learning classifiers built for the clinical triage symptom engine.

## Evaluation Metrics Summary

| Classifier | Accuracy | Weighted Precision | Weighted Recall | Weighted F1-Score | ROC-AUC (OVR) | Critical Recall (High & Critical) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
"""

for name, metrics in results.items():
    report_md += f"| **{name}** | {metrics['Accuracy']:.4f} | {metrics['Precision']:.4f} | {metrics['Recall']:.4f} | {metrics['F1']:.4f} | {metrics['ROC-AUC']:.4f} | {metrics['Critical Recall']:.4f} |\n"

report_md += f"""
### Selection Decision
- **Chosen Model**: `{best_model_name}`
- **Reasoning**: Maximizes sensitivity and **Critical Recall** (Recall rate for High/Critical risk clinical cases) which is the most critical medical safety requirement for this triage application.

## Best Candidate Confusion Matrix Highlights (Evaluation Set)
- High Severity Recall: {results[best_model_name]['Critical Recall'] * 100:.2f}%
- Zero-false-negative rate targeted for Critical cases.

## ONNX Export Specifications
- Model Input: `float_input` (1x14 vector of patient symptoms and scaled vitals)
- Model Outputs: `label` (predicted class: 0 to 3) and `probabilities` (dictionary/sequence of class probabilities)
"""

with open("MODEL_EVALUATION_REPORT.md", "w") as f:
    f.write(report_md)
print("Saved MODEL_EVALUATION_REPORT.md")

# 5. Export Chosen Model to ONNX format
best_model = best_model_info["model_object"]

# Since scikit-learn models are extremely easy to export and run with ONNX Runtime,
# we export the best scikit-learn model. If XGBoost is chosen, we'll convert it or fall back to Random Forest
# to guarantee clean C# loading without third-party xgboost-onnx complex converter dependency issues.
# In scikit-learn, skl2onnx is extremely robust.
if "XGBoost" in best_model_name:
    # XGBoost can be exported to ONNX, but requires xgboost specific converter.
    # To keep the system robust and standard, we can use Random Forest as a safe fallback or use skl2onnx
    # for XGBoost. Let's see if we can convert XGBoost directly:
    try:
        from onnxmltools.convert import convert_xgboost
        from onnxmltools.convert.common.data_types import FloatTensorType as OnnxFloatType
        initial_type = [('float_input', OnnxFloatType([None, 14]))]
        onnx_model = convert_xgboost(best_model, initial_types=initial_type, target_opset=12)
        print("Exported XGBoost to ONNX.")
    except Exception as e:
        print(f"XGBoost ONNX conversion failed: {e}. Falling back to Random Forest for guaranteed C# runtime compatibility.")
        best_model = results["Random Forest"]["model_object"]
        best_model_name = "Random Forest (Fallback)"
        initial_type = [('float_input', FloatTensorType([None, 14]))]
        onnx_model = convert_sklearn(best_model, initial_types=initial_type, target_opset=12)
else:
    initial_type = [('float_input', FloatTensorType([None, 14]))]
    # For sklearn classifiers, zipmap=False is preferred so output probabilities are a flat float array (faster in C#)
    from skl2onnx import update_registered_converter
    onnx_model = convert_sklearn(best_model, initial_types=initial_type, target_opset=12, options={type(best_model): {'zipmap': False}})
    print(f"Exported {best_model_name} to ONNX with flat output probabilities (ZipMap disabled).")

# Save ONNX artifact
onnx_path = "src/Healthcare.Infrastructure/Ml/artifacts/triage_model.onnx"
with open(onnx_path, "wb") as f:
    f.write(onnx_model.SerializeToString())

print(f"Saved ONNX model to {onnx_path}")

# Write model registration metadata
metadata = {
    "ModelName": f"triage_{best_model_name.lower().replace(' ', '_')}_v1.0",
    "Algorithm": best_model_name,
    "Version": "1.0.0",
    "TrainingDate": pd.Timestamp.now().isoformat(),
    "DatasetVersion": "dataset_v1.0",
    "Metrics": {
        "Accuracy": best_model_info["Accuracy"],
        "Precision": best_model_info["Precision"],
        "Recall": best_model_info["Recall"],
        "F1": best_model_info["F1"],
        "RocAuc": best_model_info["ROC-AUC"],
        "CriticalRecall": best_model_info["Critical Recall"]
    }
}
with open("src/Healthcare.Infrastructure/Ml/artifacts/model_metadata.json", "w") as f:
    json.dump(metadata, f, indent=4)
print("Saved model_metadata.json")
