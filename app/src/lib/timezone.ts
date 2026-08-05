// onboarding-flow.md Step 4: timezone as a select dropdown, auto-suggested
// rather than picked blind. Now that address is split into structured fields
// (see AddressFields), the suggestion is a direct state-code lookup instead of
// regexing a free-text blob — more reliable, and it's how a real geocoding
// API's result would map onto this list anyway if one gets wired in later.

export interface TimezoneOption {
  v: string;
  l: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { v: "America/New_York", l: "Eastern (New York)" },
  { v: "America/Chicago", l: "Central (Chicago)" },
  { v: "America/Denver", l: "Mountain (Denver)" },
  { v: "America/Phoenix", l: "Mountain, no DST (Phoenix)" },
  { v: "America/Los_Angeles", l: "Pacific (Los Angeles)" },
  { v: "America/Anchorage", l: "Alaska" },
  { v: "Pacific/Honolulu", l: "Hawaii" },
];

const EASTERN = ["FL", "GA", "NC", "SC", "VA", "WV", "NY", "NJ", "PA", "OH", "MI", "MA", "CT", "RI", "VT", "NH", "ME", "MD", "DC", "DE", "IN", "KY"];
const CENTRAL = ["TX", "IL", "WI", "MN", "LA", "MO", "AL", "MS", "TN", "OK", "KS", "IA", "AR", "NE", "SD", "ND"];
const MOUNTAIN = ["CO", "UT", "NM", "MT", "WY", "ID"];
const PACIFIC = ["CA", "WA", "OR", "NV"];

const TIMEZONE_BY_STATE: Record<string, string> = {
  ...Object.fromEntries(EASTERN.map((s) => [s, "America/New_York"])),
  ...Object.fromEntries(CENTRAL.map((s) => [s, "America/Chicago"])),
  ...Object.fromEntries(MOUNTAIN.map((s) => [s, "America/Denver"])),
  AZ: "America/Phoenix",
  ...Object.fromEntries(PACIFIC.map((s) => [s, "America/Los_Angeles"])),
  AK: "America/Anchorage",
  HI: "Pacific/Honolulu",
};

export function timezoneForState(stateCode: string): string | null {
  return TIMEZONE_BY_STATE[stateCode.toUpperCase()] ?? null;
}
