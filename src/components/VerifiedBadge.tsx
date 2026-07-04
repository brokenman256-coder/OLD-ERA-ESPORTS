export default function VerifiedBadge({ label = "Verified" }: { label?: string }) {
  return (
    <span
      title={label}
      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
        <path
          fillRule="evenodd"
          d="M10 1.5l2.09 1.26 2.43-.3 1.03 2.22 2.22 1.03-.3 2.43L19 10l-1.53 2.09.3 2.43-2.22 1.03-1.03 2.22-2.43-.3L10 18.5l-2.09-1.53-2.43.3-1.03-2.22-2.22-1.03.3-2.43L1.5 10l1.53-2.09-.3-2.43 2.22-1.03L6 2.23l2.43.3L10 1.5zm3.28 6.53a.75.75 0 00-1.06-1.06L9 10.19 7.28 8.47a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l3.75-3.75z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </span>
  );
}
