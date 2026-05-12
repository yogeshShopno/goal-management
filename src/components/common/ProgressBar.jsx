import { useEffect, useState } from 'react';

const sizes = {
  sm: 'h-1.5',
  md: 'h-3',
  lg: 'h-2.5',
};

export default function ProgressBar({ value = 0, size = 'md', showLabel = false, gradient = false }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(Math.min(100, Math.max(0, value))));
    return () => cancelAnimationFrame(id);
  }, [value]);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-1 flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>Progress</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div
        className={`w-full overflow-hidden rounded-pill bg-[var(--color-progress-track)] ${sizes[size] ?? sizes.md}`}
      >
        <div
          className={`${sizes[size] ?? sizes.md} rounded-pill transition-[width] duration-500 ease-out ${
            gradient
              ? 'bg-gradient-to-r from-[var(--color-primary)] to-[#60a5fa]'
              : 'bg-[var(--color-primary)]'
          }`}
          style={{ width: `${w}%` }}
        />
      </div>
    </div>
  );
}
