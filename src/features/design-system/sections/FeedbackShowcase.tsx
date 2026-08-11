import * as React from 'react';
import {
  Badge,
  Alert,
  StatusMessage,
  Skeleton,
  Spinner,
  EmptyState,
  Card,
} from '@/components/ui';

export function FeedbackShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-h3 border-b border-border pb-2">
        Feedback & États
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="text-body-sm font-medium">Badges</div>
            <div className="flex flex-wrap gap-3">
              <Badge variant="neutral">Brouillon</Badge>
              <Badge variant="primary">En cours</Badge>
              <Badge variant="success">Publié</Badge>
              <Badge variant="warning">En attente</Badge>
              <Badge variant="danger">Refusé</Badge>
              <Badge variant="premium">Premium</Badge>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-body-sm font-medium">StatusMessage</div>
            <div className="flex flex-col gap-2">
              <StatusMessage variant="info">
                Synchronisation en cours...
              </StatusMessage>
              <StatusMessage variant="success">
                Toutes les invitations envoyées
              </StatusMessage>
              <StatusMessage variant="warning">
                Certains emails n&apos;ont pas abouti
              </StatusMessage>
              <StatusMessage variant="danger">
                Erreur de connexion
              </StatusMessage>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="text-body-sm font-medium">Skeletons & Spinners</div>
            <div className="flex items-center gap-4 mb-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" className="text-primary" />
            </div>
            <div className="flex flex-col gap-2 w-[240px]">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" className="h-10 w-10 shrink-0" />
                <div className="flex w-full flex-col gap-2">
                  <Skeleton variant="text" />
                  <Skeleton variant="text" className="w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="text-body-sm font-medium">Alerts</div>
            <div className="flex flex-col gap-3">
              <Alert variant="info" title="Nouvelle fonctionnalité">
                Vous pouvez désormais importer vos invités depuis un fichier
                Excel.
              </Alert>
              <Alert variant="success" title="Paiement validé" />
              <Alert variant="warning" title="Bientôt complet">
                Il ne reste que 15 places disponibles.
              </Alert>
              <Alert variant="danger" title="Abonnement expiré">
                Veuillez renouveler votre abonnement pour continuer à envoyer
                des invitations.
              </Alert>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="text-body-sm font-medium mb-4">Empty States</div>
        <Card flat className="bg-surface-muted border-dashed">
          <EmptyState
            title="Aucun invité trouvé"
            description="Commencez par ajouter votre premier invité ou importez une liste existante."
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
            }
          />
        </Card>
      </div>
    </div>
  );
}
