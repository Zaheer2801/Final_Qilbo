import { describe, expect, it } from "vitest";
import { evaluateDemandAlert, expiryUrgency, marginFloorFor, reorderSuggestion } from "./businessLogic";
import { SAMPLE_PRODUCTS, SAMPLE_SALES } from "./sampleData";
import { defaultConfig, defaultMarginPolicy } from "./state";
import type { MarginOverride } from "../types";

function product(id: string) {
  const p = SAMPLE_PRODUCTS.find((p) => p.id === id);
  if (!p) throw new Error(`fixture missing: ${id}`);
  return p;
}

describe("marginFloorFor", () => {
  it("Grey Goose 750ml: an approved 40% counter-proposal (above the 30% Vodka floor) does NOT register as an active override — the category minimum still governs", () => {
    const greyGoose = product("P015"); // Vodka, category floor 30% per defaultMarginPolicy
    const overrides: MarginOverride[] = [
      {
        id: "MO-001",
        productId: "P015",
        requestedMargin: "25",
        approvedMargin: "40", // countered above the floor, per pricing-intelligence.md rule 5
        reason: "Slow-moving stock, clear inventory before it ages further",
        status: "approved",
      },
    ];

    const result = marginFloorFor(greyGoose, defaultMarginPolicy, overrides);

    expect(result.floor).toBe(30);
    expect(result.source).toBe("Vodka category minimum");
    expect(result.source).not.toMatch(/override/i);
  });
});

describe("expiryUrgency", () => {
  it("Corona Extra 6-pack: High — date-driven, stock won't clear at current pace", () => {
    const corona = product("P017");
    const risk = expiryUrgency(corona, SAMPLE_SALES);
    expect(risk).not.toBeNull();
    expect(risk!.tier).toBe("High");
    expect(risk!.reason).toMatch(/still be on hand at expiry/);
  });

  it("Modelo Especial 6-pack: High — date-driven, stock won't clear at current pace", () => {
    const modelo = product("P018");
    const risk = expiryUrgency(modelo, SAMPLE_SALES);
    expect(risk).not.toBeNull();
    expect(risk!.tier).toBe("High");
    expect(risk!.reason).toMatch(/still be on hand at expiry/);
  });

  it("Baileys Irish Cream: High specifically for zero recent sales, not the date (100+ days of runway)", () => {
    const baileys = product("P016");
    const risk = expiryUrgency(baileys, SAMPLE_SALES);
    expect(risk).not.toBeNull();
    expect(risk!.days).toBeGreaterThan(90);
    expect(risk!.vel).toBe(0);
    expect(risk!.tier).toBe("High");
    expect(risk!.reason).toMatch(/zero recent sales/);
    expect(risk!.reason).not.toMatch(/still be on hand at expiry/);
  });
});

describe("reorderSuggestion", () => {
  it("Grey Goose (8 on hand, reorder point 10): quantity rounds to the configured multiple, not the raw shortfall of 2", () => {
    const greyGoose = product("P015");
    expect(greyGoose.qty).toBe(8);
    expect(greyGoose.reorderPoint).toBe(10);

    const suggestion = reorderSuggestion(greyGoose, { reorderMultiple: defaultConfig.reorderMultiple, reorderUnit: defaultConfig.reorderUnit });

    const rawShortfall = greyGoose.reorderPoint - greyGoose.qty; // 2
    expect(rawShortfall).toBe(2);
    expect(suggestion.qty).not.toBe(rawShortfall);
    expect(suggestion.qty).toBe(Number(defaultConfig.reorderMultiple)); // 12 — rounded up to one full multiple
    expect(suggestion.unit).toBe(defaultConfig.reorderUnit); // "cases"
  });
});

describe("evaluateDemandAlert", () => {
  it("5 inquiries for a not-carried product, threshold 4: fires once at ask #4, does not re-fire at ask #5 (only 1 new ask since)", () => {
    const threshold = 4;
    let lastAlertCount = 0;
    const fired: number[] = [];

    for (let ask = 1; ask <= 5; ask++) {
      const { shouldAlert, newAlertStateCount } = evaluateDemandAlert(ask, lastAlertCount, threshold);
      if (shouldAlert) fired.push(ask);
      lastAlertCount = newAlertStateCount;
    }

    expect(fired).toEqual([4]);
    expect(fired).not.toContain(5);
    expect(lastAlertCount).toBe(4); // alertState should still reflect the 4th ask, not the 5th
  });
});
