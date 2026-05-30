const BASE_URL = import.meta.env.VITE_API_URL || ""

export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`
  const res = await fetch(fullUrl, options)
  const body = [204, 205, 304].includes(res.status) ? null : await res.text()
  return body ? JSON.parse(body) : ({} as T)
}
