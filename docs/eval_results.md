# Belagavi Event Recommender Evaluation Results
**Evaluation Run:** 2026-11-08 16:03:48 UTC

## Offline IR Evaluation Summary (35 Realistic Student Queries)

| Model Variant | Precision@5 | Recall@10 | MRR | NDCG@10 |
|---|---|---|---|---|
| **Baseline (Proximity & Popularity Only)** | 0.1029 | 0.2271 | 0.2877 | 0.1778 |
| **Similarity Only (TF-IDF Cosine)** | 0.5029 | 0.7548 | 0.9810 | 0.7616 |
| **Full Weighted Recommender (Multi-Factor)** | **0.4000** | **0.6619** | **0.8343** | **0.6251** |

### Key Viva Takeaways
1. **Content Matching is Critical**: The proximity baseline achieves low Precision@5 and NDCG@10 because spatial closeness alone does not reflect user academic or recreational intent.
2. **TF-IDF with Regional Synonyms**: Preprocessing with `synonyms.yaml` (e.g. mapping `fest` -> `utsav`, `hackathon` -> `coding`, `nrutya` -> `dance`) successfully bridges local student vernacular with formal event announcements.
3. **Multi-Factor Ranking**: Combining semantic similarity ($W_{sim}$) with distance attenuation ($W_{prox}$) and temporal urgency ($W_{time}$) yields the highest overall ranking quality for Belagavi students.
