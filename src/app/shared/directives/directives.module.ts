import { NgModule } from '@angular/core';
import { HoldableDirective } from './holdable.directive';

const componentList = [
  HoldableDirective
]
// With attribute directives, you can change the appearance or behavior of DOM elements and Angular components.

// De directive moet in een module worden geplakt omdat you cannot import directives/components.
// You can only import modules. Once you import the module, you will have access to the directives/components
// that the imported module exports.
@NgModule({
  declarations: [
    ...componentList
  ],
  exports: [
    ...componentList
  ]
  })
  export class HoldableModule { }
