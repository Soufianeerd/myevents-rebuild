import {
  invitationDocumentSchema,
  sectionSchema,
  type InvitationDocument,
} from './models';
export const templateOptions = [
  { id: 'garden', name: 'Jardin lumière' },
  { id: 'garnet', name: 'Soirée grenat' },
  { id: 'editorial', name: 'Les beaux jours' },
] as const;
export function createInvitationDocument(
  event: {
    name: string;
    startAt: string;
    primaryLocation?: string;
    timezone: string;
  },
  id: () => string,
): InvitationDocument {
  return invitationDocumentSchema.parse({
    schemaVersion: 1,
    title: event.name,
    theme: 'garden',
    background: '#e8e5db',
    font: 'editorial',
    opening: 'envelope',
    rsvpEnabled: true,
    deadline: null,
    fields: [],
    sections: [
      { id: id(), type: 'identity', title: 'Vous êtes invités' },
      {
        id: id(),
        type: 'title',
        title: event.name,
        text: new Intl.DateTimeFormat('fr-FR', {
          dateStyle: 'long',
          timeStyle: 'short',
          timeZone: event.timezone,
        }).format(new Date(event.startAt)),
      },
      { id: id(), type: 'image', image: '/images/editorial/jardin.jpg' },
      {
        id: id(),
        type: 'message',
        title: 'Une journée avec vous',
        text: 'Nous avons hâte de partager ce moment avec vous.',
      },
      {
        id: id(),
        type: 'location',
        title: 'Le rendez-vous',
        text: event.primaryLocation || 'Lieu à préciser',
      },
      { id: id(), type: 'program', title: 'Le programme', items: [] },
      { id: id(), type: 'rsvp', title: 'Serez-vous des nôtres ?' },
    ].map((s) => sectionSchema.parse(s)),
  });
}
export function applyTemplate(
  document: InvitationDocument,
  theme: InvitationDocument['theme'],
): InvitationDocument {
  const palettes = {
    garden: ['#e8e5db', '#faf7ee', '#283e2d'],
    garnet: ['#32131c', '#5c1527', '#fff1dc'],
    editorial: ['#f3e3d7', '#e9b5a8', '#561a25'],
  } as const;
  const [background, paper, color] = palettes[theme];
  return {
    ...document,
    theme,
    background,
    font: theme === 'garnet' ? 'script' : 'editorial',
    sections: document.sections.map((section) => ({
      ...section,
      style: { ...section.style, background: paper, color },
    })),
  };
}
