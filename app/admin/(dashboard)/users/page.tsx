import { updateUser } from "@/actions/admin/users";
import { ActionButton } from "@/components/admin/action-button";
import { AdminHeader, Card, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { CreateUserForm, ResetPasswordForm } from "@/components/admin/user-forms";
import { requirePage, ROLE_LABELS } from "@/lib/auth/session";
import { listUsers } from "@/lib/data/admin";

// Reads the session and live data on every request; blocking navigation is intended.
export const instant = false;

export const metadata = { title: "Admin users" };

const ROLES = ["super_admin", "admin", "editor"] as const;

export default async function UsersPage() {
  const me = await requirePage("users");
  const rows = await listUsers();

  return (
    <>
      <AdminHeader
        title="Admin users"
        description="Super Admins manage accounts. Admins manage content, applications and settings. Editors manage Events, Projects and Team."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Table>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <Td>
                  <p className="font-medium">
                    {u.name} {u.id === me.id && <span className="text-xs text-muted">(you)</span>}
                  </p>
                  <p className="text-xs text-muted">{u.email}</p>
                </Td>
                <Td>
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((r) =>
                      r === u.role ? (
                        <StatusBadge key={r} status="current" label={ROLE_LABELS[r]} />
                      ) : (
                        <ActionButton key={r} action={updateUser} fields={{ id: u.id, role: r }} confirm={`Change ${u.name}'s role to ${ROLE_LABELS[r]}?`}>
                          {ROLE_LABELS[r]}
                        </ActionButton>
                      ),
                    )}
                  </div>
                </Td>
                <Td>
                  <StatusBadge status={u.active ? "accepted" : "archived"} label={u.active ? "Active" : "Deactivated"} />
                </Td>
                <Td>
                  <div className="flex flex-wrap items-start justify-end gap-1.5">
                    <ResetPasswordForm id={u.id} />
                    {u.id !== me.id && (
                      <ActionButton
                        action={updateUser}
                        fields={{ id: u.id, active: String(!u.active) }}
                        tone={u.active ? "danger" : "default"}
                        confirm={u.active ? `Deactivate ${u.name}? They will be signed out immediately.` : undefined}
                      >
                        {u.active ? "Deactivate" : "Reactivate"}
                      </ActionButton>
                    )}
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Card title="Add admin account">
          <CreateUserForm />
        </Card>
      </div>
    </>
  );
}
