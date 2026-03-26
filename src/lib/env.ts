export const env = {
  baseApi:
    import.meta.env.VITE_BASE_API ??
    import.meta.env.VITE_NEXT_PUBLIC_BASE_API ??
    "http://localhost:3000",
  stripePublishableKey:
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ??
    import.meta.env.VITE_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    "",
};
