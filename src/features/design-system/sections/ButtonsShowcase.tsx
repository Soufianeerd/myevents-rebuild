import * as React from 'react';
import { Button, IconButton } from '@/components/ui';

export function ButtonsShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-h3 border-b border-border pb-2">Boutons</div>

      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="text-body-sm font-medium">Variants</div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="gold">Gold</Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-body-sm font-medium">Tailles</div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small (32px)</Button>
            <Button size="default">Default (40px)</Button>
            <Button size="lg">Large (46px)</Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-body-sm font-medium">États</div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button disabled>Disabled Primary</Button>
            <Button variant="secondary" disabled>
              Disabled Secondary
            </Button>
            <Button loading>En cours...</Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="text-body-sm font-medium">Icon Buttons</div>
          <div className="flex flex-wrap gap-4 items-center">
            <IconButton aria-label="Close" variant="secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </IconButton>
            <IconButton aria-label="Edit" variant="primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
            </IconButton>
            <IconButton aria-label="Delete" variant="danger">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}
