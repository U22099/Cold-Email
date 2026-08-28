export async function loadComponent(selector, filepath) {
  const container = document.querySelector(selector);
  if (!container) return;

  try {
    const response = await fetch(filepath);
    if (!response.ok)
      throw new Error(`HTTP ${response.status} loading ${filepath}`);
    const html = await response.text();
    container.innerHTML = html;
  } catch (err) {
    console.error(`Component loader error:`, err);
  }
}
