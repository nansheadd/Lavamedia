import clsx from 'clsx';

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        'lg:max-w-[80vw]',
        className
      )}
      {...props}
    />
  );
}
