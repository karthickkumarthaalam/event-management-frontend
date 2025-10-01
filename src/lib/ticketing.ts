import api from "./api";

export async function fetchTicketsByEvent(eventId: string) {
  const res = await api.get(`/tickets/events/${eventId}`);
  return res.data;
}

export async function fetchTicketById(id: string) {
  const res = await api.get(`/tickets/${id}`);
  return res.data;
}

export async function createTicket(eventId: string, data: any) {
  const res = await api.post(`/tickets/${eventId}`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function updateTicket(id: string, data: any) {
  const res = await api.patch(`/tickets/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function deleteTicket(id: string) {
  const res = await api.delete(`/tickets/${id}`);
  return res.data;
}

export async function fetchTaxes(eventId: string) {
  const res = await api.get(`/taxes/${eventId}`);
  return res.data;
}

export async function createTax(data: any) {
  const res = await api.post("/taxes", data);
  return res.data;
}

export async function updateTax(id: string, data: any) {
  const res = await api.patch(`/taxes/${id}`, data);
  return res.data;
}

export async function deleteTax(id: string) {
  const res = await api.delete(`/taxes/${id}`);
  return res.data;
}

export async function updateStatus(id: string, isActive: boolean) {
  const res = await api.patch(`/taxes/status/${id}`, isActive);
  return res.data;
}

export async function createAddon(eventId: string, data: any) {
  const res = await api.post(`/addon/${eventId}`, data);
  return res.data;
}

export async function updateAddon(id: string, data: any) {
  const res = await api.patch(`/addon/${id}`, data);
  return res.data;
}

export async function deleteAddon(id: string) {
  const res = await api.delete(`/addon/${id}`);
  return res.data;
}

export async function fetchAddons(eventId: string) {
  const res = await api.get(`/addon/${eventId}`);
  return res.data;
}

export async function fetchAddonById(id: string) {
  const res = await api.get(`/addon/${id}`);
  return res.data;
}
