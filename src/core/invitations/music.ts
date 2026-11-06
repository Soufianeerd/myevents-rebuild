export type ExternalMusic = { provider: 'youtube' | 'spotify'; id: string };
export function parseMusicLink(value: string): ExternalMusic {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port)
    throw new Error('Utilisez un lien HTTPS YouTube ou Spotify.');
  const host = url.hostname.replace(/^www\./, '');
  if (['youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
    const id =
      host === 'youtu.be'
        ? url.pathname.slice(1)
        : url.pathname === '/watch'
          ? url.searchParams.get('v')
          : url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)$/)?.[1];
    if (id && /^[A-Za-z0-9_-]{11}$/.test(id))
      return { provider: 'youtube', id };
  }
  if (host === 'open.spotify.com') {
    const match = url.pathname.match(
      /^\/(?:intl-[a-z]{2}\/)?track\/([A-Za-z0-9]{22})$/,
    );
    if (match) return { provider: 'spotify', id: match[1] };
  }
  throw new Error(
    'Choisissez le lien d’une vidéo YouTube ou d’un titre Spotify.',
  );
}
export function musicEmbed(music: ExternalMusic) {
  return music.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${music.id}`
    : `https://open.spotify.com/embed/track/${music.id}`;
}
