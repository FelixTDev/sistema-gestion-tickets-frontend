import { Icon } from '../ui/icons'

export const SERVICE_NOTICE = 'Portal de consultas y tickets. Las operaciones bancarias se realizan únicamente por los canales oficiales del banco.'

export function ServiceNotice({ inline = false }: { inline?: boolean }) {
  return <div className={inline ? '' : 'sticky top-0 z-40'} role="note">
    <div className="flex items-center justify-center gap-2 bg-[#06243a] px-4 py-1.5 text-center text-[12px] font-medium text-[#cfe0e6]">
      <Icon.info size={14} className="shrink-0 text-green" />
      <span>{SERVICE_NOTICE}</span>
    </div>
  </div>
}
