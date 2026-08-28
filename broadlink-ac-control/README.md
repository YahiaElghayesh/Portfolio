# Sharp AC Control — Broadlink RM4 Mini

A small local web app for controlling a Sharp air conditioner through a
Broadlink RM4 Mini universal IR remote. Learn IR commands straight from your
existing Sharp remote, then trigger them from a browser.

## Why this runs locally (and how to still use it from anywhere)

Broadlink devices are controlled over a local UDP/TCP protocol on your home
network. There's no public, documented API for Broadlink's cloud/"control
from anywhere" feature — it's proprietary to their own app. The
[`broadlink`](https://github.com/mjg59/python-broadlink) Python library this
app uses (the same one Home Assistant's Broadlink integration is built on)
only talks to devices locally, for exactly that reason.

So:

- **This app must run on a machine on the same network as the RM4 Mini** —
  your laptop, a home server, or (recommended for 24/7 use) a Raspberry Pi.
- **To control it from outside your home**, don't chase Broadlink's cloud —
  put a VPN between your phone and your home network instead. The easiest
  option is [Tailscale](https://tailscale.com) (free for personal use):
  1. Install Tailscale on the machine running this app (e.g. the Pi) and on
     your phone/laptop, and sign in to the same Tailscale account on both.
  2. Note the Tailscale IP (or MagicDNS name) assigned to the machine
     running this app, e.g. `100.x.y.z`.
  3. From anywhere in the world, open `http://100.x.y.z:8090` — Tailscale
     tunnels the connection back to your home network, encrypted, without
     any port forwarding or public exposure.

This gives you the same "control it from anywhere" result as the Broadlink
app, without depending on an undocumented API or storing your Broadlink
account credentials anywhere.

## Before you start: local vs. cloud pairing

If your RM4 Mini was originally set up through the official Broadlink app
and it auto-connected to Broadlink's cloud, some units stop responding to
local-only tools like this one. If discovery/connect below doesn't find
your device:

1. Factory reset the RM4 Mini (hold the reset button, usually ~6s, until the
   LED blinks rapidly).
2. Re-pair it to your Wi-Fi using the Broadlink app (this app doesn't do
   Wi-Fi provisioning — it only talks to a device already on your network).
3. Try "Scan network" again here.

## Setup

```bash
cd broadlink-ac-control
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
```

Open `http://localhost:8090` on a device on the same network as the RM4
Mini (or via Tailscale, from anywhere — see above).

## Using it

1. **Connect to the device** — click "Scan network" and pick your RM4 Mini
   from the list, or type its IP directly if broadcast discovery doesn't
   find it (common on routers with AP/client isolation).
2. **Learn a command** — type a name (e.g. `Cool 24 Auto`, `Power Off`,
   `Heat 22`), click "Start learning", then point your physical Sharp
   remote at the RM4 Mini and press the matching button within 20 seconds.
   Most AC remotes send the *entire* state (power, mode, temp, fan speed)
   in every button press, so learn one named command per exact
   setting/button you want to be able to trigger — there's no need to
   decode Sharp's IR protocol, the RM4 just replays exactly what it
   recorded.
3. **Send commands** — saved commands appear as buttons; click one to fire
   it at the AC.

Commands are stored in `data/codes.json` (gitignored — it's specific to
your remote). `data/codes.example.json` shows the shape of that file.

## API

| Method | Path                | Description                              |
|--------|----------------------|-------------------------------------------|
| GET    | `/api/status`         | Currently connected device, if any        |
| POST   | `/api/discover`       | Broadcast-scan the LAN for Broadlink devices |
| POST   | `/api/connect`        | Connect by discovered device or manual IP |
| POST   | `/api/learn/start`    | Put the RM4 into IR learning mode         |
| GET    | `/api/learn/check`    | Poll for a captured IR code               |
| GET    | `/api/codes`          | List saved named commands                 |
| POST   | `/api/codes`          | Save a named command (`{name, code}`)     |
| DELETE | `/api/codes/<name>`   | Remove a saved command                    |
| POST   | `/api/send/<name>`    | Send a saved command to the AC            |

## Notes

- This was built and reviewed against the documented `broadlink` Python
  library's behavior, but hasn't been tested against a real RM4 Mini or
  Sharp AC in this environment — I don't have network access to your home
  LAN from here. Please try it end-to-end and report anything that doesn't
  behave as expected.
- No authentication is built in — fine on a private home LAN or a private
  Tailscale network, but don't port-forward this app to the public internet.
