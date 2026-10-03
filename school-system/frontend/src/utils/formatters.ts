export const formatKES = (
  amount: number,
  opts: { compact?: boolean } = {},
): string => {
  if (opts.compact) {
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000)
      return `KES ${(amount / 1_000_000_000).toFixed(2)}B`;
    if (abs >= 1_000_000) return `KES ${(amount / 1_000_000).toFixed(2)}M`;
    if (abs >= 1_000) return `KES ${(amount / 1_000).toFixed(1)}K`;
  }
  return `KES ${amount.toLocaleString("en-KE", { maximumFractionDigits: 0 })}`;
};

export const formatNumber = (n: number): string =>
  n.toLocaleString("en-KE", { maximumFractionDigits: 0 });

export const formatPercent = (n: number, digits = 1): string =>
  `${n.toFixed(digits)}%`;

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return formatDate(iso);
};

export const initials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

export const truncate = (s: string, max = 60): string =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;
