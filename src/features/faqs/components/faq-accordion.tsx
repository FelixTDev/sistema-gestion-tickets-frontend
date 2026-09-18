import { useState } from 'react'
import { Icon } from '../../../components/ui/icons'
import { formatCategoryLabel, getCategoryIcon } from '../../../lib/formatters'
import type { FAQRead } from '../types/faq-types'

export function FaqAccordion({ faqs, categoryNames }: { faqs: FAQRead[]; categoryNames: Record<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function handleCopy(faqId: string, answer: string): void {
    void navigator.clipboard?.writeText?.(answer)
    setCopiedId(faqId)
    window.setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-3.5">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id
        const panelId = `faq-answer-${faq.id}`
        const rawCategory = categoryNames[faq.category_id]
        const categoryLabel = formatCategoryLabel(rawCategory)
        const CategoryIcon = getCategoryIcon(rawCategory)
        const isCopied = copiedId === faq.id

        return (
          <article
            key={faq.id}
            className={`overflow-hidden rounded-[14px] border bg-white shadow-xs transition-all duration-200 ${
              isOpen
                ? 'border-l-4 border-l-[#0b4963] border-y-[#d8e4e8] border-r-[#d8e4e8] shadow-sm'
                : 'border-[#e6edef] hover:border-[#d2e0e4]'
            }`}
          >
            <h2>
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#fafcfc]"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
              >
                <span className="flex flex-col items-start gap-1.5">
                  <span
                    data-faq-category
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#eef5f6] px-2.5 py-1 text-[11.5px] font-bold text-[#0b4963]"
                  >
                    <CategoryIcon size={13} className="text-turq-dark" />
                    {categoryLabel}
                  </span>
                  <span className="text-[16px] font-bold tracking-tight text-ink">{faq.question}</span>
                </span>
                <span
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors ${
                    isOpen ? 'bg-[#e4eff4] text-[#0b4963]' : 'text-muted hover:bg-[#f4f7f8]'
                  }`}
                >
                  <Icon.chevron
                    size={19}
                    className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </span>
              </button>
            </h2>

            {isOpen && (
              <div
                id={panelId}
                className="gnb-fade border-t border-[#f0f4f5] bg-[#fafcfc] px-5 py-4 text-[14.5px] leading-relaxed text-[#4d626c]"
              >
                <p className="whitespace-pre-line">{faq.answer}</p>

                <div className="mt-4 flex items-center justify-between border-t border-[#eef3f5] pt-3 text-[12.5px]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#798c96]">
                    <Icon.check size={14} className="text-green" /> Información verificada por Banco GNB
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(faq.id, faq.answer)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 font-semibold text-turq-dark transition-colors hover:bg-[#e4eff4]"
                    aria-label="Copiar respuesta al portapapeles"
                  >
                    {isCopied ? (
                      <>
                        <Icon.check size={14} className="text-green" /> Copiado
                      </>
                    ) : (
                      <>
                        <Icon.edit size={13} /> Copiar respuesta
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
