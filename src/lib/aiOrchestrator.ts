// Active multi-key rotation pool for Amulyam AI Brain
export const GEMINI_KEY_POOL = [
  "AIzaSyBfruSDdRSuNbYwEMv3dM2UKVcasoppdoQ",
  "AIzaSyAPha2hh0q-vB-0UcmHoJlho1_gNvsmwp8",
  "AIzaSyA772ZoeT6Leuv3jBLuhYMdOz-d1Ybhoak",
  "AIzaSyCXf8i0fbnV3_e5T4X_HP_EGJN86DrUW2A",
  "AIzaSyCcZb_6wo0OVEoiqfrkMv2-1BmVFB6Odkw",
  "AIzaSyAhcWhHX8lMo_Clma1_ma8kpSnW1jufofE",
  "AIzaSyBj7qjGD311IW-9467n7-deTAK494gvDY8",
  "AIzaSyCnWz7O9rEgsTU5Sq-Iwq2ktLQolHCKvYs",
  "AIzaSyCkXd-A5eff-ZmzHvLSB6YI8Oi5LGeUa8I",
  "AIzaSyCUnQ2C4SRFMsbolVAw14ot51JtqwBGGsk",
  "AIzaSyAVF-8T4e90L-BwJco898kshfjTEtgQxOk",
  "AIzaSyCG7LTT5BEcB-ovtAB0WyMzi8n8FpiHDmU",
  "AIzaSyAHlyvAMb5fkwOte3YZQQwHVPpajJ_8Vs4",
  "AIzaSyBBesOYMXQBj40REmaE_PrhpsNRB94O9f0",
  "AIzaSyBG_UkwjFjtM36OWRJA_kkmapP1RHgWxDE"
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
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        currentKeyIndex = (keyIndex + 1) % GEMINI_KEY_POOL.length; // Rotate for load balancing
        return await res.json();
      }

      const errText = await res.text();
      lastError = new Error(`Key #${keyIndex} failed with HTTP ${res.status}: ${errText}`);
      console.warn(`[Amulyam AI Orchestrator] Key #${keyIndex} failed with ${res.status}, rotating to next key...`);
    } catch (e: any) {
      lastError = e;
      console.warn(`[Amulyam AI Orchestrator] Network issue on key #${keyIndex}:`, e.message);
    }
  }

  throw lastError || new Error("All Gemini API keys exhausted");
}
