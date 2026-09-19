import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Bdi } from '../common/Bdi';
import { Button } from '../common/Button';
import { digitsOnly } from '../blocks/href';
import { settingText } from '../product/lib/claims';

export interface ContactRowProps {
  titleKey?: string;
  /** Overrides the store's own phone (kitchen sink, tests). */
  phone?: string;
  className?: string;
}

/**
 * The contact row both the services hub and the branch page end on
 * (DIRECTION 6.11 block 7, 6.12 block 7): a WhatsApp secondary button and the
 * phone line.
 *
 * Both are gated on real data. The number is read from `whatsapp_number` and
 * then from `store.contacts.whatsapp`, and the button is absent when both are
 * empty (PLAN-final B5 risks); `wa.me` takes digits only, so anything else in
 * the setting is dropped before the link is built. The phone is a Latin-digit
 * value inside Arabic text, so it is a `bdi` with `dir="ltr"` and no `lang`
 * (a number is not English, amendment A5 applies to names).
 */
export function ContactRow({ titleKey, phone, className }: ContactRowProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();

  const number = digitsOnly(
    settingText(settings as Record<string, unknown> | undefined, 'whatsapp_number') ??
      store?.contacts?.whatsapp ??
      ''
  );
  const href = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(t('ox.content.branch.whatsapp_prefill'))}`
    : undefined;
  const phoneNumber = phone ?? store?.contacts?.phone ?? store?.contacts?.mobile ?? '';

  if (!href && !phoneNumber) return null;

  return (
    <section
      className={['ox-contact-row', className].filter(Boolean).join(' ')}
      data-testid="ox-contact-row"
    >
      {titleKey ? <h2 className="ox-contact-row__title ox-h3">{t(titleKey)}</h2> : null}
      <div className="ox-contact-row__actions">
        {href ? (
          <Button
            href={href}
            size={48}
            variant="secondary"
            target="_blank"
            rel="noopener noreferrer"
            iconStart={<i className="sicon-whatsapp" aria-hidden="true" />}
          >
            {t('ox.branch.whatsapp')}
          </Button>
        ) : null}
        {phoneNumber ? (
          <p className="ox-contact-row__phone ox-body">
            <span>{t('ox.form.phone')}: </span>
            <Bdi ltr lang={null}>
              <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
            </Bdi>
          </p>
        ) : null}
      </div>
    </section>
  );
}
