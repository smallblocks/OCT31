import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { bridgePort, dataMountpoint, gatewayPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  /**
   * ======================== Setup ========================
   *
   * Load the wrapper-managed gateway token. Generated on install
   * (see init/seedFiles.ts), persisted in store.json on the main volume.
   */
  console.info(i18n('Starting OpenClaw gateway...'))

  const { gatewayToken } = (await storeJson.read().const(effects)) ?? {}
  if (!gatewayToken) {
    throw new Error(
      'OpenClaw gateway token missing from store.json. ' +
        'Run the "Regenerate Gateway Token" action and then restart the service.',
    )
  }

  /**
   * ======================== Daemon ========================
   *
   * StartOS routes incoming traffic through an internal reverse proxy on
   * the 10.0.0.0/8 private range. We pre-seed openclaw.json with
   * gateway.trustedProxies covering that range plus loopback, so OpenClaw
   * accepts WebSocket upgrades from the StartOS proxy. Without this,
   * OpenClaw rejects connections with "Proxy headers detected from
   * untrusted address" and returns code 4008.
   *
   * The config file is written via a small inline shell wrapper because
   * SDK 1.3.2 doesn't currently expose a clean way to write arbitrary
   * files into the subcontainer rootfs at startup time. We write through
   * the volume mount instead.
   */
  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: await sdk.SubContainer.of(
      effects,
      { imageId: 'main' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'main',
        subpath: null,
        mountpoint: dataMountpoint,
        readonly: false,
      }),
      'openclaw-sub',
    ),
    exec: {
      // Inline bootstrap: ensure openclaw.json exists with the right
      // proxy + auth config before exec'ing the gateway. This runs every
      // start, but only WRITES the file if it doesn't already exist —
      // user edits (channel credentials, model API keys, etc.) survive.
      command: [
        'sh',
        '-c',
        [
          'CONFIG="$OPENCLAW_CONFIG_PATH"',
          'if [ ! -f "$CONFIG" ]; then',
          '  echo "[wrapper] writing initial openclaw.json"',
          '  mkdir -p "$(dirname "$CONFIG")"',
          '  cat > "$CONFIG" <<EOF',
          '{',
          '  "gateway": {',
          '    "mode": "local",',
          '    "port": ' + String(gatewayPort) + ',',
          '    "bind": "lan",',
          '    "auth": {',
          '      "mode": "token",',
          '      "token": "' + gatewayToken + '"',
          '    },',
          '    "trustedProxies": ["127.0.0.1", "::1", "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]',
          '  }',
          '}',
          'EOF',
          'fi',
          'exec node /
