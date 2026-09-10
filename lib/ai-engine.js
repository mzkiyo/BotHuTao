import "dotenv/config";

const [
  geminiApikey,
  groqApikey,
  geminiModel,
  groqModel,
  geminiBaseUrl,
  groqBaseUrl
] = [
  process.env.GEMINI_APIKEY,
  process.env.GROQ_APIKEY,
  process.env.GEMINI_MODEL,
  process.env.GROQ_MODEL,
  "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apikey}",
  "https://api.groq.com/openai/v1/chat/completions"
];

/**
 *
 * @param {object} input - berisi system character dan message
 * @param {string} input.system - karakter AI
 * @param {string} input.message - message yang akan dijawab AI
 * @returns {object} output - hasil AI
 * @returns {string} output.hasil - respon AI
 * @returns {string} output.thinking - proses berpikir AI (klo ada)
 */
async function groq({ system, message } = {}) {
  try {
    const res = await fetch(groqBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + groqApikey
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          {
            role: "system",
            content: system
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        presence_penalty: 1,
        frequency_penalty: 1
      })
    });

    if (!res.ok) {
      const eRes = await res.json();
      throw new Error(
        `Error ${eRes?.status} di groq(). msg: ${eRes?.error?.message} `
      );
    }

    const data = await res.json();
    let thinking = "",
      hasil = "";

    const respon = data.choices[0].message.content;
    if (respon.includes("</think>")) {
      const parts = respon.split("</think>");
      thinking += parts[0] + "\n</think>";
      hasil += parts[1];
    } else {
      hasil += respon;
    }
    const output = { hasil, thinking };
    return output;
  } catch (e) {
    console.error("[AI-EMGINE ERROR]: " + e.message);
    return { hasil: "Gagal mendapatkan respon AI", thinking: "" };
  }
}

async function gemini({ system, message } = {}) {
  try {
    const url = geminiBaseUrl
      .replace(/{model}/g, geminiModel)
      .replace(/{apikey}/g, geminiApikey);
    console.log("fetch ke " + url);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: system }]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: message }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          }
        ]
      })
    });

    if (!res.ok) {
      const eRes = await res.json();
      throw new Error(
        `Error di gemini() >> status: ${eRes?.status}. msg: ${eRes?.error?.message} `
      );
    }

    const result = await res.json();
    const data = result?.candidates[0]?.content?.parts[0]?.text;
    let thinking = "",
      hasil = "";
    // semisal user minta buat masukkin proses berpikir kedalam <think> </think>
    if (data.includes("</think>")) {
      const parts = data.split("</think>");
      thinking += parts[0];
      hasil += parts[1];
    } else {
      hasil += data;
    }
  } catch (e) {
    console.error("[AI-ENGINE ERROR]: " + e.message);
    return { hasil: "Gagal mendapatkan respon AI", thinking: "" };
  }
}

export { groq, gemini };
