const STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-300",
  APPROVED: "bg-green-100 text-green-800 border-green-300",
  REJECTED: "bg-red-100 text-red-800 border-red-300",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        STYLES[status] ?? "bg-neutral-100 text-neutral-700 border-neutral-300"
      }`}
    >
      {status}
    </span>
  );
}
