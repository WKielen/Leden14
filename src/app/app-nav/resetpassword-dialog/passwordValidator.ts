import { FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";

export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('password1').value === formGroup.get('password2').value)
    return null;
  else
    return {passwordMismatch: true};
};

// import { AbstractControl } from '@angular/forms';

// export class PasswordValidators {
//     static passwordsShouldMatch(control: AbstractControl) {
//       if (control.get('password1').value === control.get('password2').value)
//       return null;
//     else
//       return {passwordMismatch: true};
//     }
// }

