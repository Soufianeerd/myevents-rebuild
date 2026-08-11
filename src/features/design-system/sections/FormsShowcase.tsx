import * as React from 'react';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  Switch,
} from '@/components/ui';

export function FormsShowcase() {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-h3 border-b border-border pb-2">Formulaires</div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Field>
            <FieldLabel>Prénom de l&apos;invité</FieldLabel>
            <Input placeholder="Ex: Jean" />
            <FieldDescription>
              Sera utilisé sur l&apos;invitation nominative.
            </FieldDescription>
          </Field>

          <Field error>
            <FieldLabel>Adresse email</FieldLabel>
            <Input
              type="email"
              placeholder="jean@exemple.com"
              defaultValue="jean@err"
            />
            <FieldError>Format d&apos;email invalide.</FieldError>
          </Field>

          <Field>
            <FieldLabel>Rôle</FieldLabel>
            <Select>
              <option value="guest">Invité</option>
              <option value="vip">VIP</option>
              <option value="family">Famille proche</option>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Message pour les mariés</FieldLabel>
            <Textarea placeholder="Laissez un petit mot..." />
          </Field>

          <Field>
            <FieldLabel>Input désactivé</FieldLabel>
            <Input disabled value="Non modifiable" />
          </Field>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 p-5 rounded-xl border border-border bg-white shadow-sm">
            <div className="text-body-sm font-medium text-neutral-900 mb-2">
              Préférences
            </div>

            <div className="flex items-center gap-3">
              <Field className="flex-row items-center gap-3">
                <Switch id="sw1" defaultChecked />
                <div>
                  <FieldLabel htmlFor="sw1" className="cursor-pointer">
                    Notifications Email
                  </FieldLabel>
                  <FieldDescription>
                    Recevoir un récapitulatif quotidien
                  </FieldDescription>
                </div>
              </Field>
            </div>

            <div className="flex items-center gap-3 mt-4">
              <Field className="flex-row items-center gap-3">
                <Checkbox id="chk1" defaultChecked />
                <FieldLabel
                  htmlFor="chk1"
                  className="cursor-pointer font-normal"
                >
                  Menu végétarien
                </FieldLabel>
              </Field>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Field className="flex-row items-center gap-3">
                <Checkbox id="chk2" />
                <FieldLabel
                  htmlFor="chk2"
                  className="cursor-pointer font-normal"
                >
                  Allergies (préciser)
                </FieldLabel>
              </Field>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <div className="text-body-sm font-medium">Présence</div>
              <div className="flex items-center gap-3">
                <Field className="flex-row items-center gap-3">
                  <Radio name="presence" id="rad1" defaultChecked />
                  <FieldLabel
                    htmlFor="rad1"
                    className="cursor-pointer font-normal"
                  >
                    Sera présent
                  </FieldLabel>
                </Field>
              </div>
              <div className="flex items-center gap-3">
                <Field className="flex-row items-center gap-3">
                  <Radio name="presence" id="rad2" />
                  <FieldLabel
                    htmlFor="rad2"
                    className="cursor-pointer font-normal"
                  >
                    Ne pourra pas venir
                  </FieldLabel>
                </Field>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
