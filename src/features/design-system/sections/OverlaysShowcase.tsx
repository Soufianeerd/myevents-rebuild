import * as React from 'react';
import {
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui';

export function OverlaysShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-h3 border-b border-border pb-2">
        Overlays (Radix UI)
      </div>

      <div className="flex gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Ouvrir Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer cet événement ? Cette action
                est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6">
              <DialogClose asChild>
                <Button variant="secondary">Annuler</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button variant="danger">Supprimer</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline">Ouvrir Drawer</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Fiche Invité</DrawerTitle>
              <DrawerDescription>
                Détails et préférences de l&apos;invité.
              </DrawerDescription>
            </DrawerHeader>
            <div className="p-6 flex-1 overflow-y-auto">
              Contenu du drawer...
            </div>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="primary" className="w-full">
                  Fermer
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full w-10 h-10 p-0 text-[18px]"
              >
                ?
              </Button>
            </TooltipTrigger>
            <TooltipContent>Aide contextuelle accessible</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
