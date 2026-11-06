'use client';
import { useState } from 'react';
import { musicEmbed, type ExternalMusic } from '@/core/invitations/music';
export function ExternalMusicPlayer({ music }: { music: ExternalMusic }) {
  const [loaded, setLoaded] = useState(false);
  const label = music.provider === 'youtube' ? 'YouTube' : 'Spotify';
  return (
    <section aria-label="Musique de l’invitation">
      {loaded ? (
        <>
          <iframe
            title={`Musique ${label}`}
            src={musicEmbed(music)}
            width="100%"
            height={music.provider === 'spotify' ? 152 : 220}
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="no-referrer"
            style={{ border: 0, borderRadius: 12 }}
          />
          <button onClick={() => setLoaded(false)}>
            Fermer le lecteur {label}
          </button>
        </>
      ) : (
        <>
          <p>
            Cette invitation propose une musique sur {label}. Le lecteur se
            connectera à ce service lorsque vous le chargerez.
          </p>
          <button onClick={() => setLoaded(true)}>
            Charger le lecteur {label}
          </button>
        </>
      )}
    </section>
  );
}
