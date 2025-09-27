import api from "./api";

export const createOrder = async (data: any) => {
  const res = await api.post("/orders/checkout-admin", data);
  return res.data;
};

export const validatePromoCode = async (code: string) => {
  const res = await api.get(`/promo/validate/${code}`);
  return res.data;
};

export const fetchSingleOrder = async (
  orderId: string,
  includeEvent: boolean = false
) => {
  const res = await api.get(
    `/orders/single-order/${orderId}?includeEvent=${includeEvent}`
  );
  return res.data;
};

export const fetchPaymentModes = async (country: string) => {
  const res = await api.get(`/orders/payment-modes?country=${country}`);
  return res.data;
};

export const processPayment = async (
  orderId: string,
  country: string,
  paymentMode: string
) => {
  const res = await api.post("/payments/checkout-session", {
    gateway: "stripe",
    orderId,
    country,
    paymentMode,
  });
  return res.data; // Ex
};
