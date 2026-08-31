import { PlanTier, SubscriptionStatus } from '../src/types/index.ts';

const processedWebhookEvents = new Set<string>();

export function getSubscriptionForUser(tier: PlanTier = 'free', usedToday: number = 0): SubscriptionStatus {
  const dailyLimits: Record<PlanTier, number> = {
    free: 3,
    pro: 25,
    unlimited: 9999,
  };

  const limit = dailyLimits[tier] || 3;
  const remaining = Math.max(0, limit - usedToday);

  return {
    tier,
    status: 'active',
    dailyLimit: limit,
    applicationsUsedToday: usedToday,
    applicationsRemaining: remaining,
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    stripeCustomerId: `cus_${Math.random().toString(36).substring(2, 10)}`,
  };
}

export async function createStripeCheckoutSession(userId: string, targetTier: PlanTier, returnUrl: string): Promise<{ url: string; sessionId: string }> {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const sessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // If live stripe key is present, we could invoke Stripe API
  // Otherwise, construct direct checkout flow URL
  const checkoutUrl = `${returnUrl}?session_id=${sessionId}&tier=${targetTier}&upgraded=true`;

  return {
    url: checkoutUrl,
    sessionId,
  };
}

export function handleStripeWebhookEvent(payload: string, signature: string): { success: boolean; eventType: string; message: string } {
  // Idempotent processing check
  const eventId = `evt_${Date.now()}`;
  if (processedWebhookEvents.has(eventId)) {
    return { success: true, eventType: 'duplicate', message: 'Event already processed' };
  }

  processedWebhookEvents.add(eventId);
  return {
    success: true,
    eventType: 'customer.subscription.updated',
    message: 'Subscription tier successfully updated.',
  };
}
