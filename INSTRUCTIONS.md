# Getting this onto GitHub

Quick path from this zip to a `.s9pk` you can sideload on StartOS 0.4.0.

## 1. Create the GitHub repo

1. Create a new empty repo on GitHub. Suggested name: `openclaw-startos`. Public or private — both work.
2. **Don't** initialize it with a README, `.gitignore`, or license (the zip already has those).
3. Copy the clone URL. For the rest of these instructions, we'll call it `<YOUR_REPO_URL>` (e.g. `git@github.com:yourname/openclaw-startos.git`).

## 2. Push this code to it

Unzip this archive, then from inside the unzipped `openclaw-startos/` directory:

```sh
git init
git add .
git commit -m "Initial commit: OpenClaw StartOS wrapper"

# Add the OpenClaw upstream as a git submodule. This is required —
# the build process expects ./openclaw/ to contain the upstream repo.
git submodule add https://github.com/openclaw/openclaw.git openclaw

git add .gitmodules openclaw
git commit -m "Add OpenClaw upstream as submodule"

git branch -M main
git remote add origin <YOUR_REPO_URL>
git push -u origin main
```

## 3. Watch the build

The GitHub Actions workflow at `.github/workflows/build.yml` runs automatically on push.

1. Open the **Actions** tab on your repo.
2. Click the most recent **Build s9pk** run.
3. Wait ~30 minutes. Two parallel jobs build `x86_64` (faster, ~10–15 min) and `aarch64` (slower, ~25–30 min — it builds under QEMU emulation on the x86 GitHub runner).
4. When complete, scroll to the bottom of the run summary. Under **Artifacts** you'll see `openclaw-x86_64.s9pk` and `openclaw-aarch64.s9pk`. Download the one matching your StartOS server's architecture.

## 4. Sideload

1. On StartOS, open the **System → Sideload a Service** page.
2. Drag the `.s9pk` file into the upload area.
3. Click **Install**.
4. Start the service.
5. Run the **Show Gateway Token** action to get your auth token.
6. Open the **Control UI** interface and paste the token to log in.

## Optional: tag a release for a downloadable `.s9pk`

If you want a permanent, linkable download instead of a workflow artifact (which expires after 30 days):

```sh
git tag v2026.4.23
git push --tags
```

The workflow detects the tag and publishes a GitHub Release with both `.s9pk` files attached. Find it under the **Releases** section of your repo.

## What's in this zip

```
openclaw-startos/
├── .github/workflows/build.yml    ← GitHub Actions: builds both arches, attaches to releases
├── .gitmodules                    ← references the OpenClaw upstream submodule
├── Makefile, s9pk.mk              ← build orchestration
├── package.json, tsconfig.json    ← TypeScript wrapper code build
├── icon.svg, LICENSE, README.md
└── startos/                       ← the actual StartOS package logic
    ├── manifest/                  ← package metadata, dockerBuild source
    ├── main.ts                    ← daemon definition (port, env, healthcheck)
    ├── interfaces.ts              ← exposes Control UI (18789) + Bridge (18790)
    ├── actions/                   ← "Show / Regenerate Gateway Token" UI actions
    ├── init/, backups.ts, ...     ← lifecycle plumbing
    └── fileModels/store.json.ts   ← persists the auto-generated gateway token
```

The actual OpenClaw source code is **not** included — it's pulled at build time via the git submodule. That keeps this wrapper lean (~60 KB) and means upgrading OpenClaw is just a `git submodule update` away.

Full documentation is in `README.md`.
