"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { ScreenLoader } from "@/components/ui/PageLoader";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { wait } from "@/lib/wait";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const { user, loading, login } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    await wait();
    const result = login(username.trim(), password);
    if (result) {
      setError(result);
      setSubmitting(false);
      return;
    }
    router.replace("/dashboard");
  };

  if (loading) {
    return <ScreenLoader label="Checking session..." />;
  }

  return (
    <AuthShell
      title="MK Laundry Service"
      subtitle="Sign in to the staff operations console."
      footer={
        <p className="text-center text-xs leading-relaxed text-slate-500">
          Demo: <span className="font-semibold text-ink">admin / admin</span>
          <br />
          Also try kwame/manager or efua/staff
        </p>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Username" htmlFor="username" required>
          <Input
            id="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
            disabled={submitting}
          />
        </Field>
        <Field label="Password" htmlFor="password" required>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            disabled={submitting}
          />
        </Field>
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-teal hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        {error ? (
          <p className="text-sm font-medium text-[var(--danger)]">{error}</p>
        ) : null}
        <Button
          type="submit"
          fullWidth
          loading={submitting}
          loadingText="Signing in..."
        >
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
