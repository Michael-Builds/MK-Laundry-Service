"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { requestPasswordReset } from "@/lib/store";
import { wait } from "@/lib/wait";
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
    await wait();
    const result = requestPasswordReset(username.trim());
    setSubmitting(false);
    if (!result) {
      setError("No active staff account found for that username.");
      setResetPath(null);
      return;
    }
    setResetPath(
      `/reset-password?username=${encodeURIComponent(result.username)}&token=${encodeURIComponent(result.token)}`,
    );
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your staff username. In this demo we show a reset link instead of sending email."
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
