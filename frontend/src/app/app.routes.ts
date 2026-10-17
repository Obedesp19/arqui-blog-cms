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

import { AdminUsers } from './screens/admin/users/users';

import { CommentsModeration } from './screens/comments/moderation/moderation';

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
  canActivate: [RoleGuard],
  data: {
    roles: ['AUTOR', 'EDITOR', 'ADMINISTRADOR'],
  },
},
{
  path: 'posts/form/:id',
  component: PostsForm,
  canActivate: [RoleGuard],
  data: {
    roles: ['AUTOR', 'EDITOR', 'ADMINISTRADOR'],
  },
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
      roles: ['EDITOR', 'ADMINISTRADOR'],
    },
  },
  {
    path: 'categories/create',
    component: CategoriesForm,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['EDITOR', 'ADMINISTRADOR'],
    },
  },
  {
    path: 'categories/:id/edit',
    component: CategoriesForm,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['EDITOR', 'ADMINISTRADOR'],
    },
  },

  /* REPORTS */
  {
    path: 'reports',
    component: ReportsList,
    canActivate: [AuthGuard, RoleGuard],
    data: {
      roles: ['EDITOR', 'ADMINISTRADOR'],
    },
  },
  {
  path: 'workspace/posts',
  component: PostsList,
  canActivate: [RoleGuard],
  data: {
    workspace: true,
    roles: ['AUTOR', 'EDITOR', 'ADMINISTRADOR'],
  },
},
{
  path: 'workspace/posts/:id',
  component: PostsDetail,
  canActivate: [RoleGuard],
  data: {
    workspace: true,
    roles: ['AUTOR', 'EDITOR', 'ADMINISTRADOR'],
  },
},

{
  path: 'admin/users',
  component: AdminUsers,
  canActivate: [RoleGuard],
  data: {
    roles: ['ADMINISTRADOR'],
  },
},

  {
    path: 'workspace/comments',
    component: CommentsModeration,
    canActivate: [RoleGuard],
    data: {
      roles: ['EDITOR', 'ADMINISTRADOR'],
    },
  },

  {
    path: '**',
    redirectTo: 'landing',
  },
];
