import * as React from 'react';

export function TypographyShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-h3 border-b border-border pb-2">Typographie</div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div>
            <div className="text-caption text-muted mb-1">
              Display XL (Serif)
            </div>
            <h1 className="text-display-xl">MyEvent&apos;s</h1>
          </div>
          <div>
            <div className="text-caption text-muted mb-1">
              Display LG (Serif)
            </div>
            <h2 className="text-display-lg">Quiet Luxury</h2>
          </div>
          <div>
            <div className="text-caption text-muted mb-1">Heading 1</div>
            <h1 className="text-h1">Créer une invitation</h1>
          </div>
          <div>
            <div className="text-caption text-muted mb-1">Heading 2</div>
            <h2 className="text-h2">Gérer vos invités</h2>
          </div>
          <div>
            <div className="text-caption text-muted mb-1">Heading 3</div>
            <h3 className="text-h3">Informations générales</h3>
          </div>
          <div>
            <div className="text-caption text-muted mb-1">Heading 4</div>
            <h4 className="text-h4">Détails de l&apos;événement</h4>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <div className="text-caption text-muted mb-1">Body Large</div>
            <p className="text-body-lg">
              Créez votre invitation, gérez vos invités et rassemblez tous vos
              souvenirs au même endroit.
            </p>
          </div>
          <div>
            <div className="text-caption text-muted mb-1">Body Default</div>
            <p className="text-body">
              Une expérience premium pensée pour les événements
              d&apos;exception. Chaque détail compte.
            </p>
          </div>
          <div>
            <div className="text-caption text-muted mb-1">Body Small</div>
            <p className="text-body-sm text-neutral-600">
              Appuyez sur Entrée pour valider votre sélection ou Échap pour
              annuler.
            </p>
          </div>
          <div>
            <div className="text-caption text-muted mb-1">Overline</div>
            <div className="text-overline text-primary">Invitation Publiée</div>
          </div>

          <div className="mt-4 rounded-xl bg-surface-muted p-6" dir="rtl">
            <div className="text-caption text-muted mb-2 text-left" dir="ltr">
              Support RTL (Arabic)
            </div>
            <div className="text-h2 mb-2 font-[family-name:--font-arabic]">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>
            <p className="text-body font-[family-name:--font-arabic]">
              رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ
              أَعْيُنٍ
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
