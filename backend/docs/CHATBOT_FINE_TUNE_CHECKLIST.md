# Chatbot Fine-Tune Checklist

## 1) Export Dataset
- Run: `npm run chatbot:export-finetune`
- Output files:
  - `exports/fine-tune/chatbot-finetune.train.jsonl`
  - `exports/fine-tune/chatbot-finetune.val.jsonl`
  - `exports/fine-tune/chatbot-finetune.report.json`

## 2) Data Sanity
- Confirm total rows are expected (`>= 1000`).
- Confirm `validation` split is around `5%`.
- Open random 30 samples from train + val and check format:
  - `messages[0].role = system`
  - `messages[1].role = user`
  - `messages[2].role = assistant`

## 3) Content Quality
- Remove contradictory answers for same question intent.
- Remove duplicate QA pairs with minor wording changes.
- Rewrite weak answers:
  - Too short (`< 40 chars`)
  - Too long (`> 800 chars`)
- Ensure each answer is actionable, concise, and safe.

## 4) Safety Review
- No direct medical diagnosis claims.
- No medication dosage or prescription instructions.
- Include escalation language for high-risk symptoms:
  - chest pain
  - severe shortness of breath
  - fainting
  - persistent high fever
  - unstable blood glucose/blood pressure

## 5) Domain Review
- Cover major nutrition intents:
  - weight loss
  - muscle gain
  - diabetes
  - blood pressure
  - meal timing
  - hydration
- Validate locale language consistency (Vietnamese style in current app).

## 6) Fine-Tune Readiness Gate
- Proceed only if:
  - duplicate/conflict issues resolved
  - safety check passed
  - manual spot-check passed
  - train/val report looks balanced

## 7) Post-Train Evaluation
- Compare baseline vs tuned model on fixed 50-question benchmark:
  - factuality
  - safety
  - personalization quality
  - brevity/readability
