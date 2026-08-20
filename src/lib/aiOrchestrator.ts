// Verified active high-quota key pool for Amulyam AI Brain
export const GEMINI_KEY_POOL = [
  "AIzaSyAojuTXptYE5LVPZEKClrP4p8BMVLq8e90",
  "AIzaSyD6srI8W2zky-X0Qj1cIvq6zHjKhRiTS8o",
  "AIzaSyABJGAO7B8_sr_ZLCO2aO3HCf0rEA3_DD4",
  "AIzaSyBXn1DoQBC9szL7Dq57Rg3m-2DH9sNvQXo",
  "AIzaSyCBQe9Fci__eiIVChpDAZmUSV1MvBBxc1U",
  "AIzaSyATDqbAq_kHWo3SNjt86OhODIHElU-pHh0"
];

// In-memory key cooldown cache to skip rate-limited keys instantly
const KEY_COOLDOWNS = new Map<string, number>();
const COOLDOWN_DURATION_MS = 3 * 60 * 1000; // 3 minutes cooldown

let currentKeyIndex = 0;

export async function executeGeminiWithRotation(payload: any): Promise<any> {
  const maxAttempts = GEMINI_KEY_POOL.length;
  let lastError: any = null;
  const now = Date.now();

  // Ensure payload has zero-budget thinking for sub-second responses
  const optimizedPayload = {
    ...payload,
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 1024,
      thinkingConfig: { thinkingBudget: 0 },
      ...(payload.generationConfig || {})
    }
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const keyIndex = (currentKeyIndex + attempt) % GEMINI_KEY_POOL.length;
    const apiKey = GEMINI_KEY_POOL[keyIndex];

    // Check cooldown
    const cooldownUntil = KEY_COOLDOWNS.get(apiKey) || 0;
    if (now < cooldownUntil) {
      continue;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(optimizedPayload),
        signal: AbortSignal.timeout(8000)
      });

      if (res.ok) {
        currentKeyIndex = (keyIndex + 1) % GEMINI_KEY_POOL.length;
        KEY_COOLDOWNS.delete(apiKey);
        return await res.json();
      }

      const errText = await res.text();
      lastError = new Error(`Key #${keyIndex} failed with HTTP ${res.status}: ${errText}`);
      
      // If rate limited or quota exceeded, put on cooldown
      if (res.status === 429 || res.status === 403) {
        KEY_COOLDOWNS.set(apiKey, Date.now() + COOLDOWN_DURATION_MS);
        console.warn(`[Amulyam AI Orchestrator] Key #${keyIndex} hit status ${res.status}, put on cooldown for 3m.`);
      }
    } catch (e: any) {
      lastError = e;
      console.warn(`[Amulyam AI Orchestrator] Error on key #${keyIndex}:`, e.message);
    }
  }

  throw lastError || new Error("All active Gemini API keys exhausted or on cooldown");
}

