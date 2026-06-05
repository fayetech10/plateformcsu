# Composants UI partagés — `shared/ui/`

Bibliothèque de composants visuels réutilisables pour assurer la cohérence du
design sur toute la plateforme CSU. Chaque composant est standalone, importable
individuellement, et utilise les tokens CSS du fichier `src/styles.scss`.

## Import

```ts
import {
  PageHeaderComponent,
  EmptyStateComponent,
  LoadingComponent,
  KpiCardComponent
} from '../../shared/ui';
```

Puis dans le décorateur du composant :

```ts
@Component({
  imports: [CommonModule, PageHeaderComponent, EmptyStateComponent, ...],
  ...
})
```

## Composants disponibles

### `<csu-page-header>` — En-tête de page

```html
<csu-page-header
  icon="bi-people-fill"
  iconColor="var(--csu-primary)"
  title="Patients"
  subtitle="Gestion des bénéficiaires"
  badge="Classique"
  badgeClass="text-bg-success">
  <button class="csu-btn csu-btn-light">Filtrer</button>
  <button class="csu-btn csu-btn-primary">Nouveau patient</button>
</csu-page-header>
```

| Input | Type | Description |
|---|---|---|
| `title` | string | Titre de la page (obligatoire) |
| `subtitle` | string? | Sous-titre descriptif |
| `icon` | string? | Classe Bootstrap Icons (ex: `bi-people-fill`) |
| `iconColor` | string? | Couleur CSS de l'icône |
| `badge` | string? | Pastille à afficher sous le titre |
| `badgeClass` | string? | Classes CSS additionnelles pour la pastille |

### `<csu-empty-state>` — État vide

```html
<csu-empty-state
  icon="bi-search"
  title="Aucun résultat"
  message="Aucun patient ne correspond à votre recherche.">
  <button class="csu-btn csu-btn-primary">Réinitialiser</button>
</csu-empty-state>

<!-- Version compacte (dans une carte étroite) -->
<csu-empty-state icon="bi-inbox" title="Aucune notification" compact />
```

### `<csu-loading>` — Indicateur de chargement

```html
<!-- Spinner par défaut -->
<csu-loading message="Chargement en cours..." />

<!-- Skeleton lines (placeholder de contenu) -->
<csu-loading variant="skeleton" [rows]="5" />
```

### `<csu-kpi-card>` — Indicateur clé

```html
<csu-kpi-card
  icon="bi-people-fill"
  tone="primary"
  [value]="42"
  label="Patients"
  trend="+3 cette semaine"
  trendDirection="up"
  link="/patients" />
```

Tons disponibles : `primary`, `secondary`, `accent`, `success`, `warning`, `danger`, `info`, `neutral`.

## Service de notification unifié

Au lieu d'utiliser `Swal.fire(...)` directement, utilisez le `NotificationService` :

```ts
private notify = inject(NotificationService);

// Toast non bloquant
this.notify.toast('Enregistré', 'success');

// Alerte modale
this.notify.success('Patient créé', 'La fiche a bien été enregistrée.');
this.notify.error('Action impossible', err.message);

// Confirmation
if (await this.notify.confirm('Supprimer ce patient ?', { danger: true })) {
  // ...
}

// Saisie
const motif = await this.notify.prompt('Motif du refus', { required: true, multiline: true });
```

## Convention design

- **Couleurs** : utiliser les variables CSS `--csu-*` plutôt que des valeurs hex.
- **Espacement** : utiliser `rem` (pas px).
- **Rayons** : `var(--csu-radius-*)`.
- **Ombres** : `var(--csu-shadow-*)`.
- **Transitions** : `var(--csu-transition*)`.
- Préférer ces composants partagés à du HTML/CSS dupliqué.
