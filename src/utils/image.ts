export function getImageUrl(url: string): string {
  if (!url) return url
  try {
    const parsed = new URL(url)
    if (parsed.hostname === "minio" || parsed.hostname === "storage") {
      const base = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:9000"
      return `${base}${parsed.pathname}${parsed.search}${parsed.hash}`
    }
  } catch {}
  return url
}
