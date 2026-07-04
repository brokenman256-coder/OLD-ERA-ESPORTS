export default function TagPills({ tags }: { tags?: string | null }) {
  if (!tags) return null;
  const list = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (list.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
