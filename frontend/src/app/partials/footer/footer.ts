import { Component } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared_imports';

@Component({
  selector: 'app-footer',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {

}
