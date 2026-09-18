import { useState } from 'react'
import { Icon } from '../../../components/ui/icons'
import type { FAQRead } from '../types/faq-types'

export function FaqAccordion({ faqs, categoryNames }: { faqs: FAQRead[]; categoryNames: Record<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null)
  return <div className="space-y-3">
    {faqs.map((faq) => {
      const isOpen = openId === faq.id
      const panelId = `faq-answer-${faq.id}`
      return <article key={faq.id} className="overflow-hidden rounded-[12px] border border-[#e6edef] bg-white">
        <h2>
          <button type="button" className="flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#fafcfc]" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenId(isOpen ? null : faq.id)}>
            <span className="flex-1">
              <span data-faq-category className="mb-0.5 block text-[11px] font-semibold uppercase tracking-wider text-turq-dark">{categoryNames[faq.category_id] ?? 'Información'}</span>
              <span className="text-[15px] font-semibold text-ink">{faq.question}</span>
            </span>
            <Icon.chevron size={19} className={`shrink-0 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </h2>
        {isOpen && <div id={panelId} className="gnb-fade -mt-1 px-5 pb-5 text-[14px] leading-relaxed text-muted"><p>{faq.answer}</p></div>}
      </article>
    })}
  </div>
}
