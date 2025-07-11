// app/(public)/help-center/page.tsx
'use client';

import Link from 'next/link';

export default function HelpCenterPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Help Center</h1>
      <p className="text-muted-foreground">We're here to assist you</p>

      <div className="space-y-4 text-sm leading-6">
        <p>
          If you're facing issues with your subscription, payment, or workspace, please try the following:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Refresh the page or log out and log back in</li>
          <li>Check your billing status under <code>/workspace/[id]/subscription</code></li>
          <li>Visit our <Link className="underline" href="/subscription-policies">Subscription Policies</Link></li>
          <li>Email us at <Link href="mailto:support.skillup@gmail.com" className="underline">support.skillup@gmail.com</Link></li>
        </ul>

        <p className="pt-4">
          If you're unsure about something, check the <Link href="/faq" className="underline">FAQ</Link>.
        </p>
      </div>
    </div>
  );
}
