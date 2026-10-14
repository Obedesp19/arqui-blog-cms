import { Component, AfterViewInit, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared_imports';
import { Navbar } from '../../partials/navbar/navbar';
import { Footer } from '../../partials/footer/footer';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostsService, PostListItem } from '../../services/posts-service';
import { CategoriesService } from '../../services/categorias-service';
import { CategoryItem } from '../../shared/interfaces/categories.interface';

type UserRole = 'ESTUDIANTE' | 'PROFESOR' | 'ADMINISTRADOR';
type NavbarMode = 'public' | 'private';

interface LandingPost extends PostListItem {
  categoriaTexto: string;
  claseCat: string;
  iniciales: string;
  claseAvatar: string;
  vistas: string;
  destacado: boolean;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    ...SHARED_IMPORTS,
    Navbar,
    Footer,
    RouterLink,
    CommonModule,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit, AfterViewInit {
  @Input() userRole: UserRole = 'ESTUDIANTE';
  @Input() mode: NavbarMode = 'public';
  @Input() isLogin: boolean = false;

  public postsRecientes: LandingPost[] = [];
  public categoriasAcademicas: CategoryItem[] = [];

  constructor(
    private readonly postsService: PostsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  ngOnInit(): void {
    this.postsRecientes = this.postsService
      .getRecentPublicPosts(4)
      .map((post, index) => ({
        ...post,
        categoriaTexto: this.getCategoriaTexto(post.categoria),
        claseCat: this.getClaseCategoria(post.categoria),
        iniciales: this.getIniciales(post.autor),
        claseAvatar: this.getClaseAvatar(index),
        vistas: this.getVistasFake(index),
        destacado: index === 1 || index === 3,
      }));

    this.categoriasAcademicas = this.categoriesService
      .getAllCategories(false)
      .slice(0, 4);
  }

  ngAfterViewInit(): void {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observador.observe(el));
  }

  public getCategoriaTexto(nombre: string): string {
    const key = nombre.toLowerCase();

    if (key.includes('program')) {
      return '</> Programación';
    }

    if (key.includes('inteligencia') || key.includes('ia')) {
      return '✦ IA';
    }

    if (key.includes('mat')) {
      return '∑ Matemáticas';
    }

    if (key.includes('base')) {
      return '▦ Bases de Datos';
    }

    if (key.includes('red')) {
      return '◎ Redes';
    }

    return nombre;
  }

  public getClaseCategoria(nombre: string): string {
    const key = nombre.toLowerCase();

    if (key.includes('program')) {
      return 'etiqueta-cat--prog';
    }

    if (key.includes('inteligencia') || key.includes('ia')) {
      return 'etiqueta-cat--ia';
    }

    if (key.includes('mat')) {
      return 'etiqueta-cat--mat';
    }

    return 'etiqueta-cat--fis';
  }

  public getClaseCategoriaCard(nombre: string): string {
    const key = nombre.toLowerCase();

    if (key.includes('program')) {
      return 'tarjeta-cat--prog';
    }

    if (key.includes('inteligencia') || key.includes('ia')) {
      return 'tarjeta-cat--ia';
    }

    if (key.includes('mat')) {
      return 'tarjeta-cat--mat';
    }

    return 'tarjeta-cat--fis';
  }

  public getIniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  }

  public getClaseAvatar(index: number): string {
    const clases = [
      'autor__avatar--azul',
      'autor__avatar--verde',
      'autor__avatar--ambar',
      'autor__avatar--morado',
    ];

    return clases[index % clases.length];
  }

  public getVistasFake(index: number): string {
    const vistas = ['218', '1.4K', '445', '302'];
    return vistas[index % vistas.length];
  }
}
