import { ColorsShowcase } from './sections/ColorsShowcase';
import { TypographyShowcase } from './sections/TypographyShowcase';
import { ButtonsShowcase } from './sections/ButtonsShowcase';
import { FormsShowcase } from './sections/FormsShowcase';
import { FeedbackShowcase } from './sections/FeedbackShowcase';
import { OverlaysShowcase } from './sections/OverlaysShowcase';

export function DesignSystemShowcase() {
  return (
    <div className="mx-auto max-w-6xl p-8 pb-24">
      <header className="mb-12">
        <h1 className="text-h1 mb-2">MyEvent&apos;s Design System</h1>
        <p className="text-body text-muted">
          Catalogue des primitives UI de la Session 01.
        </p>
      </header>

      <div className="flex flex-col gap-16">
        <ColorsShowcase />
        <TypographyShowcase />
        <ButtonsShowcase />
        <FormsShowcase />
        <FeedbackShowcase />
        <OverlaysShowcase />
      </div>
    </div>
  );
}
