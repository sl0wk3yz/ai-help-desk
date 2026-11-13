# Demo runs

These reproducible CLI examples were run without a model API key. The supported question uses `--mock`, a deterministic offline fixture; it demonstrates the source display, but does not claim to measure real model answer quality. The unsupported billing question uses a deterministic statement directly from the supplied guide. Remove `--mock` and set `OPENAI_API_KEY` to try the supported question with the live model.

## 1. Supported question

Command:

```sh
python helpdesk.py "How many lessons are in Foundations?" --mock
```

Output:

```text
The Foundations course has 6 lessons. You can watch them in any order.

Sources: Document 1 — Getting started
Mode: offline mock
```

## 2. Information the guides do not provide

Command:

```sh
python helpdesk.py "What is the tuition price?"
```

Output:

```text
That information is not available in the supplied documents. Please contact support.

Sources: Document 3 — Account help
Mode: documented limitation
```

An unrelated question with no matching passage returns an abstention and no source labels.

## 3. Simulated model failure

Command:

```sh
python helpdesk.py "When is group coaching?" --mock-failure
```

Output (exit status 1):

```text
Error: Simulated model outage (--mock-failure).
```

## What I would improve

Replace keyword matching with a small semantic retrieval index and add automated evaluation questions for paraphrases and near-matches. The current offline fixture validates the flow, not the quality of a live model response.
