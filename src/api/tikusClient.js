const BASE_URL = "http://localhost:8080/api/tikus";

// payload = object { name, address, gender, birthDate, position, email, passwordCredential }
export async function registerTkd0100(payload) {
  const response = await fetch(`${BASE_URL}/tkd0100`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    // coba baca error dari backend (kalau ada)
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (data.message) {
        message = data.message;
      }
    } catch (_) {
      // abaikan kalau bukan JSON
    }
    throw new Error(message);
  }

  // kalau backend nggak balikin body, ini bisa di-skip / dibikin optional
  try {
    return await response.json();
  } catch {
    return null;
  }
}
