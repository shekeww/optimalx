import { Children, type ReactNode } from 'react';

export interface InfoPanelsProps {
  children: ReactNode;
}

/**
 * The panel row under the tab strip (design region 35).
 *
 * Three cream panels, stretched to a common height, in the design's order:
 * details, method, then the wide nutrition panel at the inline end. The count
 * is written onto the element so the stylesheet can re-proportion the row when
 * a panel is gated off, which is the difference between a page that looks
 * designed at two panels and one that looks broken.
 */
export function InfoPanels({ children }: InfoPanelsProps) {
  const panels = Children.toArray(children).filter(Boolean);
  if (panels.length === 0) return null;
  return (
    <div className="ox-panels" data-count={panels.length}>
      {panels}
    </div>
  );
}

export default InfoPanels;
