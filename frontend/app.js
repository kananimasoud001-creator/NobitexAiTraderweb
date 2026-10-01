const $ = (id) => document.getElementById(id);


// دریافت وضعیت سیستم
async function loadHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();

    document.getElementById("mode").textContent =
      data.mode === "live" ? "LIVE" : "PAPER";

  } catch (error) {

    document.getElementById("mode").textContent =
      "OFFLINE";

  }
}


// دریافت قیمت BTC/IRT
async function loadMarket() {

  try {

    const response =
      await fetch("/api/market/btcirt");

    const data =
      await response.json();

    if (data.lastTradePrice) {

      $("price").textContent =
        Number(
          data.lastTradePrice
        ).toLocaleString("fa-IR")
        + " ریال";

      $("marketStatus").textContent =
        "داده بازار دریافت شد";

      updateChecklist(true);

    } else {

      throw new Error(
        "Invalid market data"
      );

    }

  } catch (error) {

    console.error(error);

    $("marketStatus").textContent =
      "دریافت داده ناموفق بود";

    updateChecklist(false);

  }

}


// تحلیل AI
async function analyzeMarket() {

  $("decision").textContent =
    "ANALYZING...";

  $("reason").textContent =
    "در حال بررسی بازار توسط موتور AI...";

  try {

    const response =
      await fetch(
        "/api/ai/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            market: "BTCIRT"
          })
        }
      );

    const data =
      await response.json();


    $("decision").textContent =
      data.decision || "WAIT";


    $("reason").textContent =
      data.reason ||
      "تحلیل در دسترس نیست";


    if (data.risk) {

      $("risk").textContent =
        data.risk.maxRiskPercent +
        "%";

    }

  } catch (error) {

    console.error(error);

    $("decision").textContent =
      "ERROR";

    $("reason").textContent =
      "ارتباط با موتور AI برقرار نشد";

  }

}


// وضعیت Checklist
function updateChecklist(
  marketOK
) {

  const items =
    document.querySelectorAll(
      "#checklist span"
    );


  if (items.length === 0)
    return;


  items[0].textContent =
    marketOK
      ? "✅"
      : "❌";


  for (
    let i = 1;
    i < items.length;
    i++
  ) {

    items[i].textContent =
      "⏳";

  }

}


// توقف اضطراری
function emergencyStop() {

  alert(
    "🛑 ربات متوقف شد.\n\n" +
    "در این نسخه هیچ سفارش واقعی ارسال نمی‌شود."
  );

}


// دکمه‌ها

$("refresh")
  .addEventListener(
    "click",
    loadMarket
  );


$("analyze")
  .addEventListener(
    "click",
    analyzeMarket
  );


$("stop")
  .addEventListener(
    "click",
    emergencyStop
  );


// شروع برنامه

loadHealth();

loadMarket();
