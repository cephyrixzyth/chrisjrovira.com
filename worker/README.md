# Practice coach

The public guide searches its reviewed library within the visitor’s browser. Type-in questions stay in its sandboxed document. Users may explicitly request optional AI selection when the portfolio operator configures the coach endpoint.

The Worker accepts two catalog choices at POST /api/coach. It builds a model packet from the selected lesson and goal. The output contract allows three prewritten teaching moves. GET /api/health reports the contract version. The retired /api/chat returns 410 before reading the body. The new global quota stores a date and count. Existing Durable Object state from the older release has a separate instance name.

Edit the public root assistant-knowledge.json to publish anonymous methods and invented cases. Review every sentence and reference. After the editorial review, print the new fingerprint with `python3 worker/practice-source/build_guide.py --fingerprint` and record it in `worker/practice-source/reviewed-library.sha256`. Run `python3 worker/practice-source/build_guide.py` at the repository root to regenerate the standalone reader, host bridge and five-field model library, then run the handoff’s Worker and browser tests. Run the build with `--check` to detect drift. Commit the corpus and generated files together. Both the JSON and built HTML are publicly readable.

Leave the optional endpoint empty for offline operation. If enabling it, use the deployed HTTPS /api/coach URL in assistant-config.js after verifying the new Worker contract. The host sends only a topic ID and one of three practice goals when the visitor chooses that action.
