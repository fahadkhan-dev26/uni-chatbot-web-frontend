import { cn } from '../../utils/cn';

export default function Card({ as: Tag = 'div', className, children, ...props }) {
  return (
    <Tag className={cn('card-surface p-5 sm:p-6', className)} {...props}>
      {children}
    </Tag>
  );
}
