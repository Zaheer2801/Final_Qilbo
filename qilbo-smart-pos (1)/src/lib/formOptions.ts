import type { DayHours, DayOfWeek } from "../types";

export const US_STATES: { v: string; l: string }[] = [
  { v: "AL", l: "Alabama" }, { v: "AK", l: "Alaska" }, { v: "AZ", l: "Arizona" }, { v: "AR", l: "Arkansas" },
  { v: "CA", l: "California" }, { v: "CO", l: "Colorado" }, { v: "CT", l: "Connecticut" }, { v: "DE", l: "Delaware" },
  { v: "DC", l: "District of Columbia" }, { v: "FL", l: "Florida" }, { v: "GA", l: "Georgia" }, { v: "HI", l: "Hawaii" },
  { v: "ID", l: "Idaho" }, { v: "IL", l: "Illinois" }, { v: "IN", l: "Indiana" }, { v: "IA", l: "Iowa" },
  { v: "KS", l: "Kansas" }, { v: "KY", l: "Kentucky" }, { v: "LA", l: "Louisiana" }, { v: "ME", l: "Maine" },
  { v: "MD", l: "Maryland" }, { v: "MA", l: "Massachusetts" }, { v: "MI", l: "Michigan" }, { v: "MN", l: "Minnesota" },
  { v: "MS", l: "Mississippi" }, { v: "MO", l: "Missouri" }, { v: "MT", l: "Montana" }, { v: "NE", l: "Nebraska" },
  { v: "NV", l: "Nevada" }, { v: "NH", l: "New Hampshire" }, { v: "NJ", l: "New Jersey" }, { v: "NM", l: "New Mexico" },
  { v: "NY", l: "New York" }, { v: "NC", l: "North Carolina" }, { v: "ND", l: "North Dakota" }, { v: "OH", l: "Ohio" },
  { v: "OK", l: "Oklahoma" }, { v: "OR", l: "Oregon" }, { v: "PA", l: "Pennsylvania" }, { v: "RI", l: "Rhode Island" },
  { v: "SC", l: "South Carolina" }, { v: "SD", l: "South Dakota" }, { v: "TN", l: "Tennessee" }, { v: "TX", l: "Texas" },
  { v: "UT", l: "Utah" }, { v: "VT", l: "Vermont" }, { v: "VA", l: "Virginia" }, { v: "WA", l: "Washington" },
  { v: "WV", l: "West Virginia" }, { v: "WI", l: "Wisconsin" }, { v: "WY", l: "Wyoming" },
];

export const COUNTRIES: { v: string; l: string }[] = [
  { v: "US", l: "United States" },
  // Nothing else in this schema (EIN format, liquor license fields, the
  // timezone list, US_STATES above) supports another country's shape yet —
  // adding more here would be cosmetic until those are built out too.
];

function timeLabel(h: number, m: number): string {
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

/** 30-minute increments, 12:00 AM to 11:30 PM — select-only, no free-typed times. */
export const TIME_OPTIONS: { v: string; l: string }[] = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? 0 : 30;
  const v = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  return { v, l: timeLabel(h, m) };
});

export const DAYS_OF_WEEK: DayOfWeek[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function defaultHours(): DayHours[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    closed: false,
    open: day === "Sun" ? "12:00" : "10:00",
    close: day === "Sun" ? "21:00" : "23:00",
  }));
}

export function formatHoursSummary(hours: DayHours[]): string {
  return hours
    .map((h) => (h.closed ? `${h.day} closed` : `${h.day} ${TIME_OPTIONS.find((t) => t.v === h.open)?.l ?? h.open}–${TIME_OPTIONS.find((t) => t.v === h.close)?.l ?? h.close}`))
    .join(", ");
}

/** Local stand-in for a real geocoding/address-autocomplete API (e.g. Google
 * Places). A live lookup needs a paid third-party service and a network call,
 * which is out of scope for a local-only prototype — this demonstrates the
 * same interaction (type, see matches, pick one, fields fill in together)
 * against a small fixed list so the UX pattern is real and clickable, not a
 * promise of live autocomplete. Swap this list for a real API call first when
 * wiring up real integrations. */
export const SAMPLE_ADDRESS_SUGGESTIONS: { street: string; city: string; state: string; zip: string }[] = [
  { street: "4210 Palmetto Ave", city: "Miami", state: "FL", zip: "33127" },
  { street: "118 Congress Ave", city: "Austin", state: "TX", zip: "78701" },
  { street: "2200 Larimer St", city: "Denver", state: "CO", zip: "80205" },
  { street: "3102 N Central Ave", city: "Phoenix", state: "AZ", zip: "85012" },
  { street: "5601 Sunset Blvd", city: "Los Angeles", state: "CA", zip: "90028" },
  { street: "412 W 4th Ave", city: "Anchorage", state: "AK", zip: "99501" },
  { street: "1450 Ala Moana Blvd", city: "Honolulu", state: "HI", zip: "96814" },
  { street: "225 Flatbush Ave", city: "Brooklyn", state: "NY", zip: "11217" },
];
