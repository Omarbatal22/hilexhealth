# Model Evaluation Report - Triage Urgency Predictor

This report evaluates and compares three machine learning classifiers built for the clinical triage symptom engine.

## Evaluation Metrics Summary

| Classifier | Accuracy | Weighted Precision | Weighted Recall | Weighted F1-Score | ROC-AUC (OVR) | Critical Recall (High & Critical) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | 0.8820 | 0.9047 | 0.8820 | 0.8873 | 0.9809 | 0.9383 |
| **Random Forest** | 0.9780 | 0.9781 | 0.9780 | 0.9777 | 0.9991 | 0.8854 |
| **XGBoost** | 0.9940 | 0.9940 | 0.9940 | 0.9940 | 1.0000 | 0.9815 |

### Selection Decision
- **Chosen Model**: `XGBoost`
- **Reasoning**: Maximizes sensitivity and **Critical Recall** (Recall rate for High/Critical risk clinical cases) which is the most critical medical safety requirement for this triage application.

## Best Candidate Confusion Matrix Highlights (Evaluation Set)
- High Severity Recall: 98.15%
- Zero-false-negative rate targeted for Critical cases.

## ONNX Export Specifications
- Model Input: `float_input` (1x14 vector of patient symptoms and scaled vitals)
- Model Outputs: `label` (predicted class: 0 to 3) and `probabilities` (dictionary/sequence of class probabilities)
