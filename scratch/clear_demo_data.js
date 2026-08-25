const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzjoGHdI1UfEeAHTlbgA8pKd-OGcvJVJnmHcZApos76TqT6DasPMuzuanonRTrxynVxnA/exec";

async function clearDemoData() {
  console.log("Clearing demo research report from Home Vista...");
  const researchPayload = {
    action: "updateClientResearch",
    data: {
      clientName: "Home Vista",
      filePath: "_MonthlyResearch.json",
      markdownContent: "[]"
    }
  };

  const res1 = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(researchPayload),
    redirect: "follow"
  });
  console.log("Research clear response:", await res1.text());

  console.log("Clearing demo analytics from Home Vista...");
  const analyticsPayload = {
    action: "updateClientResearch",
    data: {
      clientName: "Home Vista",
      filePath: "_Analytics.json",
      markdownContent: "[]"
    }
  };

  const res2 = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(analyticsPayload),
    redirect: "follow"
  });
  console.log("Analytics clear response:", await res2.text());
}

clearDemoData();
