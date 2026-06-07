const BASE = import.meta.env.VITE_IMAGE_BASE_URL || "http://localhost:9000"

const INTERNAL_HOSTS = ["minio", "storage"]

export function getImageUrl(url: string): string {
  if (!url) return url

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (INTERNAL_HOSTS.some((h) => url.startsWith(`http://${h}/`) || url.startsWith(`https://${h}/`))) {
      const pathStart = url.indexOf("/", url.indexOf("://") + 3)
      if (pathStart !== -1) {
        return `${BASE}${url.slice(pathStart)}`
      }
    }
    return url
  }

  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url
  }

  return `${BASE}/${url}`
}
