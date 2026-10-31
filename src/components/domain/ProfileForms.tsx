"use client";

import { useSession } from "@/components/providers/SessionProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import type { Employee } from "@/data/types";
import { ApiError, api } from "@/lib/api-client";
import { FormEvent, useEffect, useState } from "react";

export function UpdateProfileForm() {
  const { user, refreshUser } = useSession();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setPhone(user.phone);
    setEmail(user.email);
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api<{ employee: Employee }>(`/api/employees/${user.id}`, {
        method: "PATCH",
        json: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
      });
      await refreshUser();
      showToast("Profile updated", "success");
      setConfirmOpen(false);
    } catch (error) {
      showToast(
        error instanceof ApiError ? error.message : "Could not update profile",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setConfirmOpen(true);
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-line bg-white p-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-ink">Update profile</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keep your staff contact details current.
          </p>
        </div>
        <Field label="Full name" htmlFor="profile-name" required>
          <Input
            id="profile-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Phone" htmlFor="profile-phone">
            <Input
              id="profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </Field>
          <Field label="Email" htmlFor="profile-email">
            <Input
              id="profile-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </Field>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Username">
            <Input value={user?.username || ""} disabled />
          </Field>
          <Field label="Role">
            <Input value={user?.role || ""} disabled />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save profile</Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={saveProfile}
        title="Save profile changes?"
        description="Your name and contact details will be updated for this staff account."
        confirmLabel="Save changes"
        tone="primary"
        loading={saving}
      />
    </>
  );
}

export function ChangePasswordForm() {
  const { user } = useSession();
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyPasswordChange = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await api(`/api/employees/${user.id}/password`, {
        method: "PATCH",
        json: { currentPassword, nextPassword },
      });
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setError("");
      setConfirmOpen(false);
      showToast("Password changed", "success");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Could not change password";
      setError(message);
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    if (nextPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setConfirmOpen(true);
  };

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-2xl border border-line bg-white p-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-ink">Change password</h2>
          <p className="mt-1 text-sm text-slate-500">
            Use a password only you know.
          </p>
        </div>
        <Field label="Current password" htmlFor="current-password" required>
          <PasswordInput
            id="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="New password" htmlFor="new-password" required>
            <PasswordInput
              id="new-password"
              value={nextPassword}
              onChange={(event) => setNextPassword(event.target.value)}
              required
            />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm-password" required>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </Field>
        </div>
        {error ? (
          <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
        ) : null}
        <div className="flex justify-end">
          <Button type="submit">Update password</Button>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={applyPasswordChange}
        title="Change password?"
        description="You will need this new password the next time you sign in."
        confirmLabel="Change password"
        tone="danger"
        loading={saving}
      />
    </>
  );
}
