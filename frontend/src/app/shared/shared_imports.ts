import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { _MatInternalFormField } from '@angular/material/core';
import {MatButtonModule} from '@angular/material/button';
import { MatCheckbox, MatCheckboxModule } from '@angular/material/checkbox';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatRadioModule} from '@angular/material/radio';


export const SHARED_IMPORTS = [
    CommonModule,
    FormsModule,

    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatToolbarModule,
    MatRadioModule

] as const;
