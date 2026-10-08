
const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "nexora_verify_2026";
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const GRAPH_API_VERSION = "v26.0";

app.get("/", (req, res) => {
  res.send("Nexora AI Webhook online");
});

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificato da Meta");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  // Rispondi subito a Meta per confermare la ricezione dell'evento.
  res.sendStatus(200);

  try {
    const entries = req.body?.entry || [];

    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        const messages = value.messages || [];

        for (const message of messages) {
          if (message.type !== "text" || !message.text?.body) continue;

          const recipient = message.from;
          const incomingText = message.text.body;

          console.log("Messaggio ricevuto:", incomingText);

          if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
            console.error("Mancano WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID");
            continue;
          }

          const response = await fetch(
            `https://graph.facebook.com/${GRAPH_API_VERSION}/${PHONE_NUMBER_ID}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: recipient,
                type: "text",
                text: {
                  body: `Ciao! Sono Nexora AI 🤖 Ho ricevuto il tuo messaggio: "${incomingText}"`
                }
              })
            }
          );

          const result = await response.json();
          console.log("Risultato invio WhatsApp:", response.status, JSON.stringify(result));
        }
      }
    }
  } catch (error) {
    console.error("Errore webhook:", error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Nexora AI Webhook avviato sulla porta ${PORT}`);
});
