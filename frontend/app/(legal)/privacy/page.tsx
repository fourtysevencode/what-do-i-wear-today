import type { Metadata } from "next";
import Link from "next/link";

import { CONTACT_EMAIL, CONTACT_URL, LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy · What do I wear today?",
  description: "What What do I wear today? collects, why, who it's shared with and how to remove it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro={
        <p>
          What do I wear today? turns photos of your clothes into a digital wardrobe and suggests outfits from it. This
          page explains what we collect to do that, who else handles it, and how to remove it.
        </p>
      }
    >
      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details.</strong> Your username and password. Passwords are stored only as a one-way
          bcrypt hash, so nobody (including us) can read them. We don&apos;t ask for your email or real name.
        </li>
        <li>
          <strong>Photos you upload or take.</strong> Each photo is sent to our clothing detection service, which
          cuts out each garment. The original photo is processed in memory and not stored. Only the cut-out garment
          images are kept.
        </li>
        <li>
          <strong>Your wardrobe.</strong> For each garment: the cut-out image, its detected type (for example
          &quot;long sleeve top&quot;), its colours, and any name or type you give it.
        </li>
        <li>
          <strong>Outfits.</strong> Outfits you save, including the notes you wrote (such as &quot;dinner with
          friends&quot;) and a short weather summary. We also count how many outfits each account builds.
        </li>
        <li>
          <strong>Friends.</strong> Friend requests you send and accept.
        </li>
        <li>
          <strong>Location, only when you ask for weather.</strong> If you choose &quot;Use My Location&quot;, your
          browser&apos;s coordinates are used once to look up the weather. If you type a place, that name is used
          instead. Neither is saved with your account, apart from the weather summary in outfits you save.
        </li>
        <li>
          <strong>Cookies and local storage.</strong> One cookie keeps you signed in. Your browser also remembers
          your theme and outfit view choice. We don&apos;t use advertising or analytics cookies.
        </li>
      </ul>

      <h2>How we use it</h2>
      <p>
        Only to run the app: to sign you in, show your wardrobe, build outfits, let accepted friends see your
        wardrobe, and keep the service working and free of abuse. We don&apos;t sell your data or use it for
        advertising.
      </p>

      <h2>Who can see your wardrobe</h2>
      <p>
        Your garments are private to you and to people whose friend request you&apos;ve accepted (or who accepted
        yours). Friends can see your wardrobe and build matching outfits with it. Anyone who knows your username can
        send you a friend request.
      </p>

      <h2>Services that handle your data</h2>
      <p>We rely on these providers to run the app. Each only gets what it needs:</p>
      <ul>
        <li>
          <strong>Vercel</strong> hosts the website.
        </li>
        <li>
          <strong>Cloudflare</strong> protects the site. Its Turnstile check runs on sign-up to stop bots.
        </li>
        <li>
          <strong>Neon</strong> hosts the database (your account, wardrobe details, friends and outfits).
        </li>
        <li>
          <strong>Backblaze B2</strong> stores the cut-out garment images in a private bucket. Images are only
          served to you and your friends through short-lived links.
        </li>
        <li>
          <strong>Hugging Face</strong> runs the service that detects garments in your photos.
        </li>
        <li>
          <strong>Google Gemini</strong> builds outfits. It receives your garments&apos; names, types and colours,
          your notes, the weather summary, and, for matching outfits, your friend&apos;s username and garments. It
          does not receive your photos. We use Gemini&apos;s free tier, under which Google may use what&apos;s sent
          to improve its products, so please don&apos;t put personal details in outfit notes.
        </li>
        <li>
          <strong>Open-Meteo</strong> provides weather for the place or coordinates you choose.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        We keep your data while your account exists. Removing a garment deletes its image and details right away,
        and takes it out of any saved outfits. Deleting a saved outfit removes it. Outfit counts are kept without
        your account if your account is removed.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Remove garments, colours and saved outfits at any time in the app.</li>
        <li>Change your username on the Account page.</li>
        <li>
          To delete your whole account or get a copy of your data, email{" "}
          <a href={CONTACT_URL}>{CONTACT_EMAIL}</a> with your username. Never send us your password.
        </li>
      </ul>

      <h2>Security</h2>
      <p>
        Passwords are hashed, the session cookie is encrypted and HTTP-only, images sit in a private bucket, and
        traffic is encrypted with HTTPS. No system is perfectly secure, so please use a password you don&apos;t use
        anywhere else.
      </p>

      <h2>Children</h2>
      <p>The app isn&apos;t meant for children under 13, and we don&apos;t knowingly collect their data.</p>

      <h2>Contact</h2>
      <p>
        Questions about your data or this policy? Email <a href={CONTACT_URL}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>Changes</h2>
      <p>
        If we change this policy, we&apos;ll update the date at the top. If a change is significant, we&apos;ll
        tell you in the app. See also our <Link href="/terms">Terms of Service</Link>.
      </p>
    </LegalPage>
  );
}
