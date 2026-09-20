// Public editorial examples only: no customer data, persisted event or RSVP.
export const invitationDemos = [
  {
    slug: 'jardin-lumiere',
    name: 'Jardin lumière',
    category: 'Mariage',
    theme: 'garden',
    names: 'Camille & Alexis',
    date: '12 juin 2027',
    overline: 'Nous nous marions',
    location: 'Un jardin en Provence',
    image: '/images/editorial/jardin.jpg',
    description:
      'Le blanc des fleurs, le vert des oliviers. Une invitation comme un dimanche au jardin.',
    message:
      'Un oui, un grand dîner sous les arbres et vous, à nos côtés. Nous avons hâte de partager cette journée avec ceux que nous aimons.',
    program: [
      ['16:00', 'La cérémonie'],
      ['18:00', 'Un verre au jardin'],
      ['20:00', 'Le dîner sous les étoiles'],
    ],
  },
  {
    slug: 'soiree-grenat',
    name: 'Soirée grenat',
    category: 'Henné',
    theme: 'garnet',
    names: 'Salma & Soufiane',
    date: '18 juin 2027',
    overline: 'Une soirée de henné',
    location: 'Une maison de famille',
    image: '/images/editorial/reception.jpg',
    description:
      'Un bordeaux profond, des lignes dorées et toute la chaleur des grandes fêtes de famille.',
    message:
      'Des mains fleuries, des rires qui résonnent et les personnes qui nous sont chères. Retrouvons-nous pour célébrer ce nouveau chapitre.',
    program: [
      ['18:00', 'Bienvenue à la maison'],
      ['19:30', 'La cérémonie du henné'],
      ['21:00', 'Le dîner et la fête'],
    ],
  },
  {
    slug: 'les-beaux-jours',
    name: 'Les beaux jours',
    category: 'Anniversaire',
    theme: 'editorial',
    names: 'Les 30 ans de Louise',
    date: '3 juillet 2027',
    overline: 'La vie se fête',
    location: 'Une longue table entre amis',
    image: '/images/editorial/anniversaire.jpg',
    description:
      'Une typographie généreuse, un rose doux et une seule envie : réunir tout le monde.',
    message:
      'Trente ans de petites histoires et tellement de beaux jours devant nous. Venez en écrire un de plus avec moi, autour d’une grande table.',
    program: [
      ['18:30', 'On se retrouve'],
      ['20:00', 'À table !'],
      ['22:00', 'On danse jusqu’à tard'],
    ],
  },
] as const;
export type InvitationDemo = (typeof invitationDemos)[number];
export function findInvitationDemo(slug: string) {
  return invitationDemos.find((demo) => demo.slug === slug);
}
