import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'openclaw',
  title: 'OpenClaw',
  license: 'MIT',
  packageRepo: 'https://github.com/smallblocks/OCT31',
  upstreamRepo: 'https://github.com/openclaw/openclaw',
  marketingUrl: 'https://openclaw.ai',
  donationUrl: null,
  docsUrls: ['https://docs.openclaw.ai'],
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      // Build from our own Dockerfile at the repo root. It installs OpenClaw
      // via the official install script on a clean node:22-bookworm-slim base
      // image — this avoids fighting the upstream Dockerfile's USER/HOME
      // decisions which don't work well inside StartOS's user namespace.
      source: {
        dockerBuild: {
          workdir: '.',
          dockerfile: './Dockerfile',
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  alerts: {
    install: null,
    update: null,
    uninstall: null,
    restore: null,
    start: null,
    stop: null,
  },
  dependencies: {},
})
