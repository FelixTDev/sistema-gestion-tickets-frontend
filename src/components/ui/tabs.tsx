import { useId, useRef, type KeyboardEvent } from 'react'

export type TabItem = {
  id: string
  label: string
  disabled?: boolean
  /** ID of a panel rendered by the consumer. Omit when the tab does not control a panel element. */
  panelId?: string
}
export type TabsProps = {
  id?: string
  tabs: TabItem[]
  value: string
  onChange: (id: string) => void
  'aria-label'?: string
}

export function Tabs({ id, tabs, value, onChange, 'aria-label': ariaLabel = 'Secciones' }: TabsProps) {
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>())
  const generatedId = useId().replaceAll(':', '')
  const groupId = id ?? `tabs-${generatedId}`
  const enabledTabs = tabs.filter((tab) => !tab.disabled)

  const selectTab = (id: string) => {
    onChange(id)
    buttonRefs.current.get(id)?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentId: string) => {
    const index = enabledTabs.findIndex((tab) => tab.id === currentId)
    if (index < 0) return

    let nextId: string | undefined
    if (event.key === 'ArrowRight') nextId = enabledTabs[(index + 1) % enabledTabs.length]?.id
    if (event.key === 'ArrowLeft') nextId = enabledTabs[(index - 1 + enabledTabs.length) % enabledTabs.length]?.id
    if (event.key === 'Home') nextId = enabledTabs[0]?.id
    if (event.key === 'End') nextId = enabledTabs[enabledTabs.length - 1]?.id
    if (!nextId) return

    event.preventDefault()
    selectTab(nextId)
  }

  return (
    <div
      className="flex gap-1 overflow-x-auto border-b border-[#e6edef]"
      role="tablist"
      id={`${groupId}-list`}
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => {
        const selected = value === tab.id
        return (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) buttonRefs.current.set(tab.id, node)
              else buttonRefs.current.delete(tab.id)
            }}
            type="button"
            role="tab"
            id={`${groupId}-tab-${tab.id}`}
            aria-controls={tab.panelId}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, tab.id)}
            className={`relative whitespace-nowrap px-4 py-2.5 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
              selected ? 'text-turq-dark' : 'text-muted hover:text-ink'
            }`}
          >
            {tab.label}
            {selected ? (
              <span className="absolute -bottom-px left-2 right-2 h-[2.5px] rounded-full bg-turq" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
