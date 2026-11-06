'use client';
import type {
  InvitationDocument,
  InvitationSection,
} from '@/core/invitations/models';
type Asset = { id: string; name: string; url: string };
export function BackgroundControls({
  document,
  change,
  assets,
}: {
  document: InvitationDocument;
  change: (document: InvitationDocument) => void;
  assets: Asset[];
}) {
  const opening = document.openingStyle ?? {
    background: '#611c2a',
    color: '#fff3db',
    sealColor: '#e5c58f',
    sealText: 'M',
    duration: 0.6,
  };
  return (
    <details>
      <summary>Fond et ouverture personnalisés</summary>
      <label>
        Image de fond générale
        <select
          value={document.backgroundMediaId ?? document.backgroundImage ?? ''}
          onChange={(event) =>
            change({
              ...document,
              backgroundMediaId:
                event.target.value && !event.target.value.startsWith('/')
                  ? event.target.value
                  : undefined,
              backgroundImage: event.target.value.startsWith('/')
                ? (event.target.value as InvitationDocument['backgroundImage'])
                : '',
            })
          }
        >
          <option value="">Aucune</option>
          <option value="/images/editorial/jardin.jpg">Jardin</option>
          <option value="/images/editorial/reception.jpg">Réception</option>
          <option value="/images/editorial/anniversaire.jpg">
            Anniversaire
          </option>
          {assets.map((asset) => (
            <option key={asset.id} value={asset.id}>
              {asset.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Opacité du fond · {Math.round((document.backgroundOpacity ?? 1) * 100)}{' '}
        %
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={document.backgroundOpacity ?? 1}
          onChange={(event) =>
            change({
              ...document,
              backgroundOpacity: Number(event.target.value),
            })
          }
        />
      </label>
      {(['background', 'color', 'sealColor'] as const).map((key, index) => (
        <label key={key}>
          {
            ['Fond de l’ouverture', 'Texte de l’ouverture', 'Couleur du sceau'][
              index
            ]
          }
          <input
            type="color"
            value={opening[key]}
            onChange={(event) =>
              change({
                ...document,
                openingStyle: { ...opening, [key]: event.target.value },
              })
            }
          />
        </label>
      ))}
      <label>
        Texte du sceau
        <input
          maxLength={12}
          value={opening.sealText}
          onChange={(event) =>
            change({
              ...document,
              openingStyle: { ...opening, sealText: event.target.value },
            })
          }
        />
      </label>
    </details>
  );
}
export function SectionAppearance({
  section,
  patch,
  assets,
  startAt,
  timezone,
}: {
  section: InvitationSection;
  patch: (value: Partial<InvitationSection>) => void;
  assets: Asset[];
  startAt: string;
  timezone: string;
}) {
  const calendar = section.calendar ?? {
    startAt,
    timezone,
    location: '',
    format: 'minutes' as const,
    afterText: 'L’événement a commencé.',
  };
  const localDate = (value: string) =>
    new Date(
      new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000,
    )
      .toISOString()
      .slice(0, 16);
  return (
    <>
      {section.type === 'location' && (
        <>
          <p>
            Le texte du bloc correspond à l’adresse. Pour un ou deux lieux, vous
            pouvez ajouter une image d’aperçu cartographique.
          </p>
          <label>
            Horaire du lieu
            <input
              value={section.location?.time ?? ''}
              maxLength={30}
              onChange={(event) =>
                patch({
                  location: {
                    navigation: section.location?.navigation ?? 'google',
                    time: event.target.value,
                  },
                })
              }
            />
          </label>
          <label>
            Application d’itinéraire
            <select
              value={section.location?.navigation ?? 'google'}
              onChange={(event) =>
                patch({
                  location: {
                    time: section.location?.time ?? '',
                    navigation: event.target.value as 'google' | 'waze',
                  },
                })
              }
            >
              <option value="google">Google Maps</option>
              <option value="waze">Waze</option>
            </select>
          </label>
        </>
      )}
      {['calendar', 'countdown'].includes(section.type) && (
        <>
          <label>
            Début (heure de votre appareil)
            <input
              type="datetime-local"
              value={localDate(calendar.startAt)}
              onChange={(event) => {
                if (event.target.value)
                  patch({
                    calendar: {
                      ...calendar,
                      startAt: new Date(event.target.value).toISOString(),
                    },
                  });
              }}
            />
          </label>
          <label>
            Fuseau affiché
            <input
              value={calendar.timezone}
              maxLength={80}
              onChange={(event) =>
                patch({
                  calendar: { ...calendar, timezone: event.target.value },
                })
              }
            />
          </label>
          {section.type === 'calendar' ? (
            <>
              <label>
                Fin facultative (heure de votre appareil)
                <input
                  type="datetime-local"
                  value={calendar.endAt ? localDate(calendar.endAt) : ''}
                  onChange={(event) =>
                    patch({
                      calendar: {
                        ...calendar,
                        endAt: event.target.value
                          ? new Date(event.target.value).toISOString()
                          : undefined,
                      },
                    })
                  }
                />
              </label>
              <label>
                Lieu dans le calendrier
                <input
                  value={calendar.location}
                  maxLength={500}
                  onChange={(event) =>
                    patch({
                      calendar: { ...calendar, location: event.target.value },
                    })
                  }
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Précision du compte à rebours
                <select
                  value={calendar.format}
                  onChange={(event) =>
                    patch({
                      calendar: {
                        ...calendar,
                        format: event.target.value as typeof calendar.format,
                      },
                    })
                  }
                >
                  <option value="days">Jours</option>
                  <option value="hours">Heures</option>
                  <option value="minutes">Minutes</option>
                  <option value="seconds">Secondes</option>
                </select>
              </label>
              <label>
                Message après la date
                <input
                  value={calendar.afterText}
                  maxLength={250}
                  onChange={(event) =>
                    patch({
                      calendar: { ...calendar, afterText: event.target.value },
                    })
                  }
                />
              </label>
            </>
          )}
        </>
      )}
      <details>
        <summary>Cadre, typographie et transparence</summary>
        <label>
          Image de fond de la section
          <select
            value={section.backgroundMediaId ?? ''}
            onChange={(event) =>
              patch({ backgroundMediaId: event.target.value || undefined })
            }
          >
            <option value="">Aucune</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Opacité de la section ·{' '}
          {Math.round((section.style.opacity ?? 1) * 100)} %
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={section.style.opacity ?? 1}
            onChange={(event) =>
              patch({
                style: {
                  ...section.style,
                  opacity: Number(event.target.value),
                },
              })
            }
          />
        </label>
        <label>
          Typographie de la section
          <select
            value={section.style.font ?? 'inherit'}
            onChange={(event) =>
              patch({
                style: {
                  ...section.style,
                  font: event.target.value as typeof section.style.font,
                },
              })
            }
          >
            <option value="inherit">Style général</option>
            <option value="editorial">Éditoriale</option>
            <option value="script">Manuscrite</option>
            <option value="sans">Contemporaine</option>
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={section.style.fontWeight === 'bold'}
            onChange={(event) =>
              patch({
                style: {
                  ...section.style,
                  fontWeight: event.target.checked ? 'bold' : 'normal',
                },
              })
            }
          />{' '}
          Gras
        </label>
        <label>
          <input
            type="checkbox"
            checked={section.style.italic ?? false}
            onChange={(event) =>
              patch({
                style: { ...section.style, italic: event.target.checked },
              })
            }
          />{' '}
          Italique
        </label>
        {(
          ['radius', 'borderWidth', 'letterSpacing', 'lineHeight'] as const
        ).map((key, index) => (
          <label key={key}>
            {
              [
                'Arrondi',
                'Épaisseur du cadre',
                'Espacement des lettres',
                'Interligne',
              ][index]
            }
            <input
              type="range"
              min={key === 'lineHeight' ? 1 : 0}
              max={key === 'radius' ? 80 : key === 'lineHeight' ? 2.5 : 12}
              step={key === 'lineHeight' ? 0.1 : 1}
              value={section.style[key] ?? (key === 'lineHeight' ? 1.5 : 0)}
              onChange={(event) =>
                patch({
                  style: {
                    ...section.style,
                    [key]: Number(event.target.value),
                  },
                })
              }
            />
          </label>
        ))}
        <label>
          Couleur du cadre
          <input
            type="color"
            value={section.style.borderColor ?? section.style.color}
            onChange={(event) =>
              patch({
                style: { ...section.style, borderColor: event.target.value },
              })
            }
          />
        </label>
        <label>
          Ombre
          <select
            value={section.style.shadow ?? 'none'}
            onChange={(event) =>
              patch({
                style: {
                  ...section.style,
                  shadow: event.target.value as typeof section.style.shadow,
                },
              })
            }
          >
            <option value="none">Aucune</option>
            <option value="soft">Douce</option>
            <option value="strong">Prononcée</option>
          </select>
        </label>
      </details>
    </>
  );
}
