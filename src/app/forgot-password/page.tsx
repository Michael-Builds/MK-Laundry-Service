"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { ApiError, api } from "@/lib/api-client";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [resetPath, setResetPath] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const result = await api<{
        ok: boolean;
        token?: string;
        username?: string;
      }>("/api/auth/forgot-password", {
        method: "POST",
        json: { username: username.trim() },
      });

      if (result.token && result.username) {
        setResetPath(
          `/reset-password?username=${encodeURIComponent(result.username)}&token=${encodeURIComponent(result.token)}`,
        );
      } else {
        setResetPath(null);
        setError("If that account exists, a reset link will be available.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not start reset.");
      setResetPath(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your staff username to generate a reset link."
      footer={
        <p className="text-center text-sm text-slate-500">
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-teal hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Username" htmlFor="username" required>
          <Input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="admin"
            required
            disabled={submitting}
          />
        </Field>
        {error ? (
          <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
        ) : null}
        {resetPath ? (
          <div className="rounded-xl border border-teal/20 bg-teal-soft px-4 py-3 text-sm text-ink">
            <p className="font-semibold">Reset link ready</p>
            <Link href={resetPath} className="mt-1 block break-all text-teal underline">
              Continue to reset password
            </Link>
          </div>
        ) : null}
        <Button
          type="submit"
          fullWidth
          loading={submitting}
          loadingText="Sending..."
        >
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
