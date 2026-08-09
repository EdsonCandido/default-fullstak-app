/**
 * Soft-delete tombstones free the original email for reuse while keeping
 * a reversible encoding so restore and list can show the real address.
 */

const TOMBSTONE_HOST = "soft-delete.local";

export function toSoftDeletedEmail(userId: string, email: string) {
  const encoded = Buffer.from(email, "utf8").toString("base64url");
  return `deleted+${userId}.${encoded}@${TOMBSTONE_HOST}`;
}

export function fromSoftDeletedEmail(email: string): string | null {
  const match = email.match(
    new RegExp(`^deleted\\+([^.]+)\\.([^@]+)@${TOMBSTONE_HOST.replace(/\./g, "\\.")}$`),
  );
  if (!match?.[2]) {
    return null;
  }
  try {
    return Buffer.from(match[2], "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function displayUserEmail(email: string, deletedAt: Date | null) {
  if (!deletedAt) {
    return email;
  }
  return fromSoftDeletedEmail(email) ?? email;
}
