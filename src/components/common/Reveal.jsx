import { useInView } from '../../hooks/useInView.js';

export function Reveal({ children, as: Tag = 'div', className = '', delay = 0 }) {
  const [ref, inView] = useInView();

  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

export default Reveal;