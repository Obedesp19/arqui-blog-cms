import { AuthService } from '../../services/auth.service';
import { Sidebar } from '../../partials/sidebar/sidebar';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../partials/navbar/navbar';
import { Footer } from '../../partials/footer/footer';
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, Navbar, Footer, Sidebar, ...SHARED_IMPORTS],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing { readonly auth = inject(AuthService); drawerOpen = false; }
