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

export const fetchOrdersSummary = async (eventId: string) => {
  const res = await api.get(`/orders/summary/${eventId}`);
  return res.data;
};

export const fetchOrderReport = async (
  eventId: string,
  page: number = 1,
  limit: number = 10
) => {
  const res = await api.get(
    `/orders/report?eventId=${eventId}&page=${page}&limit=${limit}`
  );
  return res.data;
};

export const generateToken = async (ticketId: string) => {
  const res = await api.get(`/orders/token/${ticketId}`);
  return res.data;
};
