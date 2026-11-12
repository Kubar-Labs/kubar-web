# Kickoff prompt for Claude Code

This folder is already on the branch `rebuild-2026` (added 13 Nov 2026). Check out that branch, start Claude Code in the repo with the Figma MCP connected, and paste this:

---

We're rebuilding kubar.tech in this repo from a signed-off design. Everything you need is in docs/rebuild/: read HANDOFF.md first and in full, then tokens/README.md and components.md. The words for every page are in docs/rebuild/copy/ and are signed off: use them exactly and flag anything that doesn't fit rather than rewriting it.

Work on the branch rebuild-2026. Commit and push the branch as you go. Don't merge to main, don't deploy, and don't change anything in Cloudflare.

The design is in Figma (file pFO3DEpqVzWCJdPghuq8nU); node IDs for every page frame and component are in HANDOFF.md and components.md. Build only what's visible in the frames. Home at 1440 (node 160:6) is the reference page.

Before writing code, read the Next.js guides in node_modules/next/dist/docs/ as AGENTS.md asks, then tell me your plan for step 1 of the build order (HANDOFF.md, section 12) and anything in the handoff you find unclear or contradictory. After each step, stop and show me screenshots at 1440, 768 and 390 before going on.
