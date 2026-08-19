import { useState } from "react";
import type { AppState, OverrideStatus } from "../../types";
import { currentMargin, marginFloorFor, round2 } from "../../lib/businessLogic";
import { btnSmall, card, inputCls, Tag } from "../ui";
import { HoverableProductName } from "./ProductThumb";
import { titleCase } from "../../lib/format";

export default function PricingTab({
  state,
  updateState,
}: {
  state: AppState;
  updateState: (updater: (s: AppState) => AppState) => void;
}) {
  const [overrideForm, setOverrideForm] = useState({
    productId: "",
    requestedMargin: "",
    reason: "",
  });

  // Approval-gated: this only ever creates a `pending` override request. Nothing
  // here changes a live price — see pricing-intelligence.md's override workflow.
  function requestOverride() {
    if (!overrideForm.productId || !overrideForm.requestedMargin) return;
    updateState((s) => ({
      ...s,
      marginOverrides: [
        ...s.marginOverrides,
        {
          id: "MO-" + Date.now(),
          productId: overrideForm.productId,
          requestedMargin: overrideForm.requestedMargin,
          approvedMargin: "",
          reason: overrideForm.reason,
          status: "pending",
        },
      ],
    }));
    setOverrideForm({ productId: "", requestedMargin: "", reason: "" });
  }

  function decide(id: string, status: OverrideStatus, approvedMargin: string) {
    updateState((s) => ({
      ...s,
      marginOverrides: s.marginOverrides.map((o) =>
        o.id === id ? { ...o, status, approvedMargin } : o,
      ),
    }));
  }

  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">Margin check, by product</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-stone-500 border-b border-stone-100">
              <th className="pb-2">Product</th>
              <th>Current margin</th>
              <th>Floor</th>
              <th>Source</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {state.products.map((p) => {
              const cm = round2(currentMargin(p));
              const { floor, source } = marginFloorFor(
                p,
                state.marginPolicy,
                state.marginOverrides,
              );
              const ok = cm >= floor;
              return (
                <tr key={p.id} className="border-b border-stone-50">
                  <td className="py-1.5">
                    <HoverableProductName product={p}>
                      {titleCase(p.name)} {p.size}
                    </HoverableProductName>
                  </td>
                  <td>{cm}%</td>
                  <td>{floor}%</td>
                  <td className="text-xs text-stone-500">{source}</td>
                  <td>
                    {ok ? (
                      <Tag tone="green">OK</Tag>
                    ) : (
                      <Tag tone="red">below floor</Tag>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className={card}>
        <h3 className="text-sm font-semibold mb-3">
          Request a margin override
        </h3>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <select
            className={inputCls}
            value={overrideForm.productId}
            onChange={(e) =>
              setOverrideForm({ ...overrideForm, productId: e.target.value })
            }
          >
            <option value="">Select product</option>
            {state.products.map((p) => (
              <option key={p.id} value={p.id}>
                {titleCase(p.name)} {p.size}
              </option>
            ))}
          </select>
          <input
            className={inputCls}
            placeholder="Requested margin %"
            value={overrideForm.requestedMargin}
            onChange={(e) =>
              setOverrideForm({
                ...overrideForm,
                requestedMargin: e.target.value,
              })
            }
          />
          <input
            className={inputCls}
            placeholder="Reason"
            value={overrideForm.reason}
            onChange={(e) =>
              setOverrideForm({ ...overrideForm, reason: e.target.value })
            }
          />
        </div>
        <button onClick={requestOverride} className={btnSmall}>
          Submit request
        </button>

        {state.marginOverrides.length > 0 && (
          <div className="mt-4 space-y-2">
            {state.marginOverrides.map((o) => {
              const p = state.products.find((pr) => pr.id === o.productId);
              return (
                <div
                  key={o.id}
                  className="flex items-center justify-between text-sm border-t border-stone-50 pt-2"
                >
                  <div>
                    {p ? (
                      <HoverableProductName product={p}>
                        {titleCase(p.name)} {p.size}
                      </HoverableProductName>
                    ) : (
                      o.productId
                    )}{" "}
                    — requested {o.requestedMargin}% ({o.reason})
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag
                      tone={
                        o.status === "approved"
                          ? "green"
                          : o.status === "rejected"
                            ? "red"
                            : "amber"
                      }
                    >
                      {o.status}
                      {o.approvedMargin ? ` @ ${o.approvedMargin}%` : ""}
                    </Tag>
                    {o.status === "pending" && (
                      <>
                        <button
                          onClick={() =>
                            decide(o.id, "approved", o.requestedMargin)
                          }
                          className={btnSmall}
                        >
                          Approve as requested
                        </button>
                        <button
                          onClick={() => decide(o.id, "rejected", "")}
                          className={btnSmall}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
