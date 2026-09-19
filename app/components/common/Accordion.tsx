import { useCallback, useId, useState, type ReactNode } from 'react';
import { Collapse } from '@salla.sa/twilight-theme-engine/collapse';

/**
 * The accordion behind Faq and PrePurchaseInfo (DIRECTION 5.4, 7.1, 9.2).
 *
 * Built on the engine's own `Collapse` compound (theme-engine
 * dist/components/collapse/index.js): a controlled trigger that carries
 * `aria-expanded`, and a content wrapper that animates `grid-template-rows`
 * from 0fr to 1fr with opacity, which is exactly the one motion exception
 * DIRECTION 7.1 writes down. `_primitives.scss` section 10 replaces the
 * engine's fixed 200ms `transition-all` with the `--dur-*` and `--ease-*`
 * tokens and adds the `aria-controls` target and the chevron.
 *
 * Why not the `salla-accordion` web component: its content lives in a shadow
 * root, so the `.ox-acc` token styling never reaches it and the row cannot
 * carry the `aria-controls` that DIRECTION 9.2 requires. Engine-rendered
 * `salla-accordion` instances elsewhere keep their own chrome.
 *
 * One row is open at a time by default (`allowMultiple` opens more). A row can
 * be `locked`: it renders as a heading with no control at all, which is how the
 * medical line is shown (9.2: never a disabled control).
 */

export interface AccordionItem {
  /** Stable id; also the deep-link fragment target (`#faq-2` style). */
  id: string;
  title: ReactNode;
  children: ReactNode;
  /** No control, always visible: the medical line (DIRECTION 5.4). */
  locked?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Ids open on first render. */
  defaultOpen?: string[];
  allowMultiple?: boolean;
  /** Heading level of each row title inside the section. Default h3. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  className?: string;
}

export function Accordion({
  items,
  defaultOpen = [],
  allowMultiple = false,
  headingLevel: Heading = 'h3',
  className,
}: AccordionProps) {
  const prefix = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen);

  const toggle = useCallback(
    (id: string) => {
      setOpen((current) => {
        if (current.includes(id)) return current.filter((value) => value !== id);
        return allowMultiple ? [...current, id] : [id];
      });
    },
    [allowMultiple]
  );

  const classes = ['ox-acc', className].filter(Boolean).join(' ');
  return (
    <div className={classes}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const triggerId = `${prefix}-${item.id}-trigger`;
        const panelId = `${prefix}-${item.id}-panel`;
        if (item.locked) {
          return (
            <div className="ox-acc__row ox-acc__static" key={item.id} id={item.id}>
              <Heading className="ox-acc__title">{item.title}</Heading>
              <div className="ox-acc__body">{item.children}</div>
            </div>
          );
        }
        return (
          <div className="ox-acc__row" key={item.id} id={item.id}>
            <Heading className="ox-acc__heading">
              <Collapse.Trigger
                id={triggerId}
                className="ox-acc__trigger"
                isOpen={isOpen}
                onToggle={() => toggle(item.id)}
                aria-controls={panelId}
              >
                <span className="ox-acc__title">{item.title}</span>
                <i className="sicon-keyboard_arrow_down ox-acc__chevron" aria-hidden="true" />
              </Collapse.Trigger>
            </Heading>
            <Collapse.Content
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="ox-acc__panel"
              data-open={isOpen ? 'true' : 'false'}
              isOpen={isOpen}
            >
              <div className="ox-acc__body">{item.children}</div>
            </Collapse.Content>
          </div>
        );
      })}
    </div>
  );
}
