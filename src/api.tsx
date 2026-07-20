export const CALL_API = import.meta.env.VITE_CALL_API;

export async function fetchCallList() {
  const res = await fetch(CALL_API);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchCallById(id: string) {
  const res = await fetch(`${CALL_API}/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}