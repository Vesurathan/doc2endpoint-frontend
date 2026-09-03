import client from "./client";

/**
 * Start a Stripe Checkout session for the given plan ("premium" | "pro").
 * Returns { url } — redirect the user there.
 */
export const createCheckoutSession = (plan) =>
  client.post("/billing/create-checkout-session", { plan });

/**
 * Open the Stripe Customer Portal so the user can manage / cancel their subscription.
 * Returns { url } — redirect the user there.
 */
export const createPortalSession = () =>
  client.post("/billing/portal-session");

/**
 * Fetch current billing status (plan, has_subscription).
 */
export const getBillingStatus = () =>
  client.get("/billing/status");

/**
 * Fetch rich subscription details for the Billing page
 * (status, renewal date, trial end, amount, cancel_at_period_end).
 */
export const getSubscriptionDetails = () =>
  client.get("/billing/subscription-details");
