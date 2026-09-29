const VARIANT_STYLES = {
  organizer: { dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-100 dark:bg-emerald-900/40" },
  player: { dot: "bg-blue-500", text: "text-blue-700 dark:text-blue-300", bg: "bg-blue-100 dark:bg-blue-900/40" },
} as const;

export default function VerifiedBadge({
  label = "Verified",
  variant = "player",
}: {
  label?: string;
  variant?: keyof typeof VARIANT_STYLES;
}) {
  const styles = VARIANT_STYLES[variant];
  return (
    <span
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${styles.bg} ${styles.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}
