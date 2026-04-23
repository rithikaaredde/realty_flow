export const API_URL = "http://localhost:3001";

export const getProperties = async (query: string) => {
  const res = await fetch(`${API_URL}/properties?${query}`);
  return res.json();
};

export const getPropertyById = async (id: string) => {
  const res = await fetch(`${API_URL}/properties/${id}`);
  return res.json();
};