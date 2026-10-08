import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT_EMAIL, CONTACT_URL, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service · What do I wear today?",
  description: "The rules for using What do I wear today?.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      intro={
        <p>
          These terms are the agreement between you and What do I wear today? (&quot;the app&quot;, &quot;we&quot;).
          By creating an account or using the app, you agree to them and to our{" "}
          <Link href="/privacy" className="font-medium text-foreground underline decoration-foreground/25 underline-offset-4 hover:decoration-pop">
            Privacy Policy
          </Link>
          .
        </p>
      }
    >
      <h2>Your account</h2>
      <ul>
        <li>You must be at least 13 years old to use the app.</li>
        <li>
          Keep your password to yourself. You&apos;re responsible for what happens on your account, so pick a
          password you don&apos;t use anywhere else.
        </li>
        <li>One person per account. Don&apos;t create accounts with scripts or pretend to be someone else.</li>
        <li>Your username is visible to anyone you add as a friend, and anyone can use it to send you a request.</li>
      </ul>

      <h2>What you upload</h2>
      <p>
        Your photos and wardrobe stay yours. You give us permission to store, process and display them only as
        needed to run the app. That includes sending them to the services listed in the Privacy Policy, and showing
        your wardrobe to friends you accept.
      </p>
      <p>Only upload photos you have the right to use. Don&apos;t upload:</p>
      <ul>
        <li>Photos of other people without their permission.</li>
        <li>Nudity, sexual content, or anything illegal, hateful or harassing.</li>
        <li>Anything that isn&apos;t clothing, if you&apos;re trying to misuse the service.</li>
      </ul>
      <p>We may remove content or close accounts that break these rules.</p>

      <h2>Fair use</h2>
      <p>
        Don&apos;t try to break, overload or get around the app&apos;s security. That includes scraping, automated
        sign-ups, abusing the outfit builder, or accessing other people&apos;s wardrobes without being their friend.
      </p>

      <h2>AI suggestions</h2>
      <p>
        Outfits are suggested by AI (Google Gemini) and garments are detected automatically, so labels, colours and
        suggestions can be wrong. They&apos;re ideas, not professional advice. Check the weather yourself before
        heading out.
      </p>

      <h2>The service</h2>
      <p>
        The app is a free, personal project provided &quot;as is&quot;, without warranties of any kind. It may be
        slow, change, go offline, or shut down. If it shuts down, we&apos;ll try to give notice. We aren&apos;t
        liable for lost data or any indirect losses from using it, to the extent the law allows. Keep your own
        copies of photos that matter to you.
      </p>

      <h2>Ending your account</h2>
      <p>
        You can stop using the app at any time and ask us to delete your account by emailing{" "}
        <a href={CONTACT_URL}>{CONTACT_EMAIL}</a>. We may suspend accounts that break these terms.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. We&apos;ll change the date at the top, and tell you in the app if a change is
        significant. If you keep using the app after a change, you accept the new terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email <a href={CONTACT_URL}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
