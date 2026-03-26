# tstack-agents

Install and update [T-Stack](https://github.com/Halfbyte-Media/t-stack) — a multi-agent development team framework for VS Code Copilot.

## Quick Start

### Install T-Stack into your project

```bash
npx tstack-agents init
```

After install, open VS Code and run `/setup` in Copilot Chat to complete initialization.

### Update T-Stack

```bash
npx tstack-agents update
```

After update, run `/update` in VS Code Copilot Chat to apply migrations.

## Commands

| Command   | Description                                          |
|-----------|------------------------------------------------------|
| `init`    | Install T-Stack into the current directory           |
| `update`  | Update framework files (preserves your project data) |
| `version` | Show the CLI version                                 |

## Options

| Option      | Applies to | Description                              |
|-------------|------------|------------------------------------------|
| `--help`    | All        | Show help message                        |
| `--version` | All        | Show the CLI version                     |
| `--force`   | `init`     | Overwrite an existing installation       |
| `--dry-run` | `update`   | Show what would change without writing   |

## Documentation

See the [T-Stack repository](https://github.com/Halfbyte-Media/t-stack) for full documentation.
