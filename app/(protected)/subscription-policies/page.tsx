// app/(public)/subscription-policies/page.tsx

import Tracker from "@/components/Tracker";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription Policies | SkillUp",
};

export default function SubscriptionPoliciesPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <Tracker />
      <section>
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Subscription Policies
        </h1>
        <p className="text-muted-foreground text-lg">
          Please read our subscription, billing, and refund terms carefully before proceeding with any payment.
        </p>
      </section>

      <section className="space-y-6">
        {[
          {
            title: "1. Subscription Plans",
            body: "SkillUp offers affordable plans starting at ₹50/month. You can upgrade or downgrade anytime from your Subscription page only after your current cycle has ended.",
          },
          {
            title: "2. Free Trial",
            body: "We offer a 3-day free trial with full access to premium features. No credit card is required during trial activation.",
          },
          {
            title: "3. Auto-Renewal",
            body: "Subscriptions auto-renew monthly or quarterly depending on your plan. You'll be auto-charged at the end of each billing cycle unless cancelled.",
          },
          {
            title: "4. Cancellations",
            body: "You may cancel anytime via the Subscription page. Access will continue until the end of your current billing cycle.",
          },
          {
            title: "5. Refunds",
            body: (
              <>
                Refunds are not provided once a payment has been successfully processed. We strongly advise reviewing your plan before payment.
                <br />
                In rare exceptional cases (like accidental double payments), refunds may be considered at the sole discretion of SkillUp. Contact us at{" "}
                <code className="bg-muted px-1 rounded">niche.findyourniche@gmail.com</code>.
              </>
            ),
          },
          {
            title: "6. Billing Support",
            body: "For any questions or billing issues, you may contact us at support@skillup.in. Please allow up to 48 hours for a response.",
          },
        ].map(({ title, body }, i) => (
          <div
            key={i}
            className="border rounded-lg p-5 bg-background/50 hover:shadow transition"
          >
            <h2 className="text-xl font-semibold mb-2">{title}</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">{body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
