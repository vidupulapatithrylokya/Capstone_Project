# Contributing to ExplainAI

Thank you for contributing to ExplainAI! Please follow these guidelines for git workflow, testing, and security.

## Git Workflow Strategy
1. **Branch Naming**:
   - `feature/feature-name` for new capabilities
   - `bugfix/issue-description` for bug fixes
   - `refactor/component-name` for code improvements
2. **Pull Requests**:
   - All PRs must pass unit tests (`npm test`) and AI evaluation tests (`npm run eval:ai`).
   - Do not commit secrets, API keys, or `.env` files.

## Environment Variables
- Copy `.env.example` to `.env` before running locally.
- Keep production secrets stored securely in secret managers.

## Running Tests
```bash
# Run Unit and Integration Tests
cd server && npm test

# Run AI Evaluation Suite
cd server && npm run eval:ai
```
