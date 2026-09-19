import type { ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Panel } from '../common/Panel';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import type { OxIconName } from '../common/Icon';

export interface AccountEmptyProps {
  /** 48 mark; the account surfaces reuse the sprite's promise symbols. */
  icon?: OxIconName;
  titleKey: string;
  bodyKey: string;
  /** Route out. Defaults to the catalogue, which is the only honest one. */
  primaryTo?: string;
  primaryKey?: string;
  secondaryTo?: string;
  secondaryKey?: string;
  /** Replaces the two buttons entirely (the notifications surface). */
  actions?: ReactNode;
}

/**
 * The empty state every account surface needs, because on this store every
 * one of them is empty today: zero orders, zero saved products, no wallet
 * activity, no notifications, no loyalty points (PLAN-final 0.3).
 *
 * It sits inside a `Panel` rather than on bare paper so the content column
 * still reads as a finished page next to the rail, and it always carries a
 * route out to something real. Nothing here invents urgency: no countdown,
 * no "N people are viewing", no stock scare (PLAN-final 6.5).
 */
export function AccountEmpty({
  icon,
  titleKey,
  bodyKey,
  primaryTo = '/latest-products',
  primaryKey = 'ox.empty.cta_shop',
  secondaryTo,
  secondaryKey,
  actions,
}: AccountEmptyProps) {
  const { t } = useTranslation();

  return (
    <Panel className="ox-acct-empty">
      <EmptyState
        icon={icon}
        title={t(titleKey)}
        body={t(bodyKey)}
        primary={
          actions ?? (
            <Button to={primaryTo} size={48} variant="primary">
              {t(primaryKey)}
            </Button>
          )
        }
        secondary={
          !actions && secondaryTo && secondaryKey ? (
            <Button to={secondaryTo} size={48} variant="secondary">
              {t(secondaryKey)}
            </Button>
          ) : null
        }
      />
    </Panel>
  );
}
