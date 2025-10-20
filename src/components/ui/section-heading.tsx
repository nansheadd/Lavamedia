import clsx from 'clsx';

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={clsx('space-y-3', align === 'center' && 'text-center', className)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
      {description ? <p className="text-base text-slate-600 dark:text-slate-300">{description}</p> : null}
    </div>
  );
}
