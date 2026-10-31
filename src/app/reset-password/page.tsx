"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { ScreenLoader } from "@/components/ui/PageLoader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import {
  clearResetToken,
  getResetToken,
  resetEmployeePassword,
} from "@/lib/store";
import { wait } from "@/lib/wait";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get("username") || "";
  const tokenParam = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const stored = getResetToken();
    const valid = Boolean(
      stored &&
        stored.expiresAt >= Date.now() &&
        stored.token === tokenParam &&
        stored.username.toLowerCase() === usernameParam.toLowerCase(),
    );
    setTokenValid(valid);
    setChecking(false);
  }, [tokenParam, usernameParam]);

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
    await wait();
    const result = resetEmployeePassword(usernameParam, password);
    if (result) {
      setError(result);
      setSubmitting(false);
      return;
    }

    clearResetToken();
    setDone(true);
    window.setTimeout(() => router.replace("/login"), 1200);
  };

  if (checking) {
    return <ScreenLoader label="Checking reset link..." />;
  }

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
      ) : (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Field label="New password" htmlFor="password" required>
            <PasswordInput
              id="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={submitting || done}
            />
          </Field>
          <Field label="Confirm password" htmlFor="confirm" required>
            <PasswordInput
              id="confirm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
              disabled={submitting || done}
            />
          </Field>
          {error ? (
            <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
          ) : null}
          {done ? (
            <p className="text-sm font-medium text-teal">
              Password updated. Redirecting to sign in...
            </p>
          ) : null}
          <Button
            type="submit"
            fullWidth
            loading={submitting}
            loadingText="Updating..."
            disabled={done}
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
