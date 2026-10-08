import type { Metadata } from "next";

import { signup } from "@/app/(auth)/actions";
import { AuthForm } from "@/components/app/auth-form";

export const metadata: Metadata = { title: "Sign up · What do I wear today?" };

export default function SignupPage() {
  return (
    <>
      <h1 className="type-display text-4xl sm:text-5xl">Start your wardrobe.</h1>
      <p className="mt-3 text-pretty text-muted-foreground">
        Pick a username and password to save your clothes and plan outfits with friends.
      </p>
      <AuthForm mode="signup" action={signup} />
    </>
  );
}
