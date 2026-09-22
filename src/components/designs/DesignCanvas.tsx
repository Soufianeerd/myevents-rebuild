/* eslint-disable @next/next/no-img-element -- Private signed media and embedded QR images must not pass through the public image optimizer. */
import type { Design, DesignElement } from '@/core/designs/models';
export function DesignCanvas({
  document,
  side,
  assets,
  selected,
  onSelect,
}: {
  document: Design;
  side: number;
  assets: Record<string, string>;
  selected?: string;
  onSelect?: (id: string) => void;
}) {
  const face = document.sides[side];
  return (
    <div
      aria-label={`Carte ${face.name}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${document.widthMm}/${document.heightMm}`,
        background: face.background,
        boxShadow: '0 10px 45px #372d2920',
        overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      {face.elements.map((e) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: `${e.x}%`,
          top: `${e.y}%`,
          width: `${e.width}%`,
          height: `${e.height}%`,
          color: e.color,
          fontFamily: e.font,
          fontSize: `${e.fontSize / 5}cqw`,
          textAlign: e.align,
          whiteSpace: 'pre-wrap',
          display: 'flex',
          alignItems: 'center',
          justifyContent:
            e.align === 'left'
              ? 'flex-start'
              : e.align === 'right'
                ? 'flex-end'
                : 'center',
          lineHeight: 1.35,
          outline: selected === e.id ? '2px dashed #a7743a' : undefined,
        };
        const content = elementContent(e, assets);
        return onSelect ? (
          <button
            key={e.id}
            type="button"
            aria-label={`Sélectionner ${e.type}: ${e.text.slice(0, 40)}`}
            onClick={() => onSelect(e.id)}
            style={{
              ...style,
              padding: 0,
              border: 0,
              borderRadius: 0,
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            {content}
          </button>
        ) : (
          <div key={e.id} style={style}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
function elementContent(e: DesignElement, assets: Record<string, string>) {
  if (e.type === 'text') return e.text;
  if (e.type === 'shape')
    return (
      <span
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          background: e.background,
          borderRadius: e.shape === 'ellipse' ? '50%' : 0,
        }}
      />
    );
  const src =
    e.type === 'qr'
      ? assets[e.qr]
      : e.image.startsWith('/')
        ? e.image
        : assets[e.image];
  return src ? (
    <img
      src={src}
      alt={e.type === 'qr' ? `QR ${e.qr}` : e.text || 'Photographie'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: e.type === 'qr' ? 'contain' : 'cover',
      }}
    />
  ) : (
    <span>Choisissez une image</span>
  );
}
