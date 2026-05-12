export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-card)] px-6 py-16 text-center shadow-card">
      {Icon ? <Icon className="mb-3 h-10 w-10 text-[var(--color-text-light)]" /> : null}
      <h3 className="text-base font-semibold text-[var(--color-text)]">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-md text-sm text-[var(--color-text-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
