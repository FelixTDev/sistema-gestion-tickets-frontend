export const ACADEMIC_DISCLAIMER = 'Prototipo académico no oficial. Utilice únicamente datos y cuentas de demostración.'

export function AcademicDisclaimer({ compact = false }: { compact?: boolean }) {
  return <div className={compact ? 'academic-disclaimer academic-disclaimer-compact' : 'academic-disclaimer'} role="note"><span aria-hidden="true">ⓘ</span><span>{ACADEMIC_DISCLAIMER}</span></div>
}
