const GAS_URL = "https://script.google.com/macros/s/AKfycbwECzGUmH1gZ5TNhAFg77-rl-_Bf_wDI-LdiLqB1qEk7X81KgzAN8w1lehZFJ29XAc/exec";

export async function apiGet(action, payload = {}) {
  try {
    const params = new URLSearchParams();
    params.set("action", action);

    if (payload && Object.keys(payload).length > 0) {
      params.set("payload", JSON.stringify(payload));
    }

    const url = `${GAS_URL}?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      redirect: "follow"
    });

    const text = await res.text();
    console.log("apiGet:", action, text);

    return JSON.parse(text);
  } catch (err) {
    console.error("apiGet error:", action, err);
    return {
      success: false,
      error: "SAMBUNGAN KE BACKEND GAGAL. SILA SEMAK URL GAS ATAU DEPLOYMENT."
    };
  }
}

export async function apiPost(action, payload = {}) {
  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify({ action, payload })
    });

    const text = await res.text();
    console.log("apiPost:", action, text);

    return JSON.parse(text);
  } catch (err) {
    console.error("apiPost error:", action, err);
    return {
      success: false,
      error: "SAMBUNGAN KE BACKEND GAGAL. SILA SEMAK URL GAS ATAU DEPLOYMENT."
    };
  }
}

