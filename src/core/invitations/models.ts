import { z } from 'zod';

export const fieldKinds = [
  'text',
  'number',
  'email',
  'tel',
  'choice',
  'multiple',
  'boolean',
  'date',
  'textarea',
] as const;
export const rsvpFieldSchema = z
  .object({
    id: z
      .string()
      .regex(/^[a-z][a-z0-9_]{0,39}$/)
      .refine(
        (id) =>
          ![
            'guest_name',
            'guest_email',
            'guest_companions',
            'presence',
            'consent',
          ].includes(id),
        'Identifiant réservé.',
      ),
    label: z.string().trim().min(1).max(100),
    type: z.enum(fieldKinds),
    required: z.boolean(),
    description: z.string().max(250).default(''),
    options: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  })
  .superRefine((field, ctx) => {
    if (
      ['choice', 'multiple'].includes(field.type) &&
      (!field.options.length ||
        new Set(field.options).size !== field.options.length)
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Des choix distincts sont nécessaires.',
      });
  });
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const sectionSchema = z.object({
  id: z.uuid(),
  type: z.enum([
    'identity',
    'title',
    'message',
    'image',
    'program',
    'location',
    'calendar',
    'rsvp',
    'divider',
  ]),
  title: z.string().max(180).default(''),
  text: z.string().max(4000).default(''),
  visible: z.boolean().default(true),
  image: z
    .enum([
      '',
      '/images/editorial/jardin.jpg',
      '/images/editorial/reception.jpg',
      '/images/editorial/anniversaire.jpg',
    ])
    .default(''),
  items: z
    .array(
      z.object({
        time: z.string().max(30),
        title: z.string().max(180),
        description: z.string().max(500),
      }),
    )
    .max(30)
    .default([]),
  style: z
    .object({
      background: hex.default('#faf7ee'),
      color: hex.default('#421722'),
      align: z.enum(['left', 'center', 'right']).default('center'),
      padding: z.number().int().min(8).max(96).default(32),
      fontSize: z.number().int().min(14).max(80).default(26),
      radius: z.number().int().min(0).max(80).default(0),
      animation: z.enum(['none', 'reveal', 'zoom']).default('none'),
    })
    .default({
      background: '#faf7ee',
      color: '#421722',
      align: 'center',
      padding: 32,
      fontSize: 26,
      radius: 0,
      animation: 'none',
    }),
});
export const invitationDocumentSchema = z
  .object({
    schemaVersion: z.literal(1),
    title: z.string().trim().min(1).max(180),
    theme: z.enum(['garden', 'garnet', 'editorial']),
    background: hex,
    font: z.enum(['editorial', 'script', 'sans']),
    opening: z.enum(['none', 'envelope', 'curtains']),
    sections: z.array(sectionSchema).min(1).max(50),
    fields: z.array(rsvpFieldSchema).max(30),
    rsvpEnabled: z.boolean(),
    deadline: z.iso.datetime().nullable(),
  })
  .superRefine((doc, ctx) => {
    if (new Set(doc.sections.map((s) => s.id)).size !== doc.sections.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Identifiants de sections dupliqués.',
      });
    if (new Set(doc.fields.map((s) => s.id)).size !== doc.fields.length)
      ctx.addIssue({
        code: 'custom',
        message: 'Identifiants de champs dupliqués.',
      });
    if (doc.sections.filter((s) => s.type === 'rsvp').length > 1)
      ctx.addIssue({
        code: 'custom',
        message: 'Un seul formulaire RSVP est autorisé.',
      });
  });
export type InvitationDocument = z.infer<typeof invitationDocumentSchema>;
export type InvitationSection = z.infer<typeof sectionSchema>;
export type RsvpField = z.infer<typeof rsvpFieldSchema>;
export const rsvpResponseSchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1).max(150),
  email: z.email().max(254),
  presence: z.enum(['yes', 'no']),
  answers: z.record(
    z.string(),
    z.union([
      z.string().max(4000),
      z.number().finite(),
      z.boolean(),
      z.array(z.string().max(100)).max(30),
    ]),
  ),
  consent: z.literal(true),
  guestId: z.uuid().optional(),
  companions: z.number().int().min(0).max(50).optional(),
});
export type RsvpResponse = z.infer<typeof rsvpResponseSchema>;
export function validateRsvp(
  document: InvitationDocument,
  input: unknown,
  now: Date,
): RsvpResponse {
  const response = rsvpResponseSchema.parse(input);
  if (!document.rsvpEnabled) throw new Error('Les réponses sont désactivées.');
  if (
    document.deadline &&
    now.getTime() > new Date(document.deadline).getTime()
  )
    throw new Error('La date limite de réponse est dépassée.');
  const allowed = new Set(document.fields.map((f) => f.id));
  if (Object.keys(response.answers).some((key) => !allowed.has(key)))
    throw new Error('Champ inconnu.');
  for (const field of document.fields) {
    const value = response.answers[field.id];
    const empty =
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && !value.length);
    if (empty) {
      if (field.required)
        throw new Error(`Le champ « ${field.label} » est obligatoire.`);
      continue;
    }
    let valid = false;
    switch (field.type) {
      case 'number':
        valid = typeof value === 'number' && Number.isFinite(value);
        break;
      case 'boolean':
        valid = typeof value === 'boolean';
        break;
      case 'email':
        valid = z.email().safeParse(value).success;
        break;
      case 'date':
        valid = z.iso.date().safeParse(value).success;
        break;
      case 'choice':
        valid = typeof value === 'string' && field.options.includes(value);
        break;
      case 'multiple':
        valid =
          Array.isArray(value) &&
          new Set(value).size === value.length &&
          value.every((v) => field.options.includes(v));
        break;
      default:
        valid = typeof value === 'string';
    }
    if (!valid) throw new Error(`Vérifiez le champ « ${field.label} ».`);
  }
  return response;
}
export interface InvitationRecord {
  eventId: string;
  tenantId: string;
  draft: InvitationDocument;
  published: InvitationDocument | null;
  revision: number;
  publishedAt: string | null;
  publishedRevision: number | null;
  history: Array<{
    revision: number;
    createdAt: string;
    document: InvitationDocument;
  }>;
  updatedAt: string;
}
export const invitedGuestSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.string(),
  maxCompanions: z.number().int().min(0).max(50),
});
export type InvitedGuest = z.infer<typeof invitedGuestSchema>;
export type PublicInvitation = {
  guest?: InvitedGuest;
  eventId: string;
  document: InvitationDocument;
  revision: number;
};

export function bindGuestResponse(
  response: RsvpResponse,
  guest?: InvitedGuest,
): RsvpResponse {
  if ((response.companions ?? 0) > (guest?.maxCompanions ?? 0))
    throw new Error('Le nombre d’accompagnants dépasse votre invitation.');
  return {
    ...response,
    guestId: guest?.id,
    id: response.id,
    name: guest?.name ?? response.name,
    companions: response.presence === 'yes' ? (response.companions ?? 0) : 0,
  };
}
