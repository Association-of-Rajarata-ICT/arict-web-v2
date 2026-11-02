# Contributing to ARICT

Thank you for helping improve the ARICT website. Contributions should support ARICT's goal of helping students learn, collaborate, build useful technology, and participate in the community.

## Before you start

1. Read the [Code of Conduct](CODE_OF_CONDUCT.md).
2. Search existing issues and pull requests before opening a new one.
3. For security concerns, follow the [Security Policy](SECURITY.md) instead of opening a public issue.
4. For substantial changes, open an issue first so the approach can be discussed.

## Development

The application uses Next.js, TypeScript, Tailwind CSS, Drizzle ORM, and PostgreSQL. See the [README](README.md) for setup instructions and environment variables.

Before submitting a pull request, run the checks relevant to your change:

```bash
npm run lint
npm run typecheck
npm test
```

Do not commit secrets, local environment files, generated uploads, or production data. Keep changes focused, preserve existing accessibility and responsive behaviour, and update directly related documentation.

## Pull requests

Pull requests should:

- Explain the problem and the solution.
- Include testing steps and the results.
- Include screenshots or recordings for visual changes.
- Mention migrations, environment-variable changes, or deployment considerations.
- Keep unrelated refactors out of the change.

Maintainers may request changes before merging. By contributing, you agree that your contribution can be used under this repository's license.
