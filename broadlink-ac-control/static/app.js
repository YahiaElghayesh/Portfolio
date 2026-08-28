const deviceStatusEl = document.getElementById("device-status");
const discoverBtn = document.getElementById("btn-discover");
const discoverStatusEl = document.getElementById("discover-status");
const discoveredListEl = document.getElementById("discovered-list");
const manualIpEl = document.getElementById("manual-ip");
const connectIpBtn = document.getElementById("btn-connect-ip");

const learnNameEl = document.getElementById("learn-name");
const learnBtn = document.getElementById("btn-learn");
const learnStatusEl = document.getElementById("learn-status");

const commandGridEl = document.getElementById("command-grid");

async function api(path, options) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

function setStatus(el, text, kind) {
  el.textContent = text;
  el.className = "status" + (kind ? " " + kind : "");
}

async function refreshStatus() {
  try {
    const s = await api("/api/status");
    if (s.connected) {
      setStatus(deviceStatusEl, `Connected to ${s.name || "RM4"} at ${s.host} (${s.mac})`, "ok");
      learnBtn.disabled = false;
    } else {
      setStatus(deviceStatusEl, "No device connected yet.", "");
      learnBtn.disabled = true;
    }
  } catch (e) {
    setStatus(deviceStatusEl, "Error checking status: " + e.message, "err");
  }
}

discoverBtn.addEventListener("click", async () => {
  discoverStatusEl.textContent = "Scanning (5s)…";
  discoveredListEl.innerHTML = "";
  try {
    const { devices } = await api("/api/discover", {
      method: "POST",
      body: JSON.stringify({ timeout: 5 }),
    });
    discoverStatusEl.textContent = `${devices.length} device(s) found.`;
    devices.forEach((d) => {
      const row = document.createElement("div");
      row.className = "device-item";
      row.innerHTML = `<span>${d.name || "Broadlink device"} — ${d.host} (${d.type})</span>`;
      const btn = document.createElement("button");
      btn.textContent = "Connect";
      btn.addEventListener("click", () => connectTo(d));
      row.appendChild(btn);
      discoveredListEl.appendChild(row);
    });
  } catch (e) {
    discoverStatusEl.textContent = "Scan failed: " + e.message;
  }
});

async function connectTo(d) {
  try {
    await api("/api/connect", {
      method: "POST",
      body: JSON.stringify({ host: d.host, mac: d.mac, devtype: d.devtype }),
    });
    await refreshStatus();
  } catch (e) {
    setStatus(deviceStatusEl, "Connect failed: " + e.message, "err");
  }
}

connectIpBtn.addEventListener("click", async () => {
  const host = manualIpEl.value.trim();
  if (!host) return;
  try {
    await api("/api/connect", { method: "POST", body: JSON.stringify({ host }) });
    await refreshStatus();
  } catch (e) {
    setStatus(deviceStatusEl, "Connect failed: " + e.message, "err");
  }
});

let learnPollTimer = null;

learnBtn.addEventListener("click", async () => {
  const name = learnNameEl.value.trim();
  if (!name) {
    setStatus(learnStatusEl, "Enter a command name first.", "err");
    return;
  }
  try {
    await api("/api/learn/start", { method: "POST" });
  } catch (e) {
    setStatus(learnStatusEl, "Could not start learning: " + e.message, "err");
    return;
  }
  setStatus(learnStatusEl, "Point the Sharp remote at the RM4 Mini and press the button now…", "");
  let attempts = 0;
  clearInterval(learnPollTimer);
  learnPollTimer = setInterval(async () => {
    attempts += 1;
    if (attempts > 20) {
      clearInterval(learnPollTimer);
      setStatus(learnStatusEl, "Timed out waiting for a signal. Try again.", "err");
      return;
    }
    try {
      const res = await fetch("/api/learn/check");
      if (res.status === 202) return; // still waiting
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "learn failed");
      clearInterval(learnPollTimer);
      await api("/api/codes", {
        method: "POST",
        body: JSON.stringify({ name, code: data.code }),
      });
      setStatus(learnStatusEl, `Saved "${name}".`, "ok");
      learnNameEl.value = "";
      loadCommands();
    } catch (e) {
      clearInterval(learnPollTimer);
      setStatus(learnStatusEl, "Learning failed: " + e.message, "err");
    }
  }, 1000);
});

async function loadCommands() {
  const codes = await api("/api/codes");
  const names = Object.keys(codes);
  commandGridEl.innerHTML = "";
  if (names.length === 0) {
    commandGridEl.innerHTML = '<p class="empty">No commands learned yet.</p>';
    return;
  }
  names.forEach((name) => {
    const wrap = document.createElement("div");
    wrap.className = "command-btn";
    wrap.textContent = name;

    const del = document.createElement("button");
    del.className = "command-del";
    del.textContent = "×";
    del.title = "Delete";
    del.addEventListener("click", async (ev) => {
      ev.stopPropagation();
      await api(`/api/codes/${encodeURIComponent(name)}`, { method: "DELETE" });
      loadCommands();
    });
    wrap.appendChild(del);

    wrap.addEventListener("click", async () => {
      wrap.style.opacity = 0.6;
      try {
        await api(`/api/send/${encodeURIComponent(name)}`, { method: "POST" });
      } catch (e) {
        alert("Send failed: " + e.message);
      } finally {
        wrap.style.opacity = 1;
      }
    });

    commandGridEl.appendChild(wrap);
  });
}

refreshStatus();
loadCommands();
