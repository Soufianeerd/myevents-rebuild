import { invitationAssetIds } from '@/core/invitations/presentation';
import { notFound } from 'next/navigation';
import { publicInvitation } from '@/server/experience/service';
import { InvitationRenderer } from '@/components/invitation/InvitationRenderer';
import { RsvpForm } from '@/components/invitation/RsvpForm';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Votre invitation — MyEvents',
  robots: { index: false, follow: false },
};
export default async function PublishedInvitation({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await publicInvitation(token);
  if (!invitation) notFound();
  return (
    <main>
      <InvitationRenderer
        mediaUrls={Object.fromEntries(
          invitationAssetIds(invitation.document, true).map((id) => [
            id,
            `/i/${token}/images/${id}`,
          ]),
        )}
        document={invitation.document}
        rsvp={
          <RsvpForm
            guest={invitation.guest}
            document={invitation.document}
            token={token}
            revision={invitation.revision}
          />
        }
      />
    </main>
  );
}
