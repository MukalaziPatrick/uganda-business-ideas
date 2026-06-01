// app/api/whatsapp/_lib/messages.ts
import type { Conversation } from '@/lib/supabase/whatsapp';

export function greetingMessage(): string {
  return `Hey 👋 Welcome to Business Yoo.

I help you turn your business idea into a practical plan you can actually start.

What business are you thinking about?`;
}

export function budgetMessage(businessType: string): string {
  return `Great choice 🌱 ${businessType} can work well when it is started the right way.

What is your starting budget?

1. Under 500k UGX
2. 500k – 2M UGX
3. Above 2M UGX`;
}

export function locationMessage(): string {
  return `Nice. Which district are you in?`;
}

export function challengeMessage(): string {
  return `Last thing — what is your biggest challenge right now?

1. Finding customers
2. Getting startup money
3. Not knowing where to begin`;
}

export function pitchMessage(conv: Conversation): string {
  return `Thank you. Here is what I have so far:

*Business idea:* ${conv.business_type}
*Location:* ${conv.location}
*Budget:* ${conv.budget}
*Main challenge:* ${conv.concern}

I can create a *personal business report* for you with:

• a simple step-by-step start plan
• budget breakdown
• what to buy first
• expected costs
• common mistakes to avoid
• practical next steps for ${conv.location}

*Price:* UGX 50,000 once

Would you like me to prepare it for you?`;
}

export function paymentMessage(): string {
  return `Perfect 🙌

Please send *UGX 50,000* to:
*MTN: 0781799221*
Airtel: 0704434457
*Name: Patrick Mukalazi.*

After payment, reply *PAID* and share a screenshot and I'll start preparing your report.`;
}

export function generatingMessage(location: string): string {
  return `Thank you ✅
I've received your payment.

I'm now preparing your report and will send it to you shortly.
Your business plan is being built for your exact situation in ${location}.`;
}

export function deliveryMessage(businessType: string, reportText: string): string {
  return `Here is your personal business report 📋

${reportText}

Good luck with your ${businessType} journey! Feel free to message us anytime.`;
}
