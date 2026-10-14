import type { Metadata } from "next";

import { login } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/app/auth-form";

export const metadata: Metadata = { title: "Log in · What do I wear today?" };

export default function LoginPage() {
  return (
    <>
      <h1 className="type-display">Welcome back.</h1>
      <p className="mt-4 text-pretty text-muted-foreground">Log in to see your wardrobe.</p>
      <AuthForm mode="login" action={login} />
    </>
  );
}
