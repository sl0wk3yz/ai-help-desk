# BrightPath Learn Help Desk

A tiny help desk for the fictional BrightPath Learn platform. It answers from the three supplied sample guides, shows which guide supports the answer, and abstains when it cannot find a relevant passage. There is a Python CLI and an optional static web page.

## CLI

Requires Python 3.9 or newer. No packages to install.

```sh
python helpdesk.py "How many lessons are in Foundations?"
```

Set `OPENAI_API_KEY` before asking questions that match a guide. The key is read from the environment and is never written into the project. The model defaults to `gpt-4o-mini`; set `OPENAI_MODEL` to use another Responses API model.

PowerShell:

```powershell
$env:OPENAI_API_KEY = "your-key"
python .\helpdesk.py "When is group coaching?"
```

macOS/Linux:

```sh
export OPENAI_API_KEY="your-key"
python3 helpdesk.py "When is group coaching?"
```

Try a question the documents do not answer:

```sh
python helpdesk.py "What is the tuition price?"
```

Pricing, refund, and job placement questions get the sample guide's explicit direction to contact support without calling the model. A different question with no relevant passage returns an abstention without calling the model. For a clearly labelled, deterministic offline example (not a real model response), add `--mock`.

To reproduce an unavailable model without making a network request:

```sh
python helpdesk.py "When is group coaching?" --mock-failure
```

The CLI prints a clear error and exits with a non-zero status for API failures. The sample scenarios and their limitations are in [DEMO-RESULTS.md](DEMO-RESULTS.md).

## Optional browser demo

The root `index.html` is a minimal terminal-style static page, suitable for GitHub Pages. Press Enter to ask; `/help` and `/clear` are local commands. The API key stays on the API host; `config.js` contains only the public endpoint URL.

1. Push this folder to a GitHub repository. In **Settings → Pages**, choose **Deploy from a branch**, then select your publishing branch and `/(root)`.
2. Import the same repository into Vercel. It detects the Node.js function at `api/ask.js`.
3. In the Vercel project's Environment Variables, set `OPENAI_API_KEY` and (recommended) `ALLOWED_ORIGIN` to the GitHub Pages origin, for example `https://your-user.github.io`. For a custom Pages domain, use that exact origin. Optionally set `OPENAI_MODEL`.
4. Deploy the Vercel project and copy its deployment origin, such as `https://your-project.vercel.app`.
5. Replace the placeholder in `config.js` with `https://your-project.vercel.app/api/ask`, commit, and push. GitHub Pages republishes the page. `ALLOWED_ORIGIN` is the origin only, with no path or trailing slash.

The app sends the question to `/api/ask`; the server selects relevant sample documents, calls the OpenAI Responses API, and returns the answer and source labels. The model key must only be configured in Vercel's server-side environment variables. Never put it in `config.js`, HTML, or browser JavaScript.

The API endpoint is public. `ALLOWED_ORIGIN` limits which browser origins can read responses, but it does not block direct HTTP requests. Before sharing the demo publicly, set provider usage limits and use host-side rate limiting to reduce abuse and unexpected API usage.

To demonstrate the server-side failure response, set `HELPDESK_FORCE_FAILURE=1` in Vercel and redeploy; matching questions receive HTTP 503 with a clear message. Remove the variable and redeploy to restore normal answers. The CLI supports its own local `--mock-failure` switch.

## Scope and limitations

- The fictional source guides are in `documents/` and included as source text in the serverless function. Keep these copies in sync if you edit the sample content.
- Retrieval is deliberately small: keyword overlap plus a few common synonyms. It is not semantic search, and an unrelated question with coincidentally overlapping words could select a passage. For a production help desk, improve retrieval and add evaluation cases.
- The app does not authenticate users, store questions, or collect account details. It is a sample, not a production support channel.
- The browser page uses a backend because a key embedded in a public static website can be copied by anyone. GitHub Pages serves the frontend; Vercel runs the model call.

## Walkthrough

See [DEMO-RESULTS.md](DEMO-RESULTS.md) for the supported, unsupported, and simulated outage examples, and the limitation of the offline run.
