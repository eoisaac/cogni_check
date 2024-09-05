# 🧠 Cogni Check

## Setup

### Automatic setup

To automatically setup the project, run the following command:

```bash
sh scripts/setup.sh
```

## Manual setup

1. Install the dependencies

```bash
pnpm install
```

2. Setup husky

```bash
pnpm prepare
```

3. Set executable permission for commit-msg

```bash
chmod +x .husky/commit-msg && chmod +x .husky/pre-commit
```

4. Configure the dotenv

4.1. Copy the `.env.example` file to `.env`

```bash
cp .env.example .env
```

4.2. Create the symbolic links for each app

- On Linux/MacOS

```bash
cd apps/<APP_DIR>; ln -s ../../.env .env; cd ../..
```

- On Windows

```bash
cd apps/<APP_DIR>; mklink .env ..\..\env; cd ../..
```

## Author

[Isaac Santiago](https://github.com/eoisaac)
