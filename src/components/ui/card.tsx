import clsx from 'clsx';
import type { ElementType, HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  as?: ElementType;
};

export function Card({ as: Component = 'article', className, ...props }: CardProps) {
  const SafeComponent = Component as ElementType;
  return (
    <SafeComponent
      className={clsx(
        'group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-lg focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      {...props}
    />
  );
}

export function CardTitle(props: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={clsx('text-xl font-semibold text-slate-900 dark:text-slate-100', props.className)} {...props} />;
}

export function CardDescription(props: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={clsx('mt-2 text-sm text-slate-600 dark:text-slate-300', props.className)} {...props} />;
}

export function CardFooter(props: HTMLAttributes<HTMLDivElement>) {
  return <div className={clsx('mt-4 flex items-center justify-between text-sm text-slate-500', props.className)} {...props} />;
}
