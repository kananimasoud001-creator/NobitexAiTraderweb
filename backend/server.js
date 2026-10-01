const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const LIVE_TRADING = String(process.env.LIVE_TRADING).toLowerCase() === "true";

// Frontend
app.use(express.static(path.join(__dirname, "..", "frontend")));

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "Nobitex AI Trader",
    mode: LIVE_TRADING ? "live" : "paper",
    transfersEnabled: false
  });
});

// دریافت قیمت BTC/IRT از API عمومی نوبیتکس
app.get("/api/market/btcirt", async (req, res) => {
  try {
    const response = await fetch(
      "https://apiv2.nobitex.ir/v3/orderbook/BTCIRT"
    );

    if (!response.ok) {
      throw new Error(`Nobitex HTTP ${response.status}`);
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(502).json({
      status: "error",
      message: "Market data unavailable"
    });
  }
});

// موتور AI — فعلاً حالت امن
app.post("/api/ai/analyze", (req, res) => {
  const market = req.body?.market || "BTCIRT";

  res.json({
    market,
    mode: "paper",
    decision: "WAIT",
    confidence: null,
    strategy: "adaptive",
    reason:
      "AI Engine هنوز متصل نشده است. حالت WAIT برای جلوگیری از معامله ناخواسته فعال است.",
    risk: {
      maxRiskPercent: 1,
      maxDailyLossPercent: 3
    }
  });
});

// معاملات واقعی فعلاً قفل است
app.post("/api/trade/live", (req, res) => {
  res.status(403).json({
    status: "blocked",
    message: "Live trading is disabled."
  });
});

// صفحه اصلی
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "frontend", "index.html")
  );
});

app.listen(PORT, () => {
  console.log(
    `Nobitex AI Trader running on port ${PORT}`
  );
});
