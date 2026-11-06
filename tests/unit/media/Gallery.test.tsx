// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Gallery } from '@/app/(app)/events/[id]/souvenirs/Gallery';
import { moderateManyAction } from '@/app/(app)/events/[id]/souvenirs/actions';
vi.mock('@/app/(app)/events/[id]/souvenirs/actions', () => ({
  moderateManyAction: vi.fn(),
  moderateAction: vi.fn(),
  configureAction: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const items = Array.from({ length: 101 }, (_, index) => ({
  id: String(index),
  name: `Photo ${index}`,
  author: '',
  mime: 'image/jpeg',
  size: 100,
  kind: 'photo_video',
  purpose: 'guest',
  status: 'pending',
  hidden: false,
  favorite: false,
  createdAt: '2026-09-01T12:00:00Z',
  url: null,
  download: null,
}));
it('caps select-all at 100, reflects the cap and sends only that selection', async () => {
  vi.mocked(moderateManyAction).mockResolvedValue({ updated: 100, failed: [] });
  render(<Gallery eventId="event" items={items} />);
  const all = screen.getByLabelText(
    'Sélectionner les fichiers affichés (100 maximum)',
  );
  fireEvent.click(all);
  expect(all).toBeChecked();
  expect(screen.getByLabelText('Sélectionner Photo 100')).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Mettre en favoris' }));
  await waitFor(() =>
    expect(moderateManyAction).toHaveBeenCalledWith(
      'event',
      items.slice(0, 100).map((item) => item.id),
      { favorite: true },
    ),
  );
  await waitFor(() => expect(all).not.toBeChecked());
});
it('clears selection when a search excludes the selected file', () => {
  render(<Gallery eventId="event" items={items.slice(0, 2)} />);
  fireEvent.click(screen.getByLabelText('Sélectionner Photo 0'));
  fireEvent.change(
    screen.getByLabelText('Rechercher un fichier ou un auteur'),
    { target: { value: 'Photo 1' } },
  );
  expect(
    screen.queryByRole('button', { name: 'Supprimer la sélection' }),
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText('Sélectionner Photo 1')).not.toBeChecked();
});
it('retains failed selections without inventing the reason and allows a retry', async () => {
  vi.mocked(moderateManyAction)
    .mockResolvedValueOnce({ updated: 0, failed: ['0'] })
    .mockResolvedValueOnce({ updated: 1, failed: [] });
  render(<Gallery eventId="event" items={items.slice(0, 1)} />);
  fireEvent.click(screen.getByLabelText('Sélectionner Photo 0'));
  fireEvent.click(screen.getByRole('button', { name: 'Mettre en favoris' }));
  await screen.findByText(/Réessayez individuellement/);
  expect(screen.getByLabelText('Sélectionner Photo 0')).toBeChecked();
  expect(screen.queryByText(/photo publiée/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Mettre en favoris' }));
  await screen.findByText('1 fichier modifié.');
  expect(screen.getByLabelText('Sélectionner Photo 0')).not.toBeChecked();
});
