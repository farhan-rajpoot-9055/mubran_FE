import Reveal from '../common/Reveal.jsx';

export function SectionHead({ eyebrow, title, sub }) {
  return (
    <div className="section-head">
      <Reveal>
        {eyebrow && <p className="section-head__eyebrow">{eyebrow}</p>}
        <h2 className="section-head__title">{title}</h2>
        {sub && <p className="section-head__sub">{sub}</p>}
      </Reveal>
    </div>
  );
}

export default SectionHead;