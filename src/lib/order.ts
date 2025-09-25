import api from "./api";

export const createOrder = async (data: any) => {
  const res = await api.post("/orders/checkout-admin", data);
  return res.data;
};

export const validatePromoCode = async (code: string) => {
  const res = await api.get(`/promo/validate/${code}`);
  return res.data;
};
