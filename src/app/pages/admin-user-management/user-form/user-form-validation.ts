import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Role } from '../../../models/app.models';

export const ADMIN_USER_ROLES: readonly Role[] = ['USER', 'INSTRUCTOR', 'ADMIN'];

export function nonWhitespace(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0
    ? null
    : { whitespace: true };
}

export function validRole(control: AbstractControl): ValidationErrors | null {
  return ADMIN_USER_ROLES.includes(control.value as Role) ? null : { role: true };
}
