// app/(public)/faq/page.tsx
'use client';

export default function FAQPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>

      <div className="space-y-4 text-sm leading-6">
        <div>
          <h2 className="font-semibold text-lg">💡 What is SkillUp?</h2>
          <p>SkillUp is a platform to help you gain real-world experience through collaborative projects and personalized learning.</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">💰 How much does it cost?</h2>
          <p>We charge ₹50/month or ₹120/quarter. You can cancel anytime.</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">🧾 Will I get a receipt?</h2>
          <p>Yes! After payment, you will receive a confirmation email with your invoice attached.</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">🔁 Can I get a refund?</h2>
          <p>We do not offer refunds once a payment is processed. Please review our <a href="/subscription-policies" className="underline">refund policy</a>.</p>
        </div>

        <div>
          <h2 className="font-semibold text-lg">📧 How can I contact support?</h2>
          <p>Send us an email at <a href="mailto:niche.findyourniche@gmail.com" className="underline">niche.findyourniche@gmail.com</a>. We usually reply within 24 hours.</p>
        </div>
      </div>
    </div>
  );
}
