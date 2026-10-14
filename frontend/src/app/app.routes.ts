import { Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

import { Landing } from './screens/landing/landing';
import { Login } from './screens/auth/login/login';
import { Registro } from './screens/auth/registro/registro';
import { Dashboard } from './screens/dashboard/dashboard';
import { Profile } from './screens/profile/profile';

import { PostsList } from './screens/posts/list/list';
import { PostsDetail } from './screens/posts/detail/detail';
import { PostsForm } from './screens/posts/form/form';

import { CategoriesList } from './screens/categories/list/list';
import { CategoriesForm } from './screens/categories/form/form';

import { ReportsList } from './screens/reports/list/list';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full',
  },

  {
    path: 'landing',
    component: Landing,
  },

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'registro',
    component: Registro,
  },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [AuthGuard],
  },

  {
    path: 'profile',
    component: Profile,
    canActivate: [AuthGuard],
  },

  /* POSTS */
  {
    path: 'posts',
    component: PostsList,
  },
  {
    path: 'posts/form',
    component: PostsForm,
    canActivate: [AuthGuard],
  },
  {
    path: 'posts/form/:id',
    component: PostsForm,
    canActivate: [AuthGuard],
  },
  {
    path: 'posts/:id',
    component: PostsDetail,
  },

  /* CATEGORIES */
  {
    path: 'categories',
    component: CategoriesList,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['PROFESOR', 'ADMINISTRADOR'],
    },
  },
  {
    path: 'categories/create',
    component: CategoriesForm,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['PROFESOR', 'ADMINISTRADOR'],
    },
  },
  {
    path: 'categories/:id/edit',
    component: CategoriesForm,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['PROFESOR', 'ADMINISTRADOR'],
    },
  },

  /* REPORTS */
  {
    path: 'reports',
    component: ReportsList,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['PROFESOR', 'ADMINISTRADOR'],
    },
  },

  {
    path: '**',
    redirectTo: 'landing',
  },
];
