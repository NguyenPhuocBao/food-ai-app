# Chatbot Train-All Pipeline

## Quick Start
- Run default pipeline (target `30000` examples):
  - `npm run chatbot:train:all`

## Useful Options
- Custom target size:
  - `npm run chatbot:train:all -- --target=50000`
- Custom split:
  - `npm run chatbot:train:all -- --val-ratio=0.1 --test-ratio=0.05`
- Custom output folder:
  - `npm run chatbot:train:all -- --out-dir=exports/fine-tune-all-v2`
- Sync generated dataset back to DB (for retrieval mode):
  - `npm run chatbot:train:all -- --target=20000 --sync-db --sync-limit=5000`

## Generated Files
- `chatbot-all.train.jsonl`
- `chatbot-all.val.jsonl`
- `chatbot-all.test.jsonl`
- `chatbot-all.raw.json`
- `chatbot-all.report.json`

All files are written to `backend/exports/fine-tune-all` by default.

## Start Fine-Tune Job (Optional)
- OpenAI:
  - `npm run chatbot:finetune:openai -- --model=gpt-4o-mini-2024-07-18`
- xAI (API-compatible path):
  - `npm run chatbot:finetune:xai -- --model=grok-4.20-beta-latest-non-reasoning`

Optional parameters for both:
- `--train=exports/fine-tune-all/chatbot-all.train.jsonl`
- `--val=exports/fine-tune-all/chatbot-all.val.jsonl`
- `--suffix=food-ai-health-v1`

## Notes
- Data source priority:
  1. `system_settings.chatbot_training_examples` (custom)
  2. default training dataset in code
- The script expands QA pairs with deterministic paraphrase patterns and writes fine-tune-ready JSONL (`messages` format).
- If you enable `--sync-db`, keep `sync-limit` reasonable to avoid retrieval latency increase in runtime chat.
