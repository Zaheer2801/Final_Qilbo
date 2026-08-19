import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { roleLabel, roleBadgeColor } from "@/lib/permissions";

const ROLE_OPTIONS = ["manager", "cashier", "viewer"];
const empty = { full_name: "", email: "", phone: "", role: "cashier", active: true, manager_pin: "" };

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setUsers(await base44.entities.User.list("-created_date", 100));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const submit = async (data) => {
    if (editing?.id) {
      await base44.entities.User.update(editing.id, { role: data.role, phone: data.phone || undefined, active: data.active, manager_pin: data.manager_pin || undefined });
    } else {
      await base44.users.inviteUser(data.email, "user");
      try {
        const list = await base44.entities.User.list("-created_date", 100);
        const u = list.find((x) => x.email === data.email);
        if (u) await base44.entities.User.update(u.id, { role: data.role, phone: data.phone || undefined });
      } catch {}
    }
    setEditing(null);
    await load();
  };

  const remove = async (u) => {
    if (u.id === me?.id) { alert("You can't remove yourself."); return; }
    if (!confirm(`Remove ${u.full_name || u.email}?`)) return;
    await base44.entities.User.delete(u.id);
    await load();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
          <p className="text-sm text-slate-400">{users.length} team members</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
          <Plus className="w-4 h-4" /> Add user
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Role</th>
                  <th className="text-left px-4 py-3 font-medium">Active</th>
                  <th className="text-left px-4 py-3 font-medium">Last login</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.full_name || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3"><span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeColor(u.role)}`}>{roleLabel(u.role)}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${u.active === false ? "text-red-500" : "text-emerald-600"}`}>{u.active === false ? "Inactive" : "Active"}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditing(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(u)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && <UserForm initial={editing} onSave={submit} onClose={() => setEditing(null)} />}
    </div>
  );
}

function UserForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true);
    try { await onSave(form); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">{initial.id ? "Edit user" : "Add user"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {!initial.id && (
            <>
              <Field label="Name"><input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} className="form-input" /></Field>
              <Field label="Email *"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="form-input" /></Field>
            </>
          )}
          <Field label="Phone"><input value={form.phone || ""} onChange={(e) => set("phone", e.target.value)} className="form-input" /></Field>
          <Field label="Role">
            <select value={form.role} onChange={(e) => set("role", e.target.value)} className="form-input">
              {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Manager PIN">
            <input value={form.manager_pin || ""} onChange={(e) => set("manager_pin", e.target.value)} className="form-input" placeholder="4-digit PIN for void/refund" />
          </Field>
          {initial.id && (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={form.active !== false} onChange={(e) => set("active", e.target.checked)} className="rounded" /> Active
            </label>
          )}
          {!initial.id && <p className="text-xs text-slate-400">An invite email is sent via Base44; the user sets their own password. Role is applied after they join.</p>}
        </div>
        <div className="p-5 border-t border-slate-100 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600">Cancel</button>
          <button onClick={submit} disabled={busy || (!initial.id && !form.email)} className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 disabled:opacity-40">
            {busy ? "Saving…" : initial.id ? "Save" : "Send invite"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}