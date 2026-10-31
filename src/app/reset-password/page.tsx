"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { ScreenLoader } from "@/components/ui/PageLoader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { ApiError, api } from "@/lib/api-client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get("username") || "";
  const tokenParam = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const tokenValid = Boolean(usernameParam && tokenParam);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!tokenValid) {
      setError("This reset link is invalid or expired.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        json: {
          username: usernameParam,
          token: tokenParam,
          password,
        },
      });
      setDone(true);
      window.setTimeout(() => router.replace("/login"), 1200);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset password.");
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle={
        usernameParam
          ? `Choose a new password for ${usernameParam}.`
          : "Choose a new password using a valid reset link."
      }
      footer={
        <p className="text-center text-sm text-slate-500">
          <Link href="/login" className="font-semibold text-teal hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      {!tokenValid && !done ? (
        <div className="space-y-4">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[var(--danger)]">
            Reset link is missing, invalid, or expired. Request a new one.
          </p>
          <Link href="/forgot-password">
            <Button fullWidth>Request new link</Button>
          </Link>
        </div>
      ) : done ? (
        <p className="rounded-xl border border-teal/20 bg-teal-soft px-4 py-3 text-sm text-ink">
          Password updated. Redirecting to sign in...
        </p>
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="New password" htmlFor="password" required>
            <PasswordInput
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={submitting}
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirm" required>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
              disabled={submitting}
            />
          </Field>
          {error ? (
            <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
          ) : null}
          <Button
            type="submit"
            fullWidth
            loading={submitting}
            loadingText="Updating..."
          >
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ScreenLoader label="Loading reset form..." />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
