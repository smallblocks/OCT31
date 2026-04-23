import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'openclaw',
  title: 'OpenClaw',
  license: 'MIT',
  packageRepo: 'https://github.com/openclaw/openclaw-startos',
  upstreamRepo: 'https://github.com/openclaw/openclaw',
  marketingUrl: 'https://openclaw.ai',
  donationUrl: null,
  docsUrls: ['https://docs.openclaw.ai'],
  description: { short, long },
  volumes: ['main'],
  images: {
    main: {
      source: {
        dockerBuild: {
          // Build context = upstream OpenClaw repo (added as a git submodule
          // at ./openclaw). Uses the upstream's own multi-stage Dockerfile
          // so we get the same artifacts the OpenClaw team ships.
          workdir: './openclaw',
          dockerfile: './openclaw/Dockerfile',
        },
      },
      // OpenClaw upstream pins node:24-bookworm digests for both x86_64 and
      // aarch64 multi-arch manifests. riscv64 isn't supported upstream.
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
