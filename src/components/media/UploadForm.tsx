'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  beginUploadAction,
  finishUploadAction,
} from '@/app/souvenirs/[token]/actions';
export function UploadForm({
  token,
  kind,
}: {
  token: string;
  kind: 'audio' | 'photo_video';
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [author, setAuthor] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const tracks = useRef<MediaStream | null>(null);
  useEffect(
    () => () => {
      tracks.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  async function record() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      tracks.current = stream;
      const type = ['audio/webm', 'audio/mp4', 'audio/ogg'].find((t) =>
        MediaRecorder.isTypeSupported(t),
      );
      const capture = new MediaRecorder(
        stream,
        type ? { mimeType: type } : undefined,
      );
      recorder.current = capture;
      const chunks: BlobPart[] = [];
      capture.ondataavailable = (e) => chunks.push(e.data);
      capture.onstop = () => {
        setFile(
          new File(chunks, 'Mon message audio', {
            type: capture.mimeType.split(';')[0],
          }),
        );
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      capture.start();
      setRecording(true);
      setMessage('');
    } catch {
      setMessage(
        'Le microphone est indisponible. Vous pouvez choisir un fichier audio.',
      );
    }
  }
  async function send() {
    if (!file || !consent) return;
    setBusy(true);
    setMessage('Envoi en cours…');
    try {
      const result = await beginUploadAction(token, {
        name: file.name,
        author,
        mime: file.type.split(';')[0],
        size: file.size,
        consent,
      });
      if (!result.ok) throw new Error(result.error);
      const body = new FormData();
      Object.entries(result.data.fields).forEach(([key, value]) =>
        body.append(key, value),
      );
      body.append('file', file);
      const response = await fetch(result.data.url, { method: 'POST', body });
      if (!response.ok) throw new Error('Le transfert a échoué.');
      const completed = await finishUploadAction(
        result.data.id,
        result.data.secret,
      );
      if (!completed.ok) throw new Error(completed.error);
      setFile(null);
      setMessage('Merci ! Votre souvenir a bien été enregistré.');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Envoi impossible.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>
        {kind === 'audio'
          ? 'Laissez un message qui reste'
          : 'Partagez vos plus beaux moments'}
      </h2>
      <p>
        {kind === 'audio'
          ? 'Enregistrez votre voix ou choisissez un fichier audio (100 Mo maximum).'
          : 'Photos : 20 Mo maximum. Vidéos : 100 Mo maximum.'}
      </p>
      <label>
        Votre prénom
        <input
          value={author}
          maxLength={100}
          onChange={(e) => setAuthor(e.target.value)}
        />
      </label>
      {kind === 'audio' && (
        <p>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              recording ? recorder.current?.stop() : void record()
            }
          >
            {recording ? 'Terminer l’enregistrement' : 'Enregistrer un message'}
          </button>
        </p>
      )}
      <label>
        Choisir un fichier
        <input
          type="file"
          accept={
            kind === 'audio'
              ? 'audio/*'
              : 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm'
          }
          disabled={busy || recording}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      {file && (
        <p>
          {file.name} · {(file.size / 1000000).toFixed(1)} Mo
        </p>
      )}
      <p>
        <label>
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />{' '}
          J’accepte de partager ce fichier avec l’organisateur et, si la galerie
          est ouverte, les invités disposant du lien.
        </label>
      </p>
      <button
        type="button"
        disabled={!file || !consent || busy || recording}
        onClick={() => void send()}
      >
        Envoyer mon souvenir
      </button>
      <p role="status">{message}</p>
    </section>
  );
}
