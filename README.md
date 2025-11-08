# VLTech NocoBase Plugins

A collection of custom plugins for [NocoBase](https://www.nocobase.com/), an open-source no-code development platform.

## About

This repository is a monorepo that contains various plugins developed by VLTech to extend NocoBase functionality. Each plugin is designed to add specific features and capabilities to your NocoBase applications.

## Available Plugins

### [@vltech/nocobase-plugin-workflow-duplicate-record](./packages/plugins/@vltech/nocobase-plugin-workflow-duplicate-record)

A workflow instruction plugin that enables duplication of records within NocoBase workflows. Features include:
- Duplicate records from any collection
- Override specific field values

[View plugin documentation →](./packages/plugins/@vltech/nocobase-plugin-workflow-duplicate-record/README.md)

## Development Setup

### Prerequisites

- Node.js >= 18
- Yarn package manager
- Docker and docker-compose

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vltech-nocobase-plugins
```

2. Install dependencies:
```bash
yarn install
```

3. Configure your environment:
```bash
cp .env.example .env
```

Edit `.env` to configure your database connection and other settings.

### Available Scripts

The following npm scripts are available for development:

| Script | Description |
|--------|-------------|
| `yarn dev` | Start NocoBase in development mode with hot reload |
| `yarn start` | Start NocoBase in production mode |
| `yarn build` | Build all plugins and the NocoBase application |
| `yarn test` | Run unit tests |
| `yarn e2e` | Run end-to-end tests |
| `yarn clean` | Clean build artifacts and caches |
| `yarn lint` | Run ESLint on the codebase |
| `yarn pm` | Plugin manager CLI |
| `yarn pm2` | Plugin manager v2 CLI |

### Development Workflow

#### Creating a New Plugin

1. Create a new plugin directory under `packages/plugins/@vltech/`:
```bash
mkdir -p packages/plugins/@vltech/nocobase-plugin-your-plugin-name
```

2. Initialize the plugin with a `package.json`:
```json
{
  "name": "@vltech/nocobase-plugin-your-plugin-name",
  "version": "0.1.0",
  "main": "dist/server/index.js",
  "peerDependencies": {
    "@nocobase/client": "1.x",
    "@nocobase/server": "1.x"
  }
}
```

3. Create the plugin structure:
```
packages/plugins/@vltech/nocobase-plugin-your-plugin-name/
├── package.json
├── README.md
├── src/
│   ├── index.ts
│   ├── client/
│   │   └── index.ts
│   └── server/
│       ├── index.ts
│       └── plugin.ts
```

4. The plugin will be automatically discovered by the workspace configuration.

#### Running in Development Mode

```bash
yarn dev
```

This starts the NocoBase development server with hot reload enabled. Any changes to your plugins will be automatically recompiled.

#### Building Plugins

```bash
yarn build
```

This compiles all plugins and the main application for production use.

#### Testing Plugins

```bash
# Run unit tests
yarn test

# Run tests for a specific plugin
yarn test packages/plugins/@vltech/nocobase-plugin-workflow-duplicate-record
```

#### Managing Plugins

Use the plugin manager to enable/disable plugins:

```bash
# List all plugins
yarn pm list

# Enable a plugin
yarn pm enable @vltech/nocobase-plugin-workflow-duplicate-record

# Disable a plugin
yarn pm disable @vltech/nocobase-plugin-workflow-duplicate-record
```

### Project Structure

```
vltech-nocobase-plugins/
├── packages/
│   └── plugins/
│       └── @vltech/              # VLTech-specific plugins
│           ├── nocobase-plugin-workflow-duplicate-record/
│           └── ...                # Future plugins
├── local/                         # Local data and uploads (git-ignored)
├── storage/                       # Application storage and data
├── node_modules/                  # Dependencies
├── .env                           # Environment configuration
├── package.json                   # Root package configuration
├── tsconfig.json                  # TypeScript configuration
└── yarn.lock                      # Dependency lock file
```

### Environment Configuration

Key environment variables in `.env`:

```bash
# Database configuration
DB_DIALECT=postgres              # postgres, mysql, mariadb, or sqlite
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=nocobase
DB_USER=your_user
DB_PASSWORD=your_password

# Application
APP_PORT=13000                   # Development server port
APP_ENV=development              # development or production

# API keys and secrets
APP_KEY=your-secret-key          # Secret key for encryption
API_BASE_URL=http://localhost:13000
```

### Publishing

This repository uses [semantic-release](https://semantic-release.gitbook.io/) with [@rimac-technology/semantic-release-monorepo](https://www.npmjs.com/package/@rimac-technology/semantic-release-monorepo) for automated versioning and publishing.

#### How It Works

- Packages are **automatically published to npm** when changes are pushed to the `main` branch
- Each package has **independent versioning** based on its own commit history
- **Only packages with relevant changes are published** - semantic-release analyzes commits that modify files in each package directory
- Version numbers are determined by [Conventional Commits](https://www.conventionalcommits.org/)
- CHANGELOG.md files are automatically generated

**Example:** If you modify only files in `packages/plugins/@vltech/nocobase-plugin-workflow-duplicate-record/`, only that package will be published. Other packages remain unchanged.

#### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types that trigger releases:**

- `feat:` - A new feature (triggers a **minor** version bump, e.g., 1.0.0 → 1.1.0)
- `fix:` - A bug fix (triggers a **patch** version bump, e.g., 1.0.0 → 1.0.1)
- `perf:` - Performance improvement (triggers a **patch** version bump)

**Breaking changes:**

- Add `BREAKING CHANGE:` in the commit footer or use `!` after the type (triggers a **major** version bump, e.g., 1.0.0 → 2.0.0)

**Types that do NOT trigger releases:**

- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `ci:` - CI/CD changes

**Examples:**

```bash
# Triggers a patch release (1.0.0 → 1.0.1)
git commit -m "fix(duplicate-record): handle null values in field overrides"

# Triggers a minor release (1.0.0 → 1.1.0)
git commit -m "feat(duplicate-record): add support for deep cloning relations"

# Triggers a major release (1.0.0 → 2.0.0)
git commit -m "feat(duplicate-record)!: change API to use async handlers

BREAKING CHANGE: The duplicate() method is now async and returns a Promise"

# No release triggered
git commit -m "docs(duplicate-record): update README with examples"
```

#### Scope

Use the package name (without the full prefix) as the scope:

- `duplicate-record` for `@vltech/nocobase-plugin-workflow-duplicate-record`
- `your-plugin` for future plugins

**Note:** The scope is primarily for **readability and organization** of commits. Semantic-release determines which packages to publish based on the **files modified** in the commit, not the scope. However, using consistent scopes makes the commit history much clearer.

#### Setup for Publishing

Before the automated publishing can work, you need to:

1. **Add NPM_TOKEN secret** to your GitHub repository:
   - Generate an npm access token with publish permissions
   - Add it as a secret named `NPM_TOKEN` in GitHub repository settings
   - For trusted publishing, configure the npm package with GitHub OIDC

2. **Ensure GitHub Actions has write permissions**:
   - Go to repository Settings → Actions → General
   - Under "Workflow permissions", select "Read and write permissions"

### Contributing

When developing plugins for this repository:

1. Follow the existing code structure and conventions
2. Write comprehensive tests for new features
3. Update plugin README files with usage examples
4. Use TypeScript for type safety
5. Follow NocoBase plugin development guidelines
6. **Use Conventional Commits** for all commit messages (see Publishing section above)
7. Test your plugin thoroughly before committing

### Resources

- [NocoBase Documentation](https://docs.nocobase.com/)
- [NocoBase Plugin Development Guide](https://docs.nocobase.com/development)
- [NocoBase API Reference](https://docs.nocobase.com/api)
- [NocoBase GitHub Repository](https://github.com/nocobase/nocobase)

## License

See individual plugin directories for license information.

## Support

For issues or questions related to these plugins, please open an issue in this repository.
