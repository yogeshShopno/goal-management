import { Loader2 } from 'lucide-react';

export default function Loader({ fullPage, inline }) {
  const icon = <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" aria-hidden />;

  if (inline) {
    return <span className="inline-flex items-center justify-center">{icon}</span>;
  }

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--color-text)]/10 backdrop-blur-[2px]">
        <div className="rounded-lg bg-[var(--color-card)] p-6 shadow-card">{icon}</div>
      </div>
    );
  }

  return <div className="flex justify-center py-8">{icon}</div>;
}
