// Verified active high-quota key pool for Amulyam AI Brain
export const GEMINI_KEY_POOL = [
  "AIzaSyDQfhznTTENjMd3pjeZG1om0_f6aTFCDh0",
  "AIzaSyAojuTXptYE5LVPZEKClrP4p8BMVLq8e90",
  "AIzaSyD6srI8W2zky-X0Qj1cIvq6zHjKhRiTS8o",
  "AIzaSyABJGAO7B8_sr_ZLCO2aO3HCf0rEA3_DD4",
  "AIzaSyBXn1DoQBC9szL7Dq57Rg3m-2DH9sNvQXo",
  "AIzaSyCBQe9Fci__eiIVChpDAZmUSV1MvBBxc1U",
  "AIzaSyATDqbAq_kHWo3SNjt86OhODIHElU-pHh0"
];

let currentKeyIndex = 0;

export async function executeGeminiWithRotation(payload: any): Promise<any> {
  const maxAttempts = GEMINI_KEY_POOL.length;
  let lastError: any = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const keyIndex = (currentKeyIndex + attempt) % GEMINI_KEY_POOL.length;
    const apiKey = GEMINI_KEY_POOL[keyIndex];

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000)
      });

      if (res.ok) {
        currentKeyIndex = (keyIndex + 1) % GEMINI_KEY_POOL.length;
        return await res.json();
      }

      const errText = await res.text();
      lastError = new Error(`Key #${keyIndex} failed with HTTP ${res.status}: ${errText}`);
      console.warn(`[Amulyam AI Orchestrator] Key #${keyIndex} returned ${res.status}, rotating to next key...`);
    } catch (e: any) {
      lastError = e;
      console.warn(`[Amulyam AI Orchestrator] Network issue on key #${keyIndex}:`, e.message);
    }
  }

  throw lastError || new Error("All Gemini API keys exhausted");
}
