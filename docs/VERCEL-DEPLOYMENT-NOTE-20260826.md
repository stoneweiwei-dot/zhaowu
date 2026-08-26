# Vercel deployment policy note — 2026-08-26

Production deploys are explicit. Git auto-deployments remain disabled in `vercel.json` to avoid exhausting the Hobby deployment quota. The deployment regression test must therefore assert `git.deploymentEnabled === false` rather than expecting `main` auto-deploy to be enabled.

This note exists only to document the current deployment contract; it does not change runtime behavior.
