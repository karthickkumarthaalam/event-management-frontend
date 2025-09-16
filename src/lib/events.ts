import api from "./api";

export async function fetchEvents(params?: Record<string, any>) {
  const res = await api.get("/events", { params });
  return res.data;
}

export async function fetchEventById(id: string) {
  const res = await api.get(`/events/${id}`);
  return res.data;
}

export async function createEvent(data: any, file?: File) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "end_date" && !value) return;

    if (value !== undefined && value !== null) {
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    }
  });

  if (file) formData.append("logo", file);

  const res = await api.post(`/events`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateEvent(id: string, data: any, file?: File) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "end_date" && !value) return;

    if (value !== undefined && value !== null) {
      if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else {
        formData.append(key, String(value));
      }
    }
  });

  if (file) formData.append("logo", file);

  const res = await api.patch(`/events/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteEvent(id: string) {
  const res = await api.delete(`/events/${id}`);
  return res.data;
}
