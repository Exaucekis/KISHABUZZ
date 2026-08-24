"use client";

import { useEffect } from "react";

export function CssDebugProbe({ surface }: { surface: string }) {
  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const wrap = document.createElement("div");
    wrap.className = "admin-shell";
    wrap.style.cssText = "position:absolute;left:-9999px;top:0";
    const btn = document.createElement("button");
    btn.className = "admin-btn admin-btn-primary";
    btn.textContent = "probe";
    const card = document.createElement("div");
    card.className = "admin-card";
    const account = document.createElement("div");
    account.className = "account-page";
    const display = document.createElement("p");
    display.className = "font-display";
    display.textContent = "Aa";
    const header = document.createElement("header");
    header.className = "site-header";
    wrap.append(btn, card);
    document.body.append(wrap, account, display, header);
    const btnCs = getComputedStyle(btn);
    const cardCs = getComputedStyle(card);
    const accountCs = getComputedStyle(account);
    const displayCs = getComputedStyle(display);
    const headerCs = getComputedStyle(header);
    const bodyCs = getComputedStyle(document.body);

    // #region agent log
    fetch("http://127.0.0.1:7502/ingest/2c7201aa-d613-4e7f-96c3-8a38bb6f5698", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "239044" },
      body: JSON.stringify({
        sessionId: "239044",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "CssDebugProbe.tsx",
        message: "css-computed-probe",
        data: {
          surface,
          adminBtnDisplay: btnCs.display,
          adminBtnPadding: btnCs.padding,
          adminBtnBg: btnCs.backgroundColor,
          adminCardBg: cardCs.backgroundColor,
          adminCardBorder: cardCs.borderTopWidth,
          accountPosition: accountCs.position,
          fontDisplayFamily: displayCs.fontFamily,
          siteHeaderIsolation: headerCs.isolation,
          bodyBg: bodyCs.backgroundColor,
          ink: root.getPropertyValue("--ink").trim(),
          colorInk: root.getPropertyValue("--color-ink").trim(),
          onEmber: root.getPropertyValue("--on-ember").trim(),
          colorOnEmber: root.getPropertyValue("--color-on-ember").trim(),
          fontFigtree: root.getPropertyValue("--font-figtree").trim().slice(0, 60),
          fontSyne: root.getPropertyValue("--font-syne").trim().slice(0, 60),
          fontInter: root.getPropertyValue("--font-inter").trim().slice(0, 60),
          sheetCount: document.styleSheets.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    wrap.remove();
    account.remove();
    display.remove();
    header.remove();
  }, [surface]);

  return null;
}
