import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { Project, ProjectsIndexFile } from './project.types';

/**
 * Carrega o índice de projetos de `/projects-content/projects.json` (servido a
 * partir de `public/`). São documentos leves, então carregamos tudo de uma vez
 * e filtramos em memória na página.
 */
@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);

  private readonly _projects = signal<Project[]>([]);
  readonly projects = this._projects.asReadonly();
  readonly loaded = signal(false);
  readonly error = signal(false);

  /** Projetos marcados como destaque (exibidos na home). */
  readonly featured = computed(() => this._projects().filter((p) => p.featured));

  private index$?: Observable<Project[]>;

  constructor() {
    this.loadIndex().subscribe();
  }

  /** Índice de projetos, ordenado do mais recente ao mais antigo (cacheado). */
  loadIndex(): Observable<Project[]> {
    if (!this.index$) {
      this.index$ = this.http.get<ProjectsIndexFile>('/projects-content/projects.json').pipe(
        map((file) => [...(file?.projects ?? [])].sort((a, b) => b.year.localeCompare(a.year))),
        catchError(() => {
          this.error.set(true);
          this.loaded.set(true);
          return of<Project[]>([]);
        }),
        shareReplay(1),
      );
      this.index$.subscribe((projects) => {
        if (projects.length || !this.error()) {
          this._projects.set(projects);
          this.loaded.set(true);
        }
      });
    }
    return this.index$;
  }
}
