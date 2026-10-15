# Cost Analysis & AI Token Economics

## 1. Unit Cost Breakdown per Multimedia Episode

For a typical 60-second episode with 4 scenes:

| Component | Provider / Tech | Unit Usage | Approx. Cost |
|---|---|---|---|
| Script Generation | OpenAI `gpt-4o-mini` | ~1,200 input tokens, ~800 output tokens | $0.0006 |
| Scene Images (4x) | OpenAI DALL-E 3 (Standard) | 4 images @ $0.040 | $0.1600 |
| Narration (TTS) | OpenAI TTS (`alloy` / `onyx`) | ~900 characters @ $0.015 / 1K chars | $0.0135 |
| Captions (VTT) | Algorithmic timing | Pure CPU / FFmpeg | $0.0000 |
| Video Assembly | Local / Container FFmpeg | ~15 sec CPU execution | ~$0.0020 |
| Cloud Storage | Cloudflare R2 / S3 | ~15 MB MP4 storage | < $0.0001 |
| **Total per Episode** | | | **~$0.176** |

With Flux Schnell or SDXL on Replicate ($0.003/image), the cost drops to **under $0.03 per episode**.

---

## 2. Tier Allowances & Cost Controls

1. **Free Tier**: Text-based daily episodes with rich storyboard previews. 1 complimentary multimedia video upon onboarding.
2. **Plus Tier**: 15 multimedia video episodes per month + unlimited audio narration.
3. **Pro Tier**: Daily multimedia video episodes (30/month) + custom avatar training & voice selection.
