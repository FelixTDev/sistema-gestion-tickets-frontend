import { useState } from 'react'
import { Icon } from '../../../components/ui/icons'
import { formatCategoryLabel, getCategoryIcon } from '../../../lib/formatters'
import { useFaqFeedbackMutation } from '../hooks/use-faqs'
import type { FAQRead } from '../types/faq-types'

export function FaqAccordion({ faqs, categoryNames }: { faqs: FAQRead[]; categoryNames: Record<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [feedbackByFaq, setFeedbackByFaq] = useState<Record<string, boolean | undefined>>({})
  const feedback = useFaqFeedbackMutation()

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
            className={`overflow-hidden rounded-[14px] border bg-white shadow-xs transition-[background-color,border-color,box-shadow,transform] duration-200 ${
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

                <div className="mt-4 rounded-[10px] border border-[#e6edef] bg-white p-3 text-[13px]">
                  {feedbackByFaq[faq.id] === undefined ? (
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-ink">¿Te fue útil esta respuesta?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="min-h-10 rounded-md border border-[#cdd9de] px-3 font-semibold text-turq-dark hover:border-turq-dark disabled:opacity-50"
                          disabled={feedback.isPending}
                          onClick={() => {
                            void feedback.mutateAsync({ faqId: faq.id, data: { is_helpful: true } }).then(() => {
                              setFeedbackByFaq((current) => ({ ...current, [faq.id]: true }))
                            })
                          }}
                        >
                          Sí, fue útil
                        </button>
                        <button
                          type="button"
                          className="min-h-10 rounded-md border border-[#cdd9de] px-3 font-semibold text-ink hover:border-turq-dark disabled:opacity-50"
                          disabled={feedback.isPending}
                          onClick={() => {
                            void feedback.mutateAsync({ faqId: faq.id, data: { is_helpful: false } }).then(() => {
                              setFeedbackByFaq((current) => ({ ...current, [faq.id]: false }))
                            })
                          }}
                        >
                          No, no fue útil
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p role="status" className="font-semibold text-turq-dark">Gracias por tu feedback.</p>
                  )}
                  {feedback.isError && feedbackByFaq[faq.id] === undefined && (
                    <p role="alert" className="mt-2 text-danger">No pudimos registrar tu feedback. Inténtalo nuevamente.</p>
                  )}
                </div>

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
