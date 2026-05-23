export type DownloadLink = {
  title: string;
  url: string;
};

export function parseDownloadLinks(value?: string | null): DownloadLink[] {
  if (!value) return [];

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separator = line.indexOf(": ");
      if (separator > -1) {
        return {
          title: line.slice(0, separator).trim() || `Archivo ${index + 1}`,
          url: line.slice(separator + 2).trim()
        };
      }
      return { title: `Archivo ${index + 1}`, url: line };
    })
    .filter((item) => item.url);
}

export function isOrderPaid(order: { status?: string; paidAmount?: number; totalAmount?: number }) {
  return order.status === "PAID" || order.status === "COMPLETED" || Number(order.paidAmount || 0) >= Number(order.totalAmount || 0);
}
