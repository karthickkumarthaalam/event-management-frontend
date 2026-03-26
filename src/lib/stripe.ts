import { loadStripe } from "@stripe/stripe-js";
import { env } from "@/lib/env";

// Initialize Stripe.js once
export const stripePromise = loadStripe(env.stripePublishableKey);

/**
 * Redirects user to Stripe checkout
 * @param sessionId Stripe checkout session ID
 */
export const redirectToStripeCheckout = async (sessionId: string) => {
  const stripe = await stripePromise;
  if (!stripe) throw new Error("Stripe failed to load");
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) throw error;
};
