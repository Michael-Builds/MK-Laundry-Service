"use client";

import { Topbar } from "@/components/layout/Topbar";
import { useToast } from "@/components/providers/ToastProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataTable, type DataTableColumn } from "@/components/ui/DataTable";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageLoader } from "@/components/ui/PageLoader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Select } from "@/components/ui/Select";
import type { Employee, Role } from "@/data/types";
import { useBootLoading } from "@/hooks/useBootLoading";
import { ApiError, api } from "@/lib/api-client";
import { UserPlus, Users } from "lucide-react";
import { SubmitEvent, useCallback, useMemo, useState } from "react";

const roleBadge: Record<Role, string> = {
  Administrator: "border border-ink bg-ink text-white",
  Manager: "border border-teal/20 bg-teal-soft text-teal",
  Employee: "border border-line bg-slate-100 text-slate-600",
};

export default function EmployeesPage() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Employee");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pendingToggle, setPendingToggle] = useState<Employee | null>(null);
  const [creating, setCreating] = useState(false);
  const [toggling, setToggling] = useState(false);

  const boot = useCallback(async () => {
    const data = await api<{ employees: Employee[] }>("/api/employees");
    setEmployees(data.employees);
  }, []);
  const ready = useBootLoading(boot);

  const onCreate = async (event: SubmitEvent) => {
    event.preventDefault();
    setCreating(true);
    try {
      const data = await api<{ employee: Employee }>("/api/employees", {
        method: "POST",
        json: {
          fullName: fullName.trim(),
          username: username.trim(),
          password,
          role,
          phone: phone.trim(),
          email: email.trim(),
        },
      });
      setEmployees((current) => [data.employee, ...current]);
      setOpen(false);
      setFullName("");
      setUsername("");
      setPassword("");
      setRole("Employee");
      setPhone("");
      setEmail("");
      showToast("Employee added", "success");
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not add employee",
        "error",
      );
    } finally {
      setCreating(false);
    }
  };

  const confirmToggle = async () => {
    if (!pendingToggle) return;
    setToggling(true);
    try {
      const data = await api<{ employee: Employee }>(
        `/api/employees/${pendingToggle.id}`,
        {
          method: "PATCH",
          json: { active: !pendingToggle.active },
        },
      );
      setEmployees((current) =>
        current.map((employee) =>
          employee.id === data.employee.id ? data.employee : employee,
        ),
      );
      showToast(
        pendingToggle.active ? "Employee deactivated" : "Employee activated",
        "success",
      );
      setPendingToggle(null);
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not update employee",
        "error",
      );
    } finally {
      setToggling(false);
    }
  };

  const columns = useMemo<DataTableColumn<Employee>[]>(
    () => [
      {
        id: "staff",
        header: "Staff",
        cell: (employee) => (
          <div className="flex items-center gap-3">
            <Avatar name={employee.fullName} size="sm" />
            <span className="font-semibold text-ink">{employee.fullName}</span>
          </div>
        ),
      },
      {
        id: "username",
        header: "Username",
        cell: (employee) => employee.username,
      },
      {
        id: "role",
        header: "Role",
        cell: (employee) => (
          <Badge className={roleBadge[employee.role]}>{employee.role}</Badge>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        hideOnMobile: true,
        cell: (employee) => (
          <div>
            <p>{employee.phone || "-"}</p>
            <p className="text-xs text-slate-500">{employee.email || "-"}</p>
          </div>
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (employee) => (
          <Badge
            className={
              employee.active
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-line bg-slate-100 text-slate-500"
            }
          >
            {employee.active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "action",
        header: "Action",
        headerClassName: "text-right",
        className: "text-right",
        cell: (employee) => (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPendingToggle(employee)}
            disabled={employee.username === "admin"}
          >
            {employee.active ? "Deactivate" : "Activate"}
          </Button>
        ),
      },
    ],
    [],
  );

  if (!ready) {
    return (
      <div>
        <Topbar title="Employees" eyebrow="Team" />
        <PageLoader label="Loading employees..." compact />
      </div>
    );
  }

  return (
    <div>
      <Topbar
        title="Employees"
        eyebrow="Team"
        actions={
          <Button
            size="sm"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => setOpen(true)}
          >
            Add employee
          </Button>
        }
      />

      <DataTable
        data={employees}
        columns={columns}
        getRowId={(employee) => employee.id}
        emptyIcon={<Users className="h-5 w-5" />}
        emptyTitle="No employees yet"
        emptyDescription="Add your first staff member to get started."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add employee"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="add-employee-form"
              loading={creating}
              loadingText="Saving..."
            >
              Save employee
            </Button>
          </>
        }
      >
        <form id="add-employee-form" className="space-y-3" onSubmit={onCreate}>
          <Field label="Full name" htmlFor="emp-name" required>
            <Input
              id="emp-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="e.g. Ama Mensah"
              required
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Username" htmlFor="emp-username" required>
              <Input
                id="emp-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="e.g. ama"
                required
              />
            </Field>
            <Field label="Password" htmlFor="emp-password" required>
              <PasswordInput
                id="emp-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 4 characters"
                required
              />
            </Field>
          </div>
          <Field label="Role" htmlFor="emp-role">
            <Select
              id="emp-role"
              value={role}
              onChange={(value) => setRole(value as Role)}
              options={[
                { value: "Employee", label: "Employee" },
                { value: "Manager", label: "Manager" },
                { value: "Administrator", label: "Administrator" },
              ]}
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Phone" htmlFor="emp-phone">
              <Input
                id="emp-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0XX XXX XXXX"
              />
            </Field>
            <Field label="Email" htmlFor="emp-email">
              <Input
                id="emp-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@mklaundry.gh"
              />
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        onClose={() => setPendingToggle(null)}
        onConfirm={confirmToggle}
        title={
          pendingToggle?.active ? "Deactivate employee?" : "Activate employee?"
        }
        description={
          pendingToggle
            ? pendingToggle.active
              ? `${pendingToggle.fullName} will lose access until activated again.`
              : `${pendingToggle.fullName} will be able to sign in again.`
            : null
        }
        confirmLabel={pendingToggle?.active ? "Deactivate" : "Activate"}
        tone={pendingToggle?.active ? "danger" : "primary"}
        loading={toggling}
      />
    </div>
  );
}
