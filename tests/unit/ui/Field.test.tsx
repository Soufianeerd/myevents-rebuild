// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
} from '@/components/ui';

describe('Field Composition', () => {
  afterEach(cleanup);

  it('connects label to input via id', () => {
    render(
      <Field>
        <FieldLabel>Name</FieldLabel>
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText('Name');
    expect(input).toBeInTheDocument();
  });

  it('connects description via aria-describedby', () => {
    render(
      <Field>
        <Input />
        <FieldDescription>Helper text</FieldDescription>
      </Field>,
    );
    const input = screen.getByRole('textbox');
    const descId = input.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();

    // Test that one of the IDs in aria-describedby is the description
    const ids = descId!.split(' ');
    let found = false;
    for (const id of ids) {
      if (document.getElementById(id)?.textContent === 'Helper text') {
        found = true;
      }
    }
    expect(found).toBe(true);
  });

  it('connects error and sets aria-invalid', () => {
    render(
      <Field error>
        <Input />
        <FieldError>Error message</FieldError>
      </Field>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');

    const descId = input.getAttribute('aria-describedby');
    expect(descId).toBeTruthy();

    const ids = descId!.split(' ');
    let found = false;
    for (const id of ids) {
      if (document.getElementById(id)?.textContent === 'Error message') {
        found = true;
      }
    }
    expect(found).toBe(true);
  });
});
