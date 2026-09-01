export function effectiveRole(role) {
  if (role === "admin" || role === "owner") return "owner";
  if (role === "manager") return "manager";
  if (role === "cashier") return "cashier";
  if (role === "viewer") return "viewer";
  return "cashier";
}

const ACCESS = {
  "/home": ["owner", "manager", "cashier", "viewer"],
  "/pos": ["owner", "manager", "cashier", "viewer"],
  "/customers": ["owner", "manager", "cashier"],
  "/products": ["owner", "manager"],
  "/vendors": ["owner", "manager"],
  "/invoices": ["owner", "manager"],
  "/dashboard": ["owner", "manager", "cashier", "viewer"],
  "/transactions": ["owner", "manager"],
  "/users": ["owner"],
  "/settings": ["owner"],
};

export function canAccess(path, role) {
  const eff = effectiveRole(role);
  const allowed = ACCESS[path];
  if (!allowed) return true;
  return allowed.includes(eff);
}

export function roleLabel(role) {
  const e = effectiveRole(role);
  return e.charAt(0).toUpperCase() + e.slice(1);
}

export function roleBadgeColor(role) {
  const e = effectiveRole(role);
  return {
    owner: "bg-amber-100 text-amber-700",
    manager: "bg-blue-100 text-blue-700",
    cashier: "bg-emerald-100 text-emerald-700",
    viewer: "bg-slate-200 text-slate-600",
  }[e];
}

export function isOwner(role) {
  return effectiveRole(role) === "owner";
}

export function isManagerUp(role) {
  const e = effectiveRole(role);
  return e === "owner" || e === "manager";
}