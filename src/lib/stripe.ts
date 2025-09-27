"use client";

import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe.js once
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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
