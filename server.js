const express = require("express");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "nexora_verify_2026";

// Verifica del webhook Meta
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

// Ricezione dei messaggi WhatsApp
app.post("/webhook", (req, res) => {
  console.log("Webhook ricevuto:");
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

// Controllo che il server sia online
app.get("/", (req, res) => {
  res.send("Nexora AI Webhook online");
});

app.listen(PORT, () => {
  console.log(`Nexora AI Webhook avviato sulla porta ${PORT}`);
});
