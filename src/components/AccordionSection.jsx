import React from 'react'
import { useState } from 'react'

export default function AccordionSection({ title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <section className="accordion-section">
      <button className="accordion-trigger" onClick={() => setOpen(!open)}>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span className={`accordion-icon ${open ? 'open' : ''}`}>▾</span>
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </section>
  )
}
