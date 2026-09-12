import type { FAQRead } from '../types/faq-types'

export function FaqAccordion({ faqs }: { faqs: FAQRead[] }) {
  return <div className="faq-accordion">
    {faqs.map((faq) => <details key={faq.id} className="faq-item">
      <summary>{faq.question}<span aria-hidden="true">+</span></summary>
      <div className="faq-answer"><p>{faq.answer}</p></div>
    </details>)}
  </div>
}
