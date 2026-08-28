import { loadComponent } from "./loader.js";
import { parseLeadsFile } from "./parser.js";

let parsedLeads = [];

async function init() {
  await loadComponent("#header-component", "/components/header.html");
  await loadComponent("#table-component", "/components/table.html");

  bindEvents();
}

function bindEvents() {
  const fileInput = document.getElementById('fileInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearLogsBtn = document.getElementById('clearLogsBtn');

  if (clearLogsBtn) {
    clearLogsBtn.addEventListener('click', () => {
      const logsContainer = document.getElementById('logsContainer');
      if (logsContainer) {
        logsContainer.innerHTML = '<p class="text-gray-500">// Logs cleared.</p>';
      }
    });
  }

  if (!fileInput || !sendBtn) return;

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    logMessage(`Reading file: ${file.name}...`);
    parsedLeads = await parseLeadsFile(file);

    renderTable();

    if (parsedLeads.length > 0) {
      sendBtn.disabled = false;
      logMessage(`Found ${parsedLeads.length} valid email leads!`, "success");
    } else {
      sendBtn.disabled = true;
      logMessage(`No valid email addresses found in ${file.name}.`, "error");
    }
  });

  sendBtn.addEventListener("click", async () => {
    if (parsedLeads.length === 0) return;

    toggleControls(true);
    logMessage("Initiating batch request...", "warn");

    try {
      const response = await fetch("/api/send-batch-emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: parsedLeads }),
      });

      const data = await response.json();

      if (data.success) {
        logMessage(
          `Batch execution completed. Sent: ${data.summary.successful.length}, Failed: ${data.summary.failed.length}`,
          "success",
        );
        updateRowStatuses(data.summary);
      } else {
        logMessage(`Server error: ${data.error}`, "error");
      }
    } catch (err) {
      logMessage(`Network failure: ${err.message}`, "error");
    } finally {
      toggleControls(false);
    }
  });
}

function renderTable() {
  const tableBody = document.getElementById("tableBody");
  const leadCount = document.getElementById("leadCount");

  if (!tableBody) return;
  leadCount.textContent = `${parsedLeads.length} Loaded`;
  tableBody.innerHTML = "";

  if (parsedLeads.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-gray-500 italic border border-black">No leads loaded.</td></tr>`;
    return;
  }

  parsedLeads.forEach((lead, index) => {
    const tr = document.createElement("tr");
    tr.id = `row-${index}`;
    tr.className = "hover:bg-gray-100 transition-colors";
    tr.innerHTML = `
      <td class="py-2 px-3 border border-black font-mono text-gray-600">${index + 1}</td>
      <td class="py-2 px-3 border border-black font-bold">${lead.name}</td>
      <td class="py-2 px-3 border border-black font-mono">${lead.email}</td>
      <td class="py-2 px-3 border border-black">${lead.city}</td>
      <td class="py-2 px-3 border border-black status-cell font-mono uppercase text-xs font-bold text-gray-500">Pending</td>
    `;
    tableBody.appendChild(tr);
  });
}

function updateRowStatuses(summary) {
  summary.successful.forEach((item) => {
    const idx = parsedLeads.findIndex((l) => l.email === item.email);
    if (idx !== -1) {
      const cell = document.querySelector(`#row-${idx} .status-cell`);
      if (cell)
        cell.innerHTML = `<span class="bg-black text-white px-1.5 py-0.5 font-bold">SENT</span>`;
    }
  });

  summary.failed.forEach((item) => {
    const idx = parsedLeads.findIndex((l) => l.email === item.email);
    if (idx !== -1) {
      const cell = document.querySelector(`#row-${idx} .status-cell`);
      if (cell)
        cell.innerHTML = `<span class="border border-black text-black px-1.5 py-0.5 font-bold">FAILED</span>`;
    }
  });
}

function toggleControls(isProcessing) {
  const sendBtn = document.getElementById("sendBtn");
  const fileInput = document.getElementById("fileInput");
  const progressSection = document.getElementById("progressSection");
  const progressBar = document.getElementById("progressBar");

  sendBtn.disabled = isProcessing;
  fileInput.disabled = isProcessing;

  if (isProcessing) {
    progressSection.classList.remove("hidden");
    progressBar.style.width = "50%";
  } else {
    progressBar.style.width = "100%";
  }
}

function logMessage(msg, type = "info") {
  const logsContainer = document.getElementById("logsContainer");
  if (!logsContainer) return;

  const prefixes = {
    info: "[INFO]",
    success: "[OK]",
    error: "[ERROR]",
    warn: "[WARN]",
  };

  const p = document.createElement("p");
  p.className = "font-mono text-xs text-black";
  p.textContent = `${prefixes[type] || "[LOG]"} ${new Date().toLocaleTimeString()} - ${msg}`;
  logsContainer.appendChild(p);
  logsContainer.scrollTop = logsContainer.scrollHeight;
}

document.addEventListener("DOMContentLoaded", init);
