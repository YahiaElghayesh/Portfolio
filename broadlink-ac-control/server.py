"""
Local web app for controlling a Sharp AC through a Broadlink RM4 Mini.

This must run on the SAME LAN as the RM4 Mini (e.g. a laptop, home server,
or Raspberry Pi at home) — it talks to the device over local UDP/TCP, which
only works on the same network segment. It cannot be hosted on the public
internet or a cloud service to reach a device sitting behind a home router.

The RM4 Mini itself must already be joined to your home Wi-Fi (done once
via the official Broadlink app during unboxing). This app does not do that
initial provisioning.
"""
import json
import time
from pathlib import Path

import broadlink
from broadlink.exceptions import ReadError, StorageError
from flask import Flask, jsonify, request, send_from_directory

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DEVICE_FILE = DATA_DIR / "device.json"
CODES_FILE = DATA_DIR / "codes.json"

DATA_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder="static", static_url_path="")

_device = None  # cached, authenticated broadlink device handle


def load_json(path, default):
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return default


def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def get_device():
    """Return a cached, authenticated device handle, reconnecting from
    saved host/mac if the process was restarted."""
    global _device
    if _device is not None:
        return _device

    saved = load_json(DEVICE_FILE, None)
    if not saved:
        return None

    dev = broadlink.gendevice(
        saved["devtype"],
        (saved["host"], 80),
        bytes.fromhex(saved["mac"]),
        name=saved.get("name", "RM4 Mini"),
    )
    dev.auth()
    _device = dev
    return _device


def set_device(dev):
    global _device
    _device = dev
    save_json(
        DEVICE_FILE,
        {
            "host": dev.host[0],
            "mac": dev.mac.hex(),
            "devtype": dev.devtype,
            "name": dev.name,
        },
    )


@app.get("/")
def index():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/status")
def status():
    dev = get_device()
    if dev is None:
        return jsonify({"connected": False})
    return jsonify(
        {
            "connected": True,
            "host": dev.host[0],
            "mac": dev.mac.hex(),
            "name": dev.name,
        }
    )


@app.post("/api/discover")
def discover():
    timeout = float(request.json.get("timeout", 5)) if request.is_json else 5
    devices = broadlink.discover(timeout=timeout)
    results = []
    for dev in devices:
        results.append(
            {
                "host": dev.host[0],
                "mac": dev.mac.hex(),
                "name": dev.name,
                "type": dev.type,
                "devtype": dev.devtype,
            }
        )
    return jsonify({"devices": results})


@app.post("/api/connect")
def connect():
    """Connect either to a discovered device (devtype+host+mac) or by
    manually entering the RM4 Mini's IP address."""
    body = request.get_json(force=True)
    host = body.get("host")
    if not host:
        return jsonify({"error": "host is required"}), 400

    if body.get("devtype") is not None and body.get("mac"):
        dev = broadlink.gendevice(
            int(body["devtype"]), (host, 80), bytes.fromhex(body["mac"])
        )
    else:
        # Direct single-host discovery — works even when broadcast
        # discovery is blocked by AP/client isolation on the router.
        dev = broadlink.hello(host)

    dev.auth()
    set_device(dev)
    return jsonify({"connected": True, "host": dev.host[0], "mac": dev.mac.hex()})


@app.post("/api/learn/start")
def learn_start():
    dev = get_device()
    if dev is None:
        return jsonify({"error": "no device connected"}), 400
    dev.enter_learning()
    return jsonify({"learning": True})


@app.get("/api/learn/check")
def learn_check():
    dev = get_device()
    if dev is None:
        return jsonify({"error": "no device connected"}), 400
    try:
        data = dev.check_data()
    except (ReadError, StorageError):
        return jsonify({"status": "waiting"}), 202
    if data is None:
        return jsonify({"status": "waiting"}), 202
    return jsonify({"status": "captured", "code": data.hex()})


@app.get("/api/codes")
def list_codes():
    return jsonify(load_json(CODES_FILE, {}))


@app.post("/api/codes")
def save_code():
    body = request.get_json(force=True)
    name = (body.get("name") or "").strip()
    code = body.get("code")
    if not name or not code:
        return jsonify({"error": "name and code are required"}), 400
    codes = load_json(CODES_FILE, {})
    codes[name] = code
    save_json(CODES_FILE, codes)
    return jsonify(codes)


@app.delete("/api/codes/<name>")
def delete_code(name):
    codes = load_json(CODES_FILE, {})
    codes.pop(name, None)
    save_json(CODES_FILE, codes)
    return jsonify(codes)


@app.post("/api/send/<name>")
def send_code(name):
    dev = get_device()
    if dev is None:
        return jsonify({"error": "no device connected"}), 400
    codes = load_json(CODES_FILE, {})
    hex_code = codes.get(name)
    if not hex_code:
        return jsonify({"error": f"no saved code named '{name}'"}), 404
    dev.send_data(bytes.fromhex(hex_code))
    return jsonify({"sent": name})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8090, debug=False)
