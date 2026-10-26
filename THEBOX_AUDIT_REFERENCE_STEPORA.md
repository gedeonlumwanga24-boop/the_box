# DOSSIER DE RÉFÉRENCE TECHNIQUE ET PLAN DE RECONSTRUCTION
# TheBox — Reprise fonctionnelle de Stepora vers Node.js, NestJS et React

**Date de révision** : 26 octobre 2026  
**Version** : 2.0 — adaptation pour TheBox  
**Projet source** : Stepora — Laravel 12, PHP, MySQL et PawaPay  
**Projet cible** : TheBox — Node.js, NestJS, TypeScript, React, PostgreSQL  
**Statut** : document de référence pour la conception et le développement, pas preuve que chaque fonctionnalité source est opérationnelle.

> **Décision de projet** : TheBox sera reconstruit dans une nouvelle base de code avec Node.js/NestJS pour le backend et React/TypeScript pour le frontend, en utilisant PostgreSQL. Le projet Stepora existant reste intact et sert de référence fonctionnelle, métier et visuelle. Ce document ne recommande donc plus de conserver Laravel comme cible.

## Comment utiliser ce document

Ce dossier réunit deux types d'informations qu'il faut garder distincts :

1. **Référence Stepora** : inventaire, comportements, parcours, entités, paiements et problèmes mentionnés dans l'audit d'origine. Ces éléments doivent être vérifiés dans le code source et dans l'application avant d'être considérés comme confirmés.
2. **Spécification TheBox** : architecture cible, contrats API, règles métier, exigences de sécurité, stratégie de tests et ordre de réalisation proposés pour la nouvelle application.

Les chemins de fichiers PHP/Laravel et les exemples PHP qui suivent décrivent le projet source, pas des fichiers à copier dans TheBox. Les exemples NestJS/TypeScript décrivent la cible, mais doivent être adaptés et testés pendant l'implémentation. Les éléments non vérifiés sont à marquer « à confirmer » dans le suivi de développement.

## TABLE DES MATIÈRES

1. [Résumé exécutif et décision pour TheBox](#résumé-exécutif)
2. [Inventaire du projet source Stepora](#phase-1---inventaire-et-compréhension-du-projet)
3. [Audit fonctionnel de référence](#phase-2---audit-fonctionnel-complet)
4. [Audit technique du projet source](#phase-3---audit-technique-et-qualité-du-code)
5. [Sécurité : risques à traiter dans TheBox](#phase-4---audit-de-sécurité)
6. [Paiements et PawaPay](#phase-5---audit-complet-du-système-de-paiement-pawapay)
7. [Données et modèle PostgreSQL cible](#phase-6---audit-de-la-base-de-données-existant)
8. [Architecture cible TheBox](#phase-8---conception-de-larchitecture-cible)
9. [Backend NestJS](#phase-9---conception-détaillée-du-backend-nestjs)
10. [API REST TheBox](#phase-10---conception-complète-des-api)
11. [Authentification et autorisation](#phase-11---authentification-et-autorisation)
12. [Plan de construction par phases](#plan-de-construction-de-thebox)
13. [Risques et mesures de réduction](#risques-et-mitigations)
14. [Critères de livraison](#recommandations-finales)

---

## RÉSUMÉ EXÉCUTIF

### Objectif

Reconstruire les capacités utiles de Stepora dans TheBox avec une stack TypeScript cohérente : **React + TypeScript** côté interface, **NestJS + TypeScript** côté serveur et **PostgreSQL** pour les données. Node.js est l'environnement d'exécution du backend. La cible démarre comme un **monolithe modulaire**, sans microservices prématurés.

### Règles de migration

- Stepora reste la référence et ne doit pas être modifié pendant la reconstruction.
- Reproduire les parcours réellement nécessaires, pas transposer mécaniquement les contrôleurs ou les classes Laravel.
- Reprendre les règles métier et les données utiles, tout en concevant une architecture idiomatique NestJS.
- Développer par tranches verticales testables : interface, API, base de données et tests pour une fonctionnalité donnée.
- Ne jamais déclarer un paiement réussi à partir du seul retour du navigateur ; vérifier côté serveur le statut, le montant, la devise, la référence et l'authenticité du webhook.
- Ne pas importer automatiquement des faiblesses relevées dans l'ancien système, notamment la désactivation éventuelle de la vérification TLS ou une vérification insuffisante des webhooks.
- Garder les secrets dans les variables d'environnement et ne jamais les versionner.

### Fonctionnalités de référence à inventorier et valider

Selon l'audit d'origine, Stepora comprend ou prévoit un catalogue de produits et catégories, la recherche, un panier, les commandes, les paiements Mobile Money via PawaPay, une administration, l'authentification, les messages et une API. **Cette liste constitue un périmètre à vérifier**, et non une certification que tous les parcours sont fonctionnels.

### Architecture cible retenue

- **Frontend** : React + TypeScript, application responsive.
- **Backend** : NestJS + TypeScript, API REST versionnée.
- **Base de données** : PostgreSQL.
- **Accès aux données** : Prisma ORM (choix proposé, à figer lors de l'initialisation du projet).
- **Validation** : DTOs NestJS et `class-validator`/`class-transformer`, avec validation côté serveur.
- **Documentation API** : OpenAPI/Swagger.
- **Tests** : Jest pour unitaires/intégration, tests end-to-end pour les parcours critiques.
- **Gestion des dépendances** : npm, avec fichier lock versionné.
- **Démarrage local** : configuration adaptée à Windows 10 et 8 Go de RAM ; éviter les services et outils non indispensables.

### Hors périmètre du premier incrément

Ne pas commencer par des microservices, Kubernetes, une architecture événementielle distribuée, plusieurs fournisseurs de paiement ou des fonctions marketing avancées. Les ajouter uniquement après un besoin démontré et une base fonctionnelle testée.

---

## PHASE 1 - INVENTAIRE ET COMPRÉHENSION DU PROJET

### 1.1 Structure du Répertoire

```
stepora/
├── app/
│   ├── Actions/              # Actions Laravel (single-purpose classes)
│   ├── Contracts/           # Interfaces (PaymentGatewayInterface)
│   ├── DTOs/                # Data Transfer Objects (readonly)
│   ├── Enums/               # Énumérations (OrderStatus, UserRole)
│   ├── Events/              # Événements (OrderPlaced, OrderCancelled)
│   ├── Exceptions/          # Exceptions personnalisées
│   ├── Helpers/             # Fonctions helpers globaux
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/         # Contrôleurs API REST
│   │   │   │   ├── V1/      # API Version 1
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   ├── CartController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   ├── CategoryController.php
│   │   │   │   │   └── SearchController.php
│   │   │   │   ├── ApiController.php (base)
│   │   │   │   └── PawaPayWebhookController.php
│   │   │   └── Web/         # Contrôleurs web Blade
│   │   │       ├── Admin/   # Administration
│   │   │       │   ├── ProduitController.php
│   │   │       │   ├── CommandeController.php
│   │   │       │   ├── CategoryController.php
│   │   │       │   ├── ClientController.php
│   │   │       │   ├── MessageController.php
│   │   │       │   ├── StatsController.php
│   │   │       │   ├── ConfigController.php
│   │   │       │   ├── ErrorLogController.php
│   │   │       │   ├── AdminUserController.php
│   │   │       │   └── NewsletterController.php
│   │   │       ├── Auth/
│   │   │       │   └── GoogleController.php
│   │   │       ├── ProduitController.php
│   │   │       ├── PanierController.php
│   │   │       ├── CommandeController.php
│   │   │       ├── ContactController.php
│   │   │       ├── ProfileController.php
│   │   │       └── AuthController.php
│   │   ├── Middleware/      # Middleware (auth, roles, security)
│   │   ├── Requests/        # FormRequest validations
│   │   └── Resources/       # API Resources (transformations)
│   ├── Jobs/                # Queue jobs
│   ├── Listeners/           # Event listeners
│   ├── Mail/                # Email templates
│   ├── Models/              # Modèles Eloquent
│   ├── Notifications/       # Notifications
│   ├── Payments/            # Système de paiement
│   │   └── Drivers/         # Drivers (Stripe, PayPal, Orange Money)
│   ├── Policies/            # Authorization policies
│   ├── Providers/           # Service providers
│   ├── Repositories/        # Pattern Repository
│   ├── Services/            # Logique métier
│   └── Traits/              # Traits réutilisables
├── database/
│   ├── migrations/          # 34 migrations
│   ├── seeders/             # Seeders
│   └── factories/           # Factories pour tests
├── resources/
│   ├── views/               # Vues Blade
│   │   ├── layouts/         # Layouts principaux
│   │   ├── components/      # Composants Blade
│   │   ├── admin/           # Vues admin
│   │   ├── dashboard/       # Dashboard admin
│   │   ├── produits/       # Vues produits
│   │   ├── panier/          # Vues panier
│   │   ├── commande/        # Vues commande
│   │   ├── compte/          # Espace client
│   │   ├── messagerie/      # Messagerie
│   │   ├── partials/        # Fragments réutilisables
│   │   ├── emails/          # Templates emails
│   │   └── errors/          # Pages d'erreur
│   ├── css/                 # Assets CSS (Tailwind 4.0)
│   └── js/                  # Assets JS (Vite)
├── routes/
│   ├── web.php              # Routes web (152 lignes)
│   ├── api.php              # Routes API (98 lignes)
│   └── console.php          # Routes console
├── config/                  # Fichiers de configuration
├── public/                  # Dossier public
├── storage/                 # Stockage (logs, uploads)
├── tests/                   # Tests (Feature, Unit)
└── vendor/                  # Dépendances Composer
```

### 1.2 Dépendances PHP (composer.json)

**Dépendances principales** :
- `laravel/framework`: ^12.0
- `laravel/sanctum`: ^4.3 (API tokens)
- `laravel/tinker`: ^2.10.1
- `spatie/laravel-permission`: * (Gestion des rôles/permissions)

**Dépendances de développement** :
- `fakerphp/faker`: ^1.23 (Tests)
- `knuckleswtf/scribe`: ^5.10 (Documentation API)
- `laravel/pail`: ^1.2.2 (Logs)
- `laravel/pint`: ^1.24 (Linting)
- `laravel/sail`: ^1.41 (Docker)
- `laravel/telescope`: ^5.20 (Debug)
- `phpunit/phpunit`: ^11.5.50 (Tests)

### 1.3 Dépendances JavaScript (package.json)

**Dépendances de développement** :
- `@tailwindcss/vite`: ^4.0.0
- `axios`: ^1.11.0 (HTTP client)
- `concurrently`: ^9.0.1 (Scripts parallèles)
- `laravel-vite-plugin`: ^2.0.0
- `tailwindcss`: ^4.0.0
- `vite`: ^7.0.7 (Build tool)

### 1.4 Modèles Eloquent (11 modèles)

| Modèle | Table | Responsabilité | Relations |
|--------|-------|----------------|-----------|
| **User** | users | Utilisateurs (admin/client) | hasMany(Commande), hasOne(Client) |
| **Client** | clients | Informations client | belongsTo(User) |
| **Produit** | produits | Produits catalogue | belongsTo(Category), belongsToMany(Commande) |
| **Category** | categories | Catégories produits | hasMany(Produit), belongsTo(self), hasMany(self) |
| **Panier** | paniers | Paniers d'achat | hasMany(PanierItem), belongsTo(User) |
| **PanierItem** | panier_items | Articles panier | belongsTo(Panier), belongsTo(Produit) |
| **Commande** | commandes | Commandes | belongsTo(User), belongsToMany(Produit) |
| **CommandeProduit** | commande_produit | Pivot commande-produit | belongsTo(Commande), belongsTo(Produit) |
| **Message** | messages | Messages contact | - |
| **ErrorLog** | error_logs | Journal erreurs | - |
| **SiteConfig** | site_configs | Configuration site | - |

### 1.5 Services Métier (9 services)

| Service | Responsabilité | État |
|---------|----------------|------|
| **PawaPayService** | Intégration PawaPay Mobile Money | ✅ Complet |
| **CartService** | Logique panier (DB + Session) | ✅ Complet |
| **OrderService** | Logique commandes + pessimistic locking | ✅ Complet |
| **PaymentService** | Gestion passerelles paiement | ⚠️ Partiel (drivers simulés) |
| **SearchService** | Recherche produits | ✅ Complet |
| **CategoryService** | Logique catégories | ❌ Vide |
| **ProductService** | Logique produits | ❌ Vide |
| **MessageService** | Logique messagerie | ⚠️ À explorer |
| **ErrorLogService** | Gestion logs erreurs | ✅ Complet |

### 1.6 Middleware (6 custom)

| Middleware | Responsabilité |
|------------|----------------|
| **AdminMiddleware** | Vérifie rôle admin |
| **ManagerMiddleware** | Vérifie rôle manager |
| **CustomerMiddleware** | Vérifie rôle customer |
| **CheckRole** | Vérification rôle générique |
| **CheckPermission** | Vérification permission générique |
| **SecurityHeaders** | Headers sécurité HTTP |

### 1.7 Routes

**Routes Web (152 lignes)** :
- Frontend public : accueil, produits, panier, contact, auth
- Frontend authentifié : commande, paiement, compte, messagerie
- Admin : dashboard, CRUD produits/catégories/commandes/clients/messages, config, errors, admins, newsletter

**Routes API (98 lignes)** :
- Webhook PawaPay : `/webhooks/pawapay/callback`
- API V1 :
  - Auth : register, login, logout, me, profile (throttle: 10/min)
  - Public : products, categories, search (7 endpoints)
  - Cart : 5 endpoints (invités + authentifiés)
  - Authentifié : orders (throttle: 30/min pour admin)

### 1.8 Configuration

**Fichiers config importants** :
- `config/pawapay.php` : Configuration PawaPay (base_url, api_token, currency, fee_percentage, providers, callback_url)
- `config/payments.php` : Configuration drivers (stripe, paypal, orange_money)
- `config/auth.php` : Authentification
- `config/database.php` : Base de données (SQLite par défaut)
- `config/filesystems.php` : Stockage fichiers
- `config/mail.php` : Configuration email
- `config/permission.php` : Spatie Permissions
- `config/sanctum.php` : API tokens
- `config/telescope.php` : Laravel Telescope

**Variables .env manquantes dans .env.example** :
- `PAWAPAY_BASE_URL`
- `PAWAPAY_API_TOKEN`
- `PAWAPAY_CURRENCY`
- `PAWAPAY_FEE_PERCENTAGE`
- `PAWAPAY_CALLBACK_URL`

---

## PHASE 2 - AUDIT FONCTIONNEL COMPLET

### 2.1 Cartographie des Fonctionnalités

#### 2.1.1 Gestion des Utilisateurs

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Inscription email/mot de passe | ✅ Implémenté | AuthController.php | /register | ❌ Aucun |
| Connexion | ✅ Implémenté | AuthController.php | /login | ❌ Aucun |
| Déconnexion | ✅ Implémenté | AuthController.php | /logout | ❌ Aucun |
| OAuth Google | ✅ Implémenté | GoogleController.php | /auth/google/* | ❌ Aucun |
| Réinitialisation mot de passe | ❌ Absent | - | - | - |
| Vérification email | ⚠️ Partiel (vue existe) | verify-email.blade.php | - | - |
| Modification profil | ✅ Implémenté | ProfileController.php | /compte/modifier | ❌ Aucun |
| Upload avatar | ✅ Implémenté | migration 2026_06_09_122309 | - | ❌ Aucun |
| Soft delete users | ✅ Implémenté | User.php (trait) | - | ❌ Aucun |
| Rôles (admin/manager/customer) | ✅ Implémenté | Spatie Permissions | - | ❌ Aucun |

**Modèles concernés** : User, Client  
**Services** : -  
**Validations** : FormRequest non observé (validation inline)  
**Permissions** : Spatie Laravel Permission

#### 2.1.2 Catalogue de Produits

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Liste produits avec filtres | ✅ Implémenté | ProduitController.php | /produits | ❌ Aucun |
| Détail produit | ✅ Implémenté | ProduitController.php | /produits/{id} | ❌ Aucun |
| Recherche textuelle | ✅ Implémenté | SearchService.php | /produits?search= | ❌ Aucun |
| Filtre par catégorie | ✅ Implémenté | ProduitController.php | /produits?category= | ❌ Aucun |
| Filtre par prix max | ✅ Implémenté | ProduitController.php | /produits?prixMax= | ❌ Aucun |
| Filtre promotion | ✅ Implémenté | ProduitController.php | /produits?promotion=1 | ❌ Aucun |
| Tri (prix, récent) | ✅ Implémenté | ProduitController.php | /produits?sort= | ❌ Aucun |
| CRUD produits (admin) | ✅ Implémenté | Admin/ProduitController.php | /admin/produits | ❌ Aucun |
| Gestion images produit | ✅ Implémenté | Admin/ProduitController.php | - | ❌ Aucun |
| Galerie produits (JSON) | ✅ Implémenté | Produit.php (cast) | - | ❌ Aucun |
| Gestion stock | ✅ Implémenté | Produit.php (stock field) | - | ❌ Aucun |
| Variantes (taille/couleur) | ⚠️ Partiel (panier items) | PanierItem.php | - | ❌ Aucun |

**Modèles concernés** : Produit, Category  
**Services** : ProductService (vide), SearchService  
**Validations** : FormRequest non observé  
**Permissions** : ProduitPolicy

#### 2.1.3 Catégories

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Catégories hiérarchiques | ✅ Implémenté | Category.php (parent/children) | - | ❌ Aucun |
| CRUD catégories (admin) | ✅ Implémenté | Admin/CategoryController.php | /admin/categories | ❌ Aucun |
| Image catégorie | ✅ Implémenté | migration 2026_05_05_001732 | - | ❌ Aucun |
| Ordre d'affichage | ✅ Implémenté | Category.php (display_order) | - | ❌ Aucun |
| Navigation frontend | ✅ Implémenté | Category::navigation() scope | - | ❌ Aucun |

**Modèles concernés** : Category  
**Services** : CategoryService (vide)  
**Validations** : FormRequest non observé  
**Permissions** : CategoryPolicy

#### 2.1.4 Panier d'Achat

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Ajout au panier | ✅ Implémenté | PanierController.php, CartService.php | /panier/ajouter/{id} | ❌ Aucun |
| Modification quantité | ✅ Implémenté | PanierController.php, CartService.php | /panier/update/{id}/{action} | ❌ Aucun |
| Suppression article | ✅ Implémenté | PanierController.php, CartService.php | /panier/supprimer/{id} | ❌ Aucun |
| Vidage panier | ✅ Implémenté | PanierController.php, CartService.php | /panier/vider | ❌ Aucun |
| Support invités (session) | ✅ Implémenté | CartService.php | - | ❌ Aucun |
| Support authentifiés (DB) | ✅ Implémenté | CartService.php | - | ❌ Aucun |
| Sync session → DB | ✅ Implémenté | CartService::syncSessionToDatabase() | - | ❌ Aucun |
| Validation stock | ✅ Implémenté | CartService.php (InsufficientStockException) | - | ❌ Aucun |
| Drawer panier (AJAX) | ✅ Implémenté | components/cart-drawer.blade.php | - | ❌ Aucun |
| API panier REST | ✅ Implémenté | Api/V1/CartController.php | /api/v1/cart/* | ❌ Aucun |

**Modèles concernés** : Panier, PanierItem  
**Services** : CartService  
**Validations** : CartItemData DTO  
**Permissions** : Aucune (publique + authentifiés)

#### 2.1.5 Commandes

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Création commande depuis panier | ✅ Implémenté | OrderService.php, CommandeController.php | /commande (POST) | ❌ Aucun |
| Pessimistic locking (anti-overselling) | ✅ Implémenté | OrderService::createOrder() | - | ❌ Aucun |
| Annulation commande + restitution stock | ✅ Implémenté | OrderService::cancelOrder() | - | ❌ Aucun |
| Validation transitions statut | ✅ Implémenté | OrderService::updateOrderStatus() | - | ❌ Aucun |
| Statuts : en_attente, confirmée, expédiée, livrée, annulée | ✅ Implémenté | Commande.php constants | - | ❌ Aucun |
| Liste commandes client | ✅ Implémenté | ProfileController.php, OrderService.php | /compte | ❌ Aucun |
| Détail commande | ✅ Implémenté | ProfileController.php | /compte/{id} | ❌ Aucun |
| CRUD commandes (admin) | ✅ Implémenté | Admin/CommandeController.php | /admin/commandes | ❌ Aucun |
| Mise à jour statut (admin) | ✅ Implémenté | Admin/CommandeController.php | /admin/commandes/{id} | ❌ Aucun |
| API commandes REST | ✅ Implémenté | Api/V1/OrderController.php | /api/v1/orders/* | ❌ Aucun |
| Events OrderPlaced/OrderCancelled | ✅ Implémenté | Events/Listeners | - | ❌ Aucun |

**Modèles concernés** : Commande, CommandeProduit  
**Services** : OrderService  
**Validations** : OrderData DTO  
**Permissions** : CommandePolicy

#### 2.1.6 Système de Paiement

##### A. PawaPay (Mobile Money Automatisé)

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Initiation dépôt PawaPay | ✅ Implémenté | PawaPayService.php | /commande/{id}/pawapay/initier | ❌ Aucun |
| Détection opérateur par préfixe | ✅ Implémenté | PawaPayService::detectProviderFromPhone() | - | ❌ Aucun |
| Normalisation numéro téléphone | ✅ Implémenté | PawaPayService.php | - | ❌ Aucun |
| Calcul frais (2% par défaut) | ✅ Implémenté | PawaPayService::computeAmountWithFees() | - | ❌ Aucun |
| Polling statut (5s) | ✅ Implémenté | PawaPayService::checkDepositStatus() | /commande/{id}/pawapay/statut | ❌ Aucun |
| Webhook callback | ✅ Implémenté | PawaPayWebhookController.php | /webhooks/pawapay/callback | ❌ Aucun |
| Idempotence webhook | ✅ Implémenté | PawaPayWebhookController::handleCompleted() | - | ❌ Aucun |
| Page attente confirmation PIN | ✅ Implémenté | pawapay_attente.blade.php | /commande/{id}/pawapay/attente | ❌ Aucun |
| Page succès | ✅ Implémenté | pawapay_succes.blade.php | /commande/{id}/pawapay/succes | ❌ Aucun |
| Page échec | ✅ Implémenté | pawapay_echec.blade.php | /commande/{id}/pawapay/echec | ❌ Aucun |
| Sync manuelle PawaPay (admin) | ✅ Implémenté | Admin/CommandeController::syncPawaPay() | /admin/commandes/{id}/sync-pawapay | ❌ Aucun |
| Email confirmation automatique | ✅ Implémenté | PaymentConfirmationMail.php | - | ❌ Aucun |
| Opérateurs : M-Pesa, Airtel, Orange | ✅ Implémenté | config/pawapay.php providers | - | ❌ Aucun |
| Comptes de test sandbox | ✅ Documenté | Pawapay_Documentation.md | - | ❌ Aucun |

**Modèles concernés** : Commande (champs pawapay_deposit_id, mobile_money_provider, mobile_money_number)  
**Services** : PawaPayService  
**Validations** : Validation inline dans controller  
**Permissions** : Aucune (publique pour initiation)

##### B. Paiement Manuel (Compatibilité)

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Upload preuve paiement | ✅ Implémenté | CommandeController.php | /commande/{id}/preuve | ❌ Aucun |
| Validation paiement admin | ✅ Implémenté | Admin/CommandeController.php | /admin/commandes/{id}/valider | ❌ Aucun |
| Refus paiement admin | ✅ Implémenté | Admin/CommandeController.php | /admin/commandes/{id}/refuser | ❌ Aucun |
| Email validation | ✅ Implémenté | PaymentValidatedMail.php | - | ❌ Aucun |
| Email refus | ✅ Implémenté | PaymentRefusedMail.php | - | ❌ Aucun |

**Modèles concernés** : Commande (payment_proof, payment_status)  
**Services** : -  
**Validations** : Validation inline  
**Permissions** : Admin uniquement

##### C. Autres Passerelles (Simulées)

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Stripe driver | ⚠️ Simulé | StripeDriver.php | - | ❌ Aucun |
| PayPal driver | ⚠️ Simulé | PayPalDriver.php | - | ❌ Aucun |
| Orange Money driver | ⚠️ Simulé | OrangeMoneyDriver.php | - | ❌ Aucun |
| Interface PaymentGatewayInterface | ✅ Définie | PaymentGatewayInterface.php | - | ❌ Aucun |
| PaymentService abstraction | ✅ Implémenté | PaymentService.php | - | ❌ Aucun |

**Modèles concernés** : -  
**Services** : PaymentService  
**Validations** : -  
**Permissions** : -

#### 2.1.7 Messagerie

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Formulaire contact public | ✅ Implémenté | ContactController.php | /contact | ❌ Aucun |
| Messagerie client | ✅ Implémenté | ProfileController.php | /messagerie | ❌ Aucun |
| Thread conversation (admin) | ✅ Implémenté | Admin/MessageController.php | /admin/messages/{id} | ❌ Aucun |
| Réponse admin + email | ✅ Implémenté | Admin/MessageController.php | /admin/messages/{id}/reply | ❌ Aucun |
| Statut message (lu/non lu) | ✅ Implémenté | Message.php (client_read) | - | ❌ Aucun |
| Group by email (admin) | ✅ Implémenté | Admin/MessageController.php | - | ❌ Aucun |

**Modèles concernés** : Message  
**Services** : MessageService (à explorer)  
**Validations** : Validation inline  
**Permissions** : Aucune (publique), Admin pour réponse

#### 2.1.8 Administration

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Dashboard avec KPIs | ✅ Implémenté | StatsController.php | /admin | ❌ Aucun |
| Graphiques ventes mensuelles | ✅ Implémenté | StatsController.php | - | ❌ Aucun |
| Bulletin marché (panier moyen, etc.) | ✅ Implémenté | StatsController.php | - | ❌ Aucun |
| CRUD produits | ✅ Implémenté | Admin/ProduitController.php | /admin/produits | ❌ Aucun |
| CRUD catégories | ✅ Implémenté | Admin/CategoryController.php | /admin/categories | ❌ Aucun |
| CRUD commandes | ✅ Implémenté | Admin/CommandeController.php | /admin/commandes | ❌ Aucun |
| Liste paiements en attente | ✅ Implémenté | Admin/CommandeController.php | /admin/commandes/paiements-en-attente | ❌ Aucun |
| CRUD clients (avec soft delete) | ✅ Implémenté | Admin/ClientController.php | /admin/clients | ❌ Aucun |
| CRUD messages | ✅ Implémenté | Admin/MessageController.php | /admin/messages | ❌ Aucun |
| Configuration site (images, textes) | ✅ Implémenté | Admin/ConfigController.php | /admin/config | ❌ Aucun |
| Journal des erreurs | ✅ Implémenté | ErrorLogController.php | /admin/errors | ❌ Aucun |
| Gestion administrateurs | ✅ Implémenté | AdminUserController.php | /admin/admins | ❌ Aucun |
| Envoi newsletter | ✅ Implémenté | Admin/NewsletterController.php | /admin/newsletter | ❌ Aucun |

**Modèles concernés** : Tous  
**Services** : ErrorLogService, MessageService  
**Validations** : Validation inline  
**Permissions** : Middleware admin, Spatie roles

#### 2.1.9 Autres Fonctionnalités

| Fonctionnalité | État | Fichiers | Routes | Tests |
|----------------|------|----------|--------|-------|
| Recherche avancée | ✅ Implémenté | SearchService.php | /api/v1/search/advanced | ❌ Aucun |
| Autocomplete recherche | ✅ Implémenté | SearchService.php | /api/v1/search/autocomplete | ❌ Aucun |
| Recherches populaires | ✅ Implémenté | SearchService.php | /api/v1/search/popular | ❌ Aucun |
| Page à propos | ✅ Implémenté | apropos.blade.php | /apropos | ❌ Aucun |
| Configuration dynamique site | ✅ Implémenté | SiteConfig.php | - | ❌ Aucun |
| Laravel Telescope (debug) | ✅ Implémenté | config/telescope.php | /telescope | ❌ Aucun |
| Documentation API (Scribe) | ✅ Implémenté | knuckleswtf/scribe | /scribe | ❌ Aucun |
| Logging erreurs structuré | ✅ Implémenté | ErrorLogService.php | - | ❌ Aucun |
| View Composers (nav/footer) | ✅ Implémenté | AppServiceProvider.php | - | ❌ Aucun |

### 2.2 Fonctionnalités Manquantes ou Partielles

| Fonctionnalité | État | Priorité |
|----------------|------|----------|
| Réinitialisation mot de passe | ❌ Absent | Élevée |
| Vérification email complète | ⚠️ Partiel | Moyenne |
| Wishlist | ❌ Absent | Faible |
| Évaluations produits (reviews) | ❌ Absent | Moyenne |
| Système de promotions/coupons | ❌ Absent | Moyenne |
| Calcul automatique frais livraison | ❌ Absent | Élevée |
| Gestion taxes | ❌ Absent | Élevée |
| Remboursements automatisés | ❌ Absent | Moyenne |
| Factures PDF | ❌ Absent | Moyenne |
| Notifications temps réel | ❌ Absent | Faible |
| Multi-langue | ❌ Absent | Faible |
| Dark mode | ❌ Absent | Faible |
| PWA | ❌ Absent | Faible |

---

## PHASE 3 - AUDIT TECHNIQUE ET QUALITÉ DU CODE

### 3.1 Architecture Laravel

#### 3.1.1 Points Positifs

1. **Séparation des responsabilités** ✅
   - Services métier isolés (CartService, OrderService, PawaPayService)
   - DTOs pour transfert de données (ProductData, OrderData, CartItemData)
   - Pattern Repository pour accès aux données
   - Actions pour opérations single-purpose

2. **Pattern Repository** ✅
   - Interfaces définies (ProductRepositoryInterface, CategoryRepositoryInterface, OrderRepositoryInterface)
   - Implémentations Eloquent
   - Cache decorator (CachedProductRepository, CachedCategoryRepository)

3. **Events & Listeners** ✅
   - OrderPlaced → SendOrderConfirmation, LogOrderCancellation
   - OrderCancelled → LogOrderCancellation
   - ProductOutOfStock → NotifyLowStock

4. **Policies** ✅
   - ProduitPolicy, CommandePolicy, CategoryPolicy, UserPolicy
   - Intégration avec Spatie Permissions

5. **API Resources** ✅
   - ProductResource, OrderResource, CategoryResource, CartResource
   - Collections pour listes

6. **Pessimistic Locking** ✅
   - OrderService::createOrder() utilise lockForUpdate()
   - Anti-overselling sur le stock
   - Retry 3 fois en cas de deadlock

7. **Transactions DB** ✅
   - OrderService utilise DB::transaction()
   - Rollback automatique en cas d'erreur

8. **Middleware Architecture** ✅
   - AdminMiddleware, ManagerMiddleware, CustomerMiddleware
   - CheckRole, CheckPermission
   - SecurityHeaders global

#### 3.1.2 Problèmes Observés

##### Niveau CRITIQUE

1. **SSL Verification Disabled en Production** 🔴
   - **Fichier** : `app/Services/PawaPayService.php:45`
   - **Problème** : `Http::withoutVerifying()` désactive la vérification SSL
   - **Impact** : Vulnérabilité MITM en production
   - **Solution** : Activer la vérification SSL en production, utiliser un certificat valide
   - **Priorité** : Critique

##### Niveau ÉLEVÉ

2. **Drivers de Paiement Simulés** 🟠
   - **Fichiers** : `app/Payments/Drivers/StripeDriver.php`, `PayPalDriver.php`, `OrangeMoneyDriver.php`
   - **Problème** : Méthodes charge() et refund() retournent des données simulées
   - **Impact** : Paiements Stripe/PayPal/Orange Money non fonctionnels
   - **Solution** : Intégrer les SDK officiels (stripe-php, paypal/php-sdk)
   - **Priorité** : Élevée

3. **Tests Insuffisants** 🟠
   - **Observation** : Dossiers tests/Feature et tests/Unit quasi vides
   - **Impact** : Risques de régressions non détectées
   - **Solution** : Écrire des tests unitaires et fonctionnels pour les services critiques
   - **Priorité** : Élevée

4. **Double Logique Panier** 🟠
   - **Fichiers** : `app/Http/Controllers/Web/PanierController.php` et `app/Http/Controllers/Api/V1/CartController.php`
   - **Problème** : Logique dupliquée entre web et API
   - **Impact** : Risque d'incohérence entre interfaces
   - **Solution** : Unifier via CartService uniquement
   - **Priorité** : Élevée

##### Niveau MOYEN

5. **Services Partiellement Implémentés** 🟡
   - **Fichiers** : `app/Services/CategoryService.php`, `ProductService.php`
   - **Problème** : Méthodes vides ou non implémentées
   - **Impact** : Logique métier non centralisée
   - **Solution** : Implémenter ou supprimer les services vides
   - **Priorité** : Moyenne

6. **Galerie Produits en JSON** 🟡
   - **Fichier** : `app/Models/Produit.php:22-23`
   - **Problème** : Galerie stockée en JSON dans la table produits
   - **Impact** : Difficile de requêter individuellement les images, pas d'index
   - **Solution** : Créer une table produit_images séparée
   - **Priorité** : Moyenne

7. **Validation Inline au lieu de FormRequest** 🟡
   - **Observation** : Plusieurs contrôleurs utilisent $request->validate() inline
   - **Impact** : Logique de validation non réutilisable
   - **Solution** : Créer des FormRequest pour chaque action
   - **Priorité** : Moyenne

8. **Image Fallback Logic Complex** 🟡
   - **Fichier** : `app/Models/Produit.php:32-65`
   - **Problème** : getImageUrlAttribute() vérifie 5 emplacements différents
   - **Impact** : Logique difficile à maintenir, performance
   - **Solution** : Standardiser sur un seul emplacement (storage/app/public)
   - **Priorité** : Moyenne

##### Niveau FAIBLE

9. **Hardcoding de chaînes** 🟢
   - **Observation** : Chaînes "en attente", "confirmée", etc. hardcodées dans certains contrôleurs
   - **Impact** : Risque d'incohérence avec les constantes
   - **Solution** : Utiliser les constantes des modèles
   - **Priorité** : Faible

10. **Comments CSP désactivés** 🟢
    - **Fichier** : `app/Http/Middleware/SecurityHeaders.php:36-45`
    - **Problème** : Content-Security-Policy commenté
    - **Impact** : Protection XSS réduite
    - **Solution** : Activer et configurer CSP
    - **Priorité** : Faible

### 3.2 Qualité du Code

#### 3.2.1 Conventions de Nommage

- ✅ Modèles : PascalCase singulier (Produit, Commande)
- ✅ Contrôleurs : PascalCase + "Controller"
- ✅ Services : PascalCase + "Service"
- ✅ Migrations : Format date_heure_description
- ⚠️ Tables : Noms français (produits, commandes, paniers) - cohérent mais non standard Laravel

#### 3.2.2 Documentation

- ✅ PHPDoc présent sur les services et contrôleurs principaux
- ✅ Comments expliquant la logique complexe (PawaPayService)
- ⚠️ Certains modèles sans documentation
- ⚠️ FormRequests absents donc pas de documentation de validation

#### 3.2.3 Duplication de Code

- ⚠️ Logique panier dupliquée (web vs API)
- ⚠️ Validation inline répétée
- ✅ Services centralisent la logique métier
- ✅ View Composers centralisent navigation/footer

#### 3.2.4 Complexité Cyclomatique

- ✅ Méthodes généralement courtes (< 50 lignes)
- ✅ PawaPayService::initiateDeposit() bien structuré
- ⚠️ Certains contrôleurs admin pourraient être refactorisés

### 3.3 Performance

#### 3.3.1 Requêtes SQL

- ✅ Eager loading utilisé (with(['produits', 'user']))
- ✅ Pessimistic locking évite les problèmes de concurrence
- ⚠️ Pas d'index observés dans les migrations (sauf session_id, status)
- ⚠️ Potentiel problème N+1 sur les listes produits si pas de with('category')

#### 3.3.2 Cache

- ✅ Repository pattern avec cache decorator
- ✅ Configuration cache dans .env (CACHE_STORE=database)
- ⚠️ Pas d'observé d'utilisation concrète du cache dans le code
- ⚠️ Pas de cache pour les produits, catégories, configs

#### 3.3.3 Files d'Attente

- ✅ Configuration QUEUE_CONNECTION=database
- ✅ Table jobs créée
- ⚠️ Aucun job observé dans app/Jobs
- ⚠️ Emails envoyés de manière synchrone (Mail::to()->send())

#### 3.3.4 Assets

- ✅ Vite pour le build
- ✅ Tailwind 4.0 pour CSS
- ✅ Lazy loading des images potentiel (via asset())
- ⚠️ Pas d'optimisation observée (minification, compression)

### 3.4 Maintenabilité

#### 3.4.1 Points Positifs

- ✅ Architecture modulaire
- ✅ Séparation claire des responsabilités
- ✅ Services testables (dependency injection)
- ✅ Configuration externalisée (.env, config/)
- ✅ Logging structuré (ErrorLogService)

#### 3.4.2 Points d'Amélioration

- ⚠️ Tests insuffisants
- ⚠️ Documentation API partielle (Scribe)
- ⚠️ Certains services vides
- ⚠️ Validation non centralisée

---

## PHASE 4 - AUDIT DE SÉCURITÉ

### 4.1 Authentification et Autorisation

#### 4.1.1 Points Positifs ✅

1. **Laravel Sanctum** pour API tokens
2. **Spatie Laravel Permission** pour rôles/permissions
3. **Middleware custom** pour vérification des rôles (AdminMiddleware, ManagerMiddleware, CustomerMiddleware)
4. **Password hashing** avec Bcrypt (par défaut Laravel)
5. **CSRF protection** activée (except webhook PawaPay)
6. **Session-based auth** pour web

#### 4.1.2 Points d'Attention ⚠️

1. **Réinitialisation mot de passe** ❌
   - **Problème** : Fonctionnalité absente
   - **Impact** : Utilisateurs ne peuvent pas récupérer leur compte
   - **Priorité** : Élevée

2. **Vérification email** ⚠️
   - **Problème** : Vue existe mais logique non implémentée
   - **Impact** : Adresses email non vérifiées
   - **Priorité** : Moyenne

3. **Rate limiting** ⚠️
   - **Observation** : Rate limiting uniquement sur API (throttle:10,1 pour auth, throttle:30,1 pour admin)
   - **Impact** : Routes web non protégées contre brute-force
   - **Priorité** : Moyenne

4. **Password policy** ❌
   - **Problème** : Aucune politique de complexité de mot de passe observée
   - **Impact** : Mots de passe faibles possibles
   - **Priorité** : Moyenne

### 4.2 Protection CSRF

#### 4.2.1 Points Positifs ✅

1. **CSRF protection** activée par défaut Laravel
2. **Webhook PawaPay** explicitement exclu (bootstrap/app.php:31-33)
3. **@csrf** directive utilisée dans les formulaires Blade

#### 4.2.2 Points d'Attention ⚠️

1. **API stateful** ⚠️
   - **Fichier** : bootstrap/app.php:36
   - **Observation** : `$middleware->statefulApi()`
   - **Impact** : API utilise cookies au lieu de tokens pour SPA
   - **Note** : C'est intentionnel pour SPA, mais nécessite configuration CORS correcte

### 4.3 Protection XSS

#### 4.3.1 Points Positifs ✅

1. **Blade template engine** échappe automatiquement le HTML
2. **SecurityHeaders** avec X-XSS-Protection
3. **Content-Security-Policy** commentée mais présente

#### 4.3.2 Points d'Attention ⚠️

1. **CSP désactivée** ⚠️
   - **Fichier** : app/Http/Middleware/SecurityHeaders.php:36-45
   - **Problème** : Content-Security-Policy commentée
   - **Impact** : Protection XSS réduite
   - **Priorité** : Faible

### 4.4 Protection SQL Injection

#### 4.4.1 Points Positifs ✅

1. **Eloquent ORM** utilise des requêtes préparées
2. **Parameter binding** automatique
3. **Mass assignment protection** via $fillable

#### 4.4.2 Points d'Attention

Aucun problème observé. Laravel protège naturellement contre l'injection SQL.

### 4.5 Contrôle des Accès

#### 4.5.1 Points Positifs ✅

1. **Middleware admin** sur routes /admin/*
2. **Policies** définies (ProduitPolicy, CommandePolicy, etc.)
3. **Spatie Permissions** pour gestion fine des droits
4. **Authorization checks** dans les contrôleurs

#### 4.5.2 Points d'Attention ⚠️

1. **Vérification ownership** ⚠️
   - **Observation** : Certains contrôleurs ne vérifient pas que l'utilisateur accède à ses propres ressources
   - **Exemple** : ProfileController::show() utilise Auth::id() implicitement
   - **Impact** : Potentiel accès aux ressources d'autres utilisateurs si l'ID est manipulé
   - **Priorité** : Moyenne

### 4.6 Téléversement de Fichiers

#### 4.6.1 Points Positifs ✅

1. **Storage facade** pour gestion des fichiers
2. **Validation de type** via mimes/types dans les FormRequests (quand présents)
3. **Stockage dans storage/app/public** (hors web root)

#### 4.6.2 Points d'Attention ⚠️

1. **Validation des uploads** ⚠️
   - **Observation** : Pas de validation explicite observée dans les contrôleurs admin
   - **Impact** : Risque d'upload de fichiers malveillants
   - **Priorité** : Moyenne

2. **Limitation de taille** ⚠️
   - **Observation** : Pas de limite de taille configurée explicitement
   - **Impact** : Risque de DoS via uploads volumineux
   - **Priorité** : Moyenne

### 4.7 Gestion des Secrets

#### 4.7.1 Points Positifs ✅

1. **.env file** pour variables sensibles
2. **.env.example** documenté (mais incomplet pour PawaPay)
3. **config/pawapay.php** utilise env()
4. **.gitignore** ignore .env

#### 4.7.2 Points d'Attention ⚠️

1. **Variables PawaPay manquantes dans .env.example** ⚠️
   - **Problème** : PAWAPAY_BASE_URL, PAWAPAY_API_TOKEN, etc. non documentées
   - **Impact** : Difficulté de configuration pour nouveaux développeurs
   - **Priorité** : Faible

### 4.8 Headers de Sécurité

#### 4.8.1 Points Positifs ✅

1. **SecurityHeaders middleware** appliqué globalement
2. **X-Frame-Options: SAMEORIGIN** (anti-clickjacking)
3. **X-XSS-Protection: 1; mode=block**
4. **Referrer-Policy: strict-origin-when-cross-origin**
5. **Permissions-Policy** (camera=(), microphone=(), geolocation=())
6. **Strict-Transport-Security** en production

#### 4.8.2 Points d'Attention ⚠️

1. **X-Content-Type-Options commenté** ⚠️
   - **Fichier** : SecurityHeaders.php:22
   - **Problème** : X-Content-Type-Options: nosniff commenté
   - **Impact** : Risque MIME-sniffing
   - **Priorité** : Faible

### 4.9 Logging et Monitoring

#### 4.9.1 Points Positifs ✅

1. **ErrorLogService** pour logging structuré
2. **Laravel Telescope** pour debug (activé en dev)
3. **Log::info()** utilisé dans PawaPayService
4. **Exception handling** dans bootstrap/app.php

#### 4.9.2 Points d'Attention ⚠️

1. **Telescope en production** ⚠️
   - **Observation** : TELESCOPE_ENABLED=true par défaut
   - **Impact** : Exposition d'informations sensibles en production
   - **Priorité** : Élevée

### 4.10 Vulnérabilités Potentielles

| Vulnérabilité | Niveau | Preuve | Impact | Solution |
|---------------|--------|--------|--------|----------|
| SSL verification disabled | Critique | PawaPayService.php:45 | MITM en production | Activer SSL |
| Telescope en production | Élevé | .env.example:77 | Exposition données | Désactiver en prod |
| Drivers paiement simulés | Élevé | Payments/Drivers/ | Paiements non fonctionnels | Intégrer SDKs |
| Upload non validé | Moyen | Admin controllers | Upload malveillant | Ajouter validation |
| Rate limiting web absent | Moyen | routes/web.php | Brute-force | Ajouter throttle |
| Password policy absente | Moyen | - | Mots de passe faibles | Implémenter règle |
| CSP désactivée | Faible | SecurityHeaders.php:36 | XSS réduit | Activer CSP |

---

## PHASE 5 - AUDIT COMPLET DU SYSTÈME DE PAIEMENT PAWAPAY

### 5.1 Architecture du Flux PawaPay

```
Client → Frontend (Blade) → Backend (Laravel) → PawaPay API
         ↓                      ↓                    ↓
    Saisie téléphone      initiateDeposit()    POST /v1/deposits
    Choix opérateur       (PawaPayService)    
                            ↓
                      Retour depositId
                            ↓
                    Redirection attente
                            ↓
                    Polling (5s) → checkDepositStatus()
                            ↓
                      Webhook callback
                            ↓
                  handleDepositCallback()
                            ↓
                 Mise à jour commande
                            ↓
                    Email confirmation
```

### 5.2 Composants PawaPay

#### 5.2.1 PawaPayService

**Fichier** : `app/Services/PawaPayService.php` (271 lignes)

**Responsabilités** :
1. `computeAmountWithFees()` : Calcul montant + frais (2% par défaut)
2. `initiateDeposit()` : Initier dépôt via API PawaPay
3. `checkDepositStatus()` : Polling statut dépôt
4. `getActiveConfiguration()` : Récupérer configuration active
5. `getMethodFromProvider()` : Conversion code opérateur → nom court
6. `detectProviderFromPhone()` : Détection automatique opérateur par préfixe

**Configuration** :
- Base URL : `config('pawapay.base_url')` (sandbox: https://api.sandbox.pawapay.io)
- API Token : `config('pawapay.api_token')` (JWT Bearer)
- Devise : CDF (Franc Congolais)
- Frais : 2% par défaut
- Callback URL : `config('pawapay.callback_url')`

**Opérateurs supportés** :
- VODACOM_MPESA_COD : préfixes 081, 082, 083, 084, 085
- AIRTEL_COD : préfixes 097, 098, 099
- ORANGE_COD : préfixes 089, 090, 084

**Points Positifs** ✅ :
- Logging structuré (Log::info, Log::warning, Log::error)
- Gestion des exceptions avec try/catch
- Normalisation des numéros de téléphone
- UUID pour depositId
- Timeout configuré (30s pour initiate, 15s pour check)
- Gestion des réponses PawaPay (tableau JSON)

**Points d'Attention** ⚠️ :
1. **SSL verification disabled** 🔴
   - Ligne 45 : `Http::withoutVerifying()`
   - Impact : Vulnérabilité MITM en production
   - Solution : Activer SSL en production

2. **Callback URL conditionnelle** ⚠️
   - Ligne 84-86 : Vérifie si callback_url ne contient pas "VOTRE_URL_NGROK"
   - Impact : Logique fragile
   - Solution : Validation plus robuste

#### 5.2.2 PawaPayWebhookController

**Fichier** : `app/Http/Controllers/Api/PawaPayWebhookController.php` (128 lignes)

**Responsabilités** :
1. `handleDepositCallback()` : Réception webhook PawaPay
2. `handleCompleted()` : Traitement paiement réussi
3. `handleFailed()` : Traitement paiement échoué

**Route** : `/webhooks/pawapay/callback` (POST, exclu CSRF)

**Points Positifs** ✅ :
- Validation payload (depositId, status)
- Idempotence : vérifie si commande déjà payée
- Gestion des statuts intermédiaires (PROCESSING, ACCEPTED ignorés)
- Email de confirmation (non-bloquant)
- Retour 200 même si commande non trouvée (évite retry)
- Logging complet

**Points d'Attention** ⚠️ :
1. **Pas de signature verification** 🟠
   - **Problème** : Webhook non signé, pas de vérification que la requête vient de PawaPay
   - **Impact** : Risque de spoofing (faux webhooks)
   - **Solution** : Implémenter vérification signature HMAC si PawaPay supporte
   - **Priorité** : Élevée

2. **Pas de rate limiting** ⚠️
   - **Problème** : Webhook sans protection contre abus
   - **Impact** : Potentiel DoS via webhooks
   - **Solution** : Ajouter rate limiting sur la route
   - **Priorité** : Moyenne

#### 5.2.3 Contrôleur Web CommandeController

**Fichier** : `app/Http/Controllers/Web/CommandeController.php`

**Méthodes PawaPay** :
1. `initiatePawaPay()` : Initier paiement
2. `waitingPayment()` : Page attente
3. `checkPaymentStatus()` : Polling AJAX
4. `paymentSuccess()` : Page succès
5. `paymentFailed()` : Page échec

**Points Positifs** ✅ :
- UUID generation pour depositId
- Normalisation numéro téléphone
- Validation présence commande
- Gestion erreurs avec back()->withError()

#### 5.2.4 Contrôleur Admin CommandeController

**Fichier** : `app/Http/Controllers/Web/Admin/CommandeController.php`

**Méthode** : `syncPawaPay()` - Synchronisation manuelle PawaPay

**Responsabilité** : Permettre à l'admin de forcer la vérification du statut PawaPay si le webhook a échoué

**Points Positifs** ✅ :
- Fallback si webhook échoue
- Mise à jour automatique commande + email
- Gestion des erreurs

### 5.3 Base de Données PawaPay

**Table** : `commandes`

**Champs PawaPay** (ajoutés via migration 2026_06_30_000001) :
- `pawapay_deposit_id` : string(36), nullable, unique - UUID généré par Stepora
- `mobile_money_provider` : string(50), nullable - Code opérateur PawaPay
- `mobile_money_number` : string(20), nullable - Numéro international

**Champs paiement existants** (ajoutés via migration 2026_06_09_000001) :
- `payment_method` : string, nullable - mpesa, orange_money, airtel_money
- `payment_phone` : string, nullable
- `payment_reference` : string, nullable
- `payment_proof` : string, nullable - Chemin image preuve
- `payment_status` : string, default 'non_paye' - non_paye, en_verification, payee, refusee

**Constantes Commande.php** :
- `PAY_NON_PAYE` = 'non_paye'
- `PAY_EN_VERIF` = 'en_verification'
- `PAY_PAYEE` = 'payee'
- `PAY_REFUSEE` = 'refusee'
- `PAY_PAWAPAY_PENDING` = 'pawapay_pending'

### 5.4 Flux de Paiement Détaillé

#### Étape 1 : Initiation

1. Client valide panier → `POST /commande` (checkout)
2. Commande créée avec statut 'en attente', payment_status 'non_paye'
3. Redirection vers `/commande/{id}/paiement`
4. Client saisit numéro + choisit opérateur
5. `POST /commande/{id}/pawapay/initier`
6. `PawaPayService::initiateDeposit()` :
   - Génère UUID pour depositId
   - Calcule montant avec frais (2%)
   - Normalise numéro (supprime 0 initial, code pays)
   - Construit payload JSON
   - POST vers PawaPay API
7. Si ACCEPTED :
   - Met à jour commande : pawapay_deposit_id, mobile_money_provider, mobile_money_number, payment_status = 'en_verification'
   - Retourne depositId
8. Redirection vers `/commande/{id}/pawapay/attente`

#### Étape 2 : Attente Confirmation

1. Page `pawapay_attente.blade.php` affiche spinner + compte à rebours 60s
2. JavaScript poll toutes les 5s : `GET /commande/{id}/pawapay/statut`
3. `CommandeController::checkPaymentStatus()` :
   - Appelle `PawaPayService::checkDepositStatus(depositId)`
   - GET vers PawaPay API /v1/deposits/{depositId}
   - Parse réponse (tableau JSON)
   - Retourne statut (COMPLETED, FAILED, PROCESSING, etc.)
4. JavaScript redirige selon statut :
   - COMPLETED → `/commande/{id}/pawapay/succes`
   - FAILED → `/commande/{id}/pawapay/echec`
   - PROCESSING → continue polling

#### Étape 3 : Webhook (Parallèle)

1. PawaPay envoie POST vers `/webhooks/pawapay/callback`
2. `PawaPayWebhookController::handleDepositCallback()` :
   - Valide payload (depositId, status)
   - Retrouve commande par pawapay_deposit_id
   - Switch sur status :
     - COMPLETED → `handleCompleted()`
     - FAILED/CANCELLED/TIMED_OUT → `handleFailed()`
     - Autre → ignore (statut intermédiaire)
3. `handleCompleted()` :
   - Vérifie idempotence (si déjà payé, ignore)
   - Met à jour commande : payment_status = 'payee', statut = 'confirmée'
   - Envoie email PaymentConfirmationMail
4. Retourne 200 OK

#### Étape 4 : Fallback Admin

1. Si webhook échoue (client ferme page, ngrok down, etc.)
2. Admin voit commande en "en_verification"
3. Admin clique "Forcer la vérification"
4. `Admin/CommandeController::syncPawaPay()` :
   - Appelle `PawaPayService::checkDepositStatus()`
   - Si COMPLETED : met à jour commande + envoie email
   - Sinon : informe admin

### 5.5 Sécurité PawaPay

#### Points Positifs ✅

1. **Idempotence webhook** : Vérifie si commande déjà payée
2. **UUID unique** : depositId généré côté application
3. **Logging complet** : Toutes les interactions loguées
4. **Email non-bloquant** : Erreur email ne fait pas échouer webhook
5. **Transactions DB** : Mises à jour commande dans transaction
6. **Callback URL configurable** : Peut être ngrok en dev, production en prod

#### Points d'Attention ⚠️

1. **Pas de signature webhook** 🔴
   - **Problème** : Webhook non signé, pas de vérification source
   - **Impact** : Attaquant pourrait envoyer faux webhooks COMPLETED
   - **Solution** : Vérifier si PawaPay supporte HMAC signature, implémenter
   - **Priorité** : Critique

2. **SSL verification disabled** 🔴
   - **Problème** : `Http::withoutVerifying()` dans PawaPayService
   - **Impact** : MITM possible sur communication avec PawaPay
   - **Solution** : Activer SSL en production
   - **Priorité** : Critique

3. **Pas de rate limiting webhook** 🟠
   - **Problème** : Webhook sans protection
   - **Impact** : DoS via webhooks
   - **Solution** : Ajouter rate limiting
   - **Priorité** : Élevée

4. **Numéros de test magiques** ⚠️
   - **Observation** : Documentation mentionne numéros magiques sandbox (243893456789, etc.)
   - **Impact** : Si utilisés en production, contournement sécurité
   - **Solution** : S'assurer que numéros magiques désactivés en production
   - **Priorité** : Moyenne

### 5.6 Compatibilité Migration Node.js

#### Éléments à conserver impérativement

1. **Table commandes avec champs PawaPay** : pawapay_deposit_id, mobile_money_provider, mobile_money_number
2. **Constantes de statut** : PAY_NON_PAYE, PAY_EN_VERIF, PAY_PAYEE, PAY_REFUSEE
3. **Logique de frais** : computeAmountWithFees() (2% par défaut)
4. **Normalisation numéros** : detectProviderFromPhone(), normalisation
5. **Idempotence webhook** : Vérification commande déjà payée
6. **Polling mechanism** : checkDepositStatus() toutes les 5s
7. **Email confirmation** : PaymentConfirmationMail
8. **Logging structuré** : Log des interactions PawaPay

#### Éléments à adapter

1. **HTTP client** : Remplacer Laravel Http par Axios/Fetch
2. **UUID generation** : Remplacer Str::uuid() par uuid library Node.js
3. **Logging** : Remplacer Log facade par Winston/Pino
4. **Email** : Remplacer Laravel Mail par Nodemailer/SendGrid
5. **Webhook signature** : Ajouter vérification HMAC si disponible
6. **SSL verification** : Activer par défaut en Node.js

### 5.7 Tests Recommandés

1. **Test initiation dépôt** : Mock API PawaPay, vérifier payload
2. **Test polling statut** : Vérifier polling 5s, timeout, gestion erreurs
3. **Test webhook COMPLETED** : Vérifier mise à jour commande, email
4. **Test webhook FAILED** : Vérifier statut refusee
5. **Test idempotence webhook** : Envoyer 2x même webhook, vérifier idempotence
6. **Test fallback admin** : Vérifier syncPawaPay manuel
7. **Test normalisation numéro** : Vérifier formats 081, +24381, 24381
8. **Test détection opérateur** : Vérifier préfixes 081, 097, 089
9. **Test calcul frais** : Vérifier 2% arrondi
10. **Test signature webhook** : Si implémenté, vérifier rejet faux webhooks

---

## PHASE 6 - AUDIT DE LA BASE DE DONNÉES EXISTANT

### 6.1 Système de Base de Données Actuel

**SGBD** : SQLite (par défaut dans .env.example)  
**Note** : SQLite est utilisé pour le développement, mais MySQL 8.0+ est recommandé pour la production (documenté dans COMPREHENSIVE_README.md)

### 6.2 Tables Principales

#### 6.2.1 users

**Migration** : `0001_01_01_000000_create_users_table.php` + extensions

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| name | string | - | Nom complet |
| nom | string | - | Nom (français) |
| email | string | unique | Email |
| password | string | - | Hash Bcrypt |
| google_id | string | nullable, index | OAuth Google ID |
| avatar | string | nullable | Avatar |
| email_verified_at | timestamp | nullable | Vérification email |
| remember_token | string | nullable | Remember me |
| deleted_at | timestamp | nullable (soft delete) | Soft delete |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Index** : 
- unique sur email
- index sur google_id
- index sur deleted_at (soft delete)

**Relations** :
- hasMany(Commande)
- hasOne(Client)

#### 6.2.2 clients

**Migration** : `2026_04_08_165654_create_clients_table.php` + extension

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| user_id | bigint | FK, unique, cascade | User |
| telephone | string | - | Téléphone |
| adresse | string | - | Adresse |
| ville | string | - | Ville |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Index** :
- foreign_key sur user_id (cascade on delete)
- unique sur user_id

**Relations** :
- belongsTo(User)

#### 6.2.3 categories

**Migration** : `2026_05_02_120255_create_categories_table.php` + extensions

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| parent_id | bigint | nullable, FK self | Catégorie parente |
| nom | string | - | Nom |
| slug | string | unique | Slug URL |
| image | string | nullable | Image |
| display_order | int | - | Ordre affichage |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Index** :
- foreign_key sur parent_id (self-reference)
- unique sur slug

**Relations** :
- hasMany(Produit)
- belongsTo(Category, parent_id)
- hasMany(Category, children)

#### 6.2.4 produits

**Migration** : `2026_04_08_165655_create_produits_table.php` + extension

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| nom | string | - | Nom |
| description | text | nullable | Description |
| prix | integer | - | Prix (en centimes ?) |
| stock | integer | default 0 | Stock |
| image | string | nullable | Image principale |
| galerie | json | nullable | Galerie images |
| category_id | bigint | FK, cascade | Catégorie |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Index** :
- foreign_key sur category_id (cascade on delete)

**Relations** :
- belongsTo(Category)
- belongsToMany(Commande)

**Note** : prix est integer, pas decimal. Cela suggère un stockage en centimes (ex: 10000 = 100.00 CDF).

#### 6.2.5 paniers

**Migration** : `2024_01_01_000000_create_paniers_table.php` + upgrade

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| user_id | bigint | nullable, FK, cascade | User |
| session_id | string | nullable, index | Session ID |
| total | decimal(10,2) | default 0 | Total |
| status | enum | default 'active', index | active, abandoned, converted |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Index** :
- foreign_key sur user_id (cascade on delete)
- index sur session_id
- index sur status
- index composite [user_id, status]
- index composite [session_id, status]

**Relations** :
- hasMany(PanierItem)
- belongsTo(User)

#### 6.2.6 panier_items

**Migration** : `2024_01_02_000000_create_panier_items_table.php`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| panier_id | bigint | FK | Panier |
| produit_id | bigint | FK | Produit |
| quantite | integer | - | Quantité |
| prix_unitaire | decimal | - | Prix unitaire |
| taille | string | nullable | Taille |
| couleur | string | nullable | Couleur |
| notes | text | nullable | Notes |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Index** :
- foreign_key sur panier_id
- foreign_key sur produit_id

**Relations** :
- belongsTo(Panier)
- belongsTo(Produit)

#### 6.2.7 commandes

**Migration** : `2026_04_08_165656_create_commandes_table.php` + extensions

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| user_id | bigint | FK, cascade | User |
| total | integer | - | Total |
| statut | string | default 'en_attente' | Statut commande |
| adresse | string | - | Adresse livraison |
| payment_method | string | nullable | Méthode paiement |
| payment_phone | string | nullable | Téléphone paiement |
| payment_reference | string | nullable | Référence paiement |
| payment_proof | string | nullable | Preuve paiement |
| payment_status | string | default 'non_paye' | Statut paiement |
| pawapay_deposit_id | string(36) | nullable, unique | PawaPay UUID |
| mobile_money_provider | string(50) | nullable | Opérateur PawaPay |
| mobile_money_number | string(20) | nullable | Numéro PawaPay |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Index** :
- foreign_key sur user_id (cascade on delete)
- unique sur pawapay_deposit_id

**Relations** :
- belongsTo(User)
- belongsToMany(Produit, via commande_produit)

**Note** : total est integer, cohérent avec produits.prix.

#### 6.2.8 commande_produit (pivot)

**Migration** : `2026_04_10_103122_create_commande_produits_table.php`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| commande_id | bigint | FK, cascade | Commande |
| produit_id | bigint | FK, cascade | Produit |
| quantite | integer | - | Quantité |
| prix_unitaire | integer | - | Prix unitaire |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Index** :
- foreign_key sur commande_id (cascade on delete)
- foreign_key sur produit_id (cascade on delete)

**Relations** :
- belongsTo(Commande)
- belongsTo(Produit)

#### 6.2.9 messages

**Migration** : `2026_04_08_165656_create_messages_table.php` + extensions

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| is_admin | boolean | - | Message admin ? |
| nom | string | - | Nom |
| email | string | - | Email |
| message | text | - | Message |
| status | string | - | Statut |
| reply | text | nullable | Réponse admin |
| client_read | boolean | - | Lu par client ? |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Relations** : Aucune

#### 6.2.10 error_logs

**Migration** : `2026_05_31_114908_create_error_logs_table.php`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| message | text | - | Message erreur |
| stack_trace | text | - | Stack trace |
| url | string | - | URL |
| method | string | - | Méthode HTTP |
| ip_address | string | - | IP |
| status | enum | - | en_attente, resolu |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Relations** : Aucune

#### 6.2.11 site_configs

**Migration** : `2026_05_04_235954_create_site_configs_table.php`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| id | bigint | PK, auto_increment | Identifiant |
| key | string | - | Clé |
| value | text | - | Valeur |
| created_at | timestamp | - | Création |
| updated_at | timestamp | - | Modification |

**Relations** : Aucune

### 6.3 Tables Laravel Default

| Table | Description |
|-------|-------------|
| cache | Cache Laravel |
| jobs | Queue jobs |
| permission_* | Tables Spatie Permissions |
| personal_access_tokens | Tokens Sanctum |
| notifications | Notifications Laravel |
| telescope_entries | Entrées Telescope |

### 6.4 Diagramme Entité-Relation

```
User (1) ──→ (M) Commande
     └──→ (1) Client
     └──→ (M) Message (via email)
     └──→ (M) Panier

Category (1) ──→ (M) Produit
     └──→ (M) Category (self, parent/children)

Produit (M) ──→ (1) Category
       └──→ (M) Commande (via commande_produit)

Panier (1) ──→ (M) PanierItem
     └──→ (1) User

PanierItem (M) ──→ (1) Panier
           └──→ (1) Produit

Commande (1) ──→ (M) CommandeProduit
       └──→ (1) User
       └──→ (M) Produit (via commande_produit)

CommandeProduit (M) ──→ (1) Commande
              └──→ (1) Produit
```

### 6.5 Données Sensibles

| Table | Colonne | Sensibilité | Protection |
|-------|---------|-------------|------------|
| users | password | Critique | Hash Bcrypt |
| users | email | Élevée | - |
| users | google_id | Moyenne | - |
| clients | telephone | Moyenne | - |
| clients | adresse | Moyenne | - |
| commandes | adresse | Moyenne | - |
| commandes | payment_phone | Moyenne | - |
| commandes | payment_reference | Élevée | - |
| commandes | pawapay_deposit_id | Élevée | - |
| commandes | mobile_money_number | Moyenne | - |
| error_logs | stack_trace | Moyenne | - |
| error_logs | ip_address | Faible | - |

### 6.6 Migration vers PostgreSQL

#### 6.6.1 Compatibilité des Types

| Type SQLite/MySQL | Type PostgreSQL | Notes |
|-------------------|-----------------|-------|
| bigint | bigint | Compatible |
| integer | integer | Compatible |
| string | varchar | Définir longueur |
| text | text | Compatible |
| decimal(10,2) | numeric(10,2) | Compatible |
| timestamp | timestamp | Compatible |
| boolean | boolean | Compatible |
| json | jsonb | jsonb plus performant |
| enum | varchar + CHECK | PostgreSQL n'a pas de enum natif |

#### 6.6.2 Incompatibilités Potentielles

1. **Enum vers VARCHAR + CHECK**
   - SQLite/MySQL : `enum('active', 'abandoned', 'converted')`
   - PostgreSQL : `varchar(20) CHECK (status IN ('active', 'abandoned', 'converted'))`

2. **Auto increment**
   - SQLite/MySQL : `auto_increment`
   - PostgreSQL : `SERIAL` ou `BIGSERIAL`

3. **Foreign key cascade syntax**
   - Syntaxe légèrement différente mais compatible

4. **Index**
   - Syntaxe compatible, mais performance différente

5. **JSON**
   - SQLite : JSON (support limité)
   - PostgreSQL : jsonb (très performant)

#### 6.6.3 Transformations Nécessaires

1. **Enum → VARCHAR + CHECK**
   - `paniers.status` : enum → varchar(20) + CHECK
   - `error_logs.status` : enum → varchar(20) + CHECK

2. **Auto increment → SERIAL**
   - Toutes les colonnes id : auto_increment → SERIAL ou BIGSERIAL

3. **Foreign keys**
   - Vérifier syntaxe ON DELETE CASCADE compatible

4. **JSON → JSONB**
   - `produits.galerie` : json → jsonb (avantage : indexing possible)

#### 6.6.4 Index Recommandés PostgreSQL

| Table | Index | Raison |
|-------|-------|--------|
| users | email (unique) | Déjà présent |
| users | google_id | Déjà présent |
| categories | slug (unique) | Déjà présent |
| categories | parent_id | Pour navigation hiérarchique |
| produits | category_id | Déjà présent (FK) |
| produits | prix | Pour filtres prix |
| produits | stock | Pour filtres stock |
| produits | nom (gin with trigram) | Pour recherche textuelle |
| paniers | session_id | Déjà présent |
| paniers | status | Déjà présent |
| paniers | (user_id, status) | Déjà présent |
| paniers | (session_id, status) | Déjà présent |
| commandes | user_id | Déjà présent (FK) |
| commandes | statut | Pour filtres admin |
| commandes | payment_status | Pour filtres admin |
| commandes | created_at | Pour tri récent |
| commandes | pawapay_deposit_id (unique) | Déjà présent |
| commande_produit | commande_id | Déjà présent (FK) |
| commande_produit | produit_id | Déjà présent (FK) |
| messages | email | Pour group by |
| messages | status | Pour filtres admin |

#### 6.6.5 Différences de Comportement SQL

1. **Case sensitivity**
   - PostgreSQL : case-sensitive par défaut
   - SQLite/MySQL : case-insensitive pour comparaisons
   - **Impact** : Recherche email/password doit utiliser LOWER() ou citext

2. **NULL handling**
   - PostgreSQL : strictement conforme SQL standard
   - MySQL : quelques différences (ex: COUNT(*) vs COUNT(colonne))
   - **Impact** : Vérifier les requêtes aggregations

3. **String concatenation**
   - SQLite/MySQL : `CONCAT(a, b)` ou `a || b`
   - PostgreSQL : `a || b`
   - **Impact** : Remplacer CONCAT par ||

4. **Date functions**
   - SQLite/MySQL : fonctions différentes
   - PostgreSQL : fonctions standards
   - **Impact** : Adapter les requêtes dates (NOW(), DATE_ADD, etc.)

5. **Auto increment reset**
   - PostgreSQL : sequences indépendantes
   - MySQL : auto_increment global par table
   - **Impact** : Si on réinitialise la DB, les sequences PostgreSQL doivent être reset

#### 6.6.6 Données Historiques

**Tables à préserver intégralement** :
- users (avec soft deletes)
- clients
- categories
- produits
- commandes (TOUTES les commandes, même annulées)
- commande_produit
- messages
- error_logs (optionnel, mais utile pour audit)
- site_configs

**Données critiques** :
- users + passwords (hash) - authentification
- commandes + paiement - historique transactions
- produits + stock - inventaire
- categories - structure catalogue

**Risques de perte** :
- Si réinitialisation sequences PostgreSQL : IDs pourraient changer
- Si enum → varchar : données doivent être valides

#### 6.6.7 Procédure de Migration Données

1. **Dump SQLite**
   ```bash
   sqlite3 database/database.sqlite .dump > dump.sql
   ```

2. **Convertir schéma SQLite → PostgreSQL**
   - Remplacer auto_increment par SERIAL/BIGSERIAL
   - Remplacer enum par varchar + CHECK
   - Adapter types si nécessaire

3. **Créer schéma PostgreSQL**
   ```bash
   psql -U user -d stepora < schema_postgresql.sql
   ```

4. **Importer données**
   - Utiliser pg_loader ou script PHP de migration
   - Transformer les enums si nécessaire
   - Valider les contraintes

5. **Vérifier l'intégrité**
   - Compter les enregistrements avant/après
   - Vérifier les foreign keys
   - Tester l'application

6. **Plan de retour arrière**
   - Garder le dump SQLite
   - Tester le rollback sur environnement de staging

### 6.7 Recommandations Base de Données

1. **Migrer vers PostgreSQL** ✅
   - PostgreSQL plus robuste pour production
   - Meilleures performances sur JSON (jsonb)
   - Meilleur support full-text search

2. **Normaliser la galerie produits** ⚠️
   - Créer table produit_images
   - Permet indexing, requêtes individuelles
   - Priorité : Moyenne

3. **Ajouter index manquants** ⚠️
   - produits.prix, produits.stock
   - commandes.statut, commandes.payment_status
   - commandes.created_at
   - Priorité : Moyenne

4. **Implémenter full-text search** ⚠️
   - Utiliser PostgreSQL tsvector
   - Index gin sur produits.nom + description
   - Priorité : Faible

5. **Partitionnement commandes** 🟢
   - Partitionner par année/mois si volume élevé
   - Priorité : Faible (seulement si nécessaire)

---

## PHASE 7 - COMPARAISON DES STRATÉGIES DE MIGRATION

### 7.1 Stratégie A : Conserver Laravel et Améliorer

#### Description

Moderniser l'architecture Laravel existante sans changer de technologie.

#### Avantages

1. **Coût minimal** : Pas de réécriture complète
2. **Risques faibles** : Application fonctionne déjà
3. **Continuité** : Équipe connaît Laravel
4. **Temps rapide** : 2-3 mois d'améliorations
5. **Tests progressifs** : Peut améliorer module par module
6. **Données préservées** : Pas de migration complexe

#### Inconvénients

1. **Dépendance PHP** : Marché PHP moins dynamique que Node.js
2. **Performance** : Laravel peut être plus lent que Node.js pour certaines opérations
3. **Écosystème frontend** : Blade moins moderne que React
4. **Scalabilité** : PHP moins adapté au temps réel (WebSockets)

#### Coût Estimé

- **Temps** : 2-3 mois
- **Complexité** : Faible
- **Risques** : Faibles
- **Coût humain** : 1 développeur senior Laravel

#### Améliorations Recommandées

1. **Tests** : Écrire tests unitaires et fonctionnels (Prio: Élevée)
2. **Sécurité** : Activer SSL, corriger Telescope en prod (Prio: Critique)
3. **Drivers paiement** : Intégrer Stripe/PayPal SDKs (Prio: Élevée)
4. **Base de données** : Migrer vers PostgreSQL (Prio: Moyenne)
5. **Validation** : Créer FormRequests (Prio: Moyenne)
6. **Documentation** : Compléter API docs (Prio: Faible)
7. **Performance** : Ajouter cache, index (Prio: Faible)

#### Critères de Succès

- Couverture tests > 80%
- Zéro vulnérabilité critique
- PostgreSQL en production
- Drivers paiement fonctionnels
- Documentation API complète

---

### 7.2 Stratégie B : Migration Progressive vers Node.js

#### Description

Migrer progressivement certaines fonctionnalités vers Node.js tout en conservant Laravel temporairement.

#### Approche Possible

1. **Phase 1** : Migrer l'API REST vers NestJS
   - Garder Laravel pour l'interface web admin
   - NestJS pour API mobile/SPA
   - Partager la base de données PostgreSQL

2. **Phase 2** : Migrer le frontend vers React
   - Interface consommateur en React
   - Garder admin Laravel temporairement

3. **Phase 3** : Migrer l'admin vers NestJS + React
   - Admin dashboard en React
   - Supprimer Laravel

#### Avantages

1. **Risques maîtrisés** : Migration par étapes
2. **Rollback possible** : Chaque phase peut être annulée
3. **Apprentissage progressif** : Équipe apprend Node.js progressivement
4. **Continuité service** : Application reste disponible pendant migration

#### Inconvénients

1. **Complexité élevée** : Deux stacks en parallèle
2. **Double maintenance** : Laravel + Node.js pendant transition
3. **Synchronisation données** : Risque d'incohérence entre systèmes
4. **Temps long** : 6-12 mois
5. **Coût élevé** : 2-3 développeurs (Laravel + Node.js)

#### Coût Estimé

- **Temps** : 6-12 mois
- **Complexité** : Élevée
- **Risques** : Moyens
- **Coût humain** : 2 développeurs (1 Laravel + 1 Node.js)

#### Défis Techniques

1. **Authentification partagée** : Tokens Sanctum vs JWT
2. **Session management** : Laravel sessions vs Node.js sessions
3. **File d'attente** : Laravel queues vs BullMQ
4. **Cache** : Laravel cache vs Redis
5. **Webhooks** : PawaPay webhook vers NestJS

#### Critères de Succès

- API NestJS 100% fonctionnelle
- Frontend React 100% fonctionnel
- Tests E2E passent
- Performance équivalente ou supérieure
- Zéro downtime pendant migration

---

### 7.3 Stratégie C : Reconstruction Complète Node.js/TypeScript

#### Description

Reconstruire l'application entière sur une nouvelle architecture Node.js/TypeScript.

#### Architecture Cible

- **Backend** : NestJS + TypeScript
- **Frontend** : React + TypeScript
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Authentification** : JWT ou sessions
- **File d'attente** : BullMQ + Redis
- **Cache** : Redis
- **API Documentation** : OpenAPI/Swagger

#### Avantages

1. **Stack moderne** : TypeScript, React, NestJS
2. **Performance** : Node.js non-blocking I/O
3. **Écosystème frontend** : React très populaires
4. **Temps réel** : WebSockets natifs
5. **Single language** : JavaScript/TypeScript fullstack
6. **Type safety** : TypeScript strict

#### Inconvénients

1. **Coût très élevé** : Réécriture complète
2. **Risques très élevés** : Perdre des fonctionnalités
3. **Temps très long** : 12-18 mois
4. **Perte d'expertise** : Équipe doit apprendre NestJS
5. **Migration données complexe** : SQLite → PostgreSQL + Laravel → Node.js
6. **Risque bugs** : Nouvelle implémentation = nouveaux bugs

#### Coût Estimé

- **Temps** : 12-18 mois
- **Complexité** : Très élevée
- **Risques** : Très élevés
- **Coût humain** : 2-3 développeurs Node.js senior

#### Fonctionnalités à Reconstruire

1. **Authentification** : Inscription, connexion, OAuth Google, rôles/permissions
2. **Catalogue** : Produits, catégories, recherche, filtres
3. **Panier** : DB + Session, sync, validation stock
4. **Commandes** : Pessimistic locking, transitions statut, annulation
5. **Paiement PawaPay** : Intégration complète, polling, webhook
6. **Messagerie** : Contact, thread, email
7. **Admin** : Dashboard, CRUD, stats
8. **Email** : Templates, queue
9. **Logging** : Structuré
10. **API** : RESTful, versionnée, documentation

#### Risques Spécifiques

1. **Paiement PawaPay** : Erreur d'implémentation = perte d'argent
2. **Stock management** : Bug pessimistic locking = overselling
3. **Data loss** : Migration SQLite → PostgreSQL = perte données
4. **Authentification** : Bug JWT = intrusion
5. **Performance** : Node.js plus lent si mal implémenté

#### Critères de Succès

- Toutes les fonctionnalités Laravel reconstruites
- Tests E2E 100% passent
- Performance équivalente ou supérieure
- Migration données sans perte
- Zéro bug critique en production

---

### 7.4 Comparaison Synthétique

| Critère | Stratégie A (Laravel) | Stratégie B (Progressive) | Stratégie C (Node.js) |
|---------|----------------------|--------------------------|----------------------|
| **Coût temps** | 2-3 mois | 6-12 mois | 12-18 mois |
| **Coût humain** | 1 dev Laravel | 2 devs (Laravel + Node) | 2-3 devs Node.js |
| **Complexité** | Faible | Élevée | Très élevée |
| **Risques** | Faibles | Moyens | Très élevés |
| **Risques paiement** | Faibles | Moyens | Élevés |
| **Risques données** | Faibles | Moyens | Élevés |
| **Downtime** | Minimal | Minimal | Élevé |
| **Maintenance** | Laravel uniquement | Double stack temporaire | Node.js uniquement |
| **Performance** | Bonne | Variable | Bonne (si bien fait) |
| **Scalabilité** | Moyenne | Bonne | Excellente |
| **Écosystème** | PHP mature | Mixte | JavaScript/TypeScript |
| **Apprentissage** | Aucun | Progressif | Complet |
| **Valeur ajoutée** | Amélioration | Modernisation | Réécriture |
| **ROI** | Élevé | Moyen | Faible |

---

### 7.5 Décision retenue pour TheBox

La décision de projet est de construire TheBox avec Node.js/NestJS, React/TypeScript et PostgreSQL. La stratégie A (conserver Laravel) reste une option qui aurait pu convenir à une simple modernisation de Stepora, mais elle ne correspond pas à l'objectif actuel de créer une nouvelle application sur une stack différente.

La stratégie B (migration progressive en production) n'est pas la voie principale retenue : elle implique de maintenir deux stacks simultanément et de gérer leur coexistence. TheBox sera développé comme une application distincte, tandis que Stepora restera disponible comme référence et ne sera remplacé qu'après validation de la nouvelle application.

Les durées indicatives de 2-3, 6-12 ou 12-18 mois citées dans la comparaison initiale ne sont pas des estimations vérifiées. Elles ne doivent pas servir de promesse de planning. Le calendrier doit être recalculé à partir du périmètre réellement confirmé, du temps disponible et de la progression des phases.

**Décision pratique** : privilégier une reconstruction progressive par fonctionnalités, avec tests et critères de sortie explicites, plutôt qu'une réécriture massive livrée en une seule fois.

---

## PHASE 8 - CONCEPTION DE L'ARCHITECTURE CIBLE

*Cette architecture est la cible retenue pour TheBox. Elle décrit un monolithe modulaire initial, et non une obligation de déployer des microservices.*

### 8.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   React SPA  │  │  Admin Panel │  │  Mobile App  │      │
│  │   (Vite)     │  │   (React)    │  │  (React Native)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/HTTPS
                            │ JWT / Cookies
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (NestJS)                      │
│              - Rate Limiting                                  │
│              - Authentication (JWT)                           │
│              - Logging                                        │
│              - CORS                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Public API     │ │  Customer API   │ │  Admin API      │
│  (Products,     │ │  (Cart, Orders, │ │  (Products,     │
│   Categories)   │ │   Profile)      │ │   Orders,       │
│                 │ │                 │ │   Users)        │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Cart Service  │  │Order Service │  │Payment Service│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Product Service│ │User Service  │  │PawaPay Service│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │Prisma Client  │  │Repository    │  │DTOs           │     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                        │
│  - users, clients, products, categories                     │
│  - carts, cart_items, orders, order_items                   │
│  - messages, error_logs, site_configs                        │
└─────────────────────────────────────────────────────────────┘
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
          ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│     Redis       │ │    BullMQ       │ │    S3/MinIO     │
│  - Cache        │ │  - Email jobs  │ │  - Images       │
│  - Sessions     │ │  - Notifications│ │  - Documents    │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

### 8.2 Stack Technique

#### Backend

- **Runtime** : Node.js 20+ LTS
- **Langage** : TypeScript 5+
- **Framework** : NestJS 10+
- **ORM** : Prisma 5+
- **Validation** : class-validator + class-transformer
- **Documentation** : OpenAPI/Swagger (NestJS builtin)
- **Logging** : Winston ou Pino
- **Tests** : Jest + Supertest

#### Frontend

- **Framework** : React 18+ ou Vue 3+
- **Langage** : TypeScript 5+
- **Build** : Vite 5+
- **State Management** : Zustand (React) ou Pinia (Vue)
- **Forms** : React Hook Form (React) ou VeeValidate (Vue)
- **HTTP Client** : Axios
- **Routing** : React Router (React) ou Vue Router (Vue)
- **UI Components** : Tailwind CSS + shadcn/ui (React) ou Element Plus (Vue)

#### Base de Données

- **SGBD** : PostgreSQL 15+
- **ORM** : Prisma
- **Migrations** : Prisma Migrate
- **Seeding** : Prisma Seed

#### Infrastructure

- **Cache** : Redis 7+
- **Queue** : BullMQ + Redis
- **Storage** : AWS S3 ou MinIO (self-hosted)
- **Reverse Proxy** : Nginx
- **Process Manager** : PM2
- **Containerization** : Docker

### 8.3 Modules NestJS

#### Structure des Modules

```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── decorators/
│   ├── dto/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middlewares/
│   └── pipes/
├── config/
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── pawapay.config.ts
│   └── app.config.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   └── dto/
│       ├── register.dto.ts
│       ├── login.dto.ts
│       └── refresh-token.dto.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.repository.ts
│   ├── entities/
│   │   └── user.entity.ts
│   └── dto/
│       ├── create-user.dto.ts
│       ├── update-user.dto.ts
│       └── user-response.dto.ts
├── products/
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.repository.ts
│   ├── entities/
│   │   └── product.entity.ts
│   └── dto/
│       ├── create-product.dto.ts
│       ├── update-product.dto.ts
│       └── product-response.dto.ts
├── categories/
│   ├── categories.module.ts
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   ├── categories.repository.ts
│   ├── entities/
│   │   └── category.entity.ts
│   └── dto/
│       ├── create-category.dto.ts
│       ├── update-category.dto.ts
│       └── category-response.dto.ts
├── cart/
│   ├── cart.module.ts
│   ├── cart.controller.ts
│   ├── cart.service.ts
│   ├── cart.repository.ts
│   ├── entities/
│   │   ├── cart.entity.ts
│   │   └── cart-item.entity.ts
│   └── dto/
│       ├── add-item.dto.ts
│       ├── update-item.dto.ts
│       └── cart-response.dto.ts
├── orders/
│   ├── orders.module.ts
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── orders.repository.ts
│   ├── entities/
│   │   ├── order.entity.ts
│   │   └── order-item.entity.ts
│   └── dto/
│       ├── create-order.dto.ts
│       ├── update-order-status.dto.ts
│       └── order-response.dto.ts
├── payments/
│   ├── payments.module.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   ├── pawapay/
│   │   ├── pawapay.service.ts
│   │   ├── pawapay.controller.ts
│   │   └── dto/
│   │       ├── initiate-deposit.dto.ts
│   │       └── deposit-status.dto.ts
│   └── drivers/
│       ├── payment-driver.interface.ts
│       ├── stripe.driver.ts
│       ├── paypal.driver.ts
│       └── orange-money.driver.ts
├── messages/
│   ├── messages.module.ts
│   ├── messages.controller.ts
│   ├── messages.service.ts
│   ├── messages.repository.ts
│   ├── entities/
│   │   └── message.entity.ts
│   └── dto/
│       ├── create-message.dto.ts
│       └── message-response.dto.ts
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   ├── stats/
│   │   ├── stats.controller.ts
│   │   └── stats.service.ts
│   └── config/
│       ├── config.controller.ts
│       └── config.service.ts
└── notifications/
    ├── notifications.module.ts
    ├── notifications.service.ts
    └── templates/
        ├── payment-confirmation.ts
        └── order-status.ts
```

### 8.4 React vs Vue

#### Critères de Comparaison

| Critère | React | Vue | Recommandation |
|---------|-------|-----|----------------|
| **Courbe d'apprentissage** | Moyenne | Faible | Vue |
| **Écosystème** | Très large | Large | React |
| **Performance** | Excellente | Excellente | Égal |
| **Documentation** | Excellente | Excellente | Égal |
| **Components UI** | Très nombreux (shadcn/ui, MUI, etc.) | Nombreux (Element Plus, Vuetify) | React |
| **TypeScript** | Excellent support | Excellent support | Égal |
| **Tailwind CSS** | Excellent | Excellent | Égal |
| **Populaire RDC** | Variable | Variable | À vérifier |
| **Équipe existante** | ? | ? | Dépend équipe |

#### Recommandation : React

**Justification** :
1. Écosystème plus large (shadcn/ui très moderne)
2. Plus de ressources communautaires
3. Next.js possible pour SSR si besoin futur
4. React Native pour mobile si besoin futur

**Si équipe préfère Vue** : Vue 3 + TypeScript + Element Plus est aussi excellent.

### 8.5 Base de Données PostgreSQL

#### Schéma Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum CartStatus {
  ACTIVE
  ABANDONED
  CONVERTED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  UNPAID
  VERIFYING
  PAID
  REFUSED
}

enum UserRole {
  ADMIN
  MANAGER
  CUSTOMER
}

model User {
  id                BigInt    @id @default(autoincrement())
  name              String
  nom               String?
  email             String    @unique
  password          String
  googleId          String?   @map("google_id")
  avatar            String?
  emailVerifiedAt   DateTime? @map("email_verified_at")
  rememberToken     String?   @map("remember_token")
  deletedAt         DateTime? @map("deleted_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  client            Client?
  orders            Order[]
  carts             Cart[]

  @@map("users")
}

model Client {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt   @unique @map("user_id")
  telephone String
  adresse   String
  ville     String
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("clients")
}

model Category {
  id           BigInt     @id @default(autoincrement())
  parentId     BigInt?    @map("parent_id")
  nom          String
  slug         String     @unique
  image        String?
  displayOrder Int        @map("display_order")
  createdAt    DateTime   @default(now()) @map("created_at")
  updatedAt    DateTime   @updatedAt @map("updated_at")

  parent       Category?  @relation("CategoryToCategory", fields: [parentId], references: [id])
  children     Category[] @relation("CategoryToCategory")
  products     Product[]

  @@map("categories")
}

model Product {
  id         BigInt      @id @default(autoincrement())
  nom        String
  description String?
  prix       Int
  stock      Int         @default(0)
  image      String?
  galerie     Json?
  categoryId BigInt      @map("category_id")
  createdAt  DateTime    @default(now()) @map("created_at")
  updatedAt  DateTime    @updatedAt @map("updated_at")

  category   Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  orders     OrderItem[]

  @@map("produits")
}

model Cart {
  id        BigInt      @id @default(autoincrement())
  userId    BigInt?     @map("user_id")
  sessionId String?     @map("session_id")
  total     Decimal     @default(0) @db.Decimal(10, 2)
  status    CartStatus  @default(ACTIVE)
  createdAt DateTime    @default(now()) @map("created_at")
  updatedAt DateTime    @updatedAt @map("updated_at")

  user      User?       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]

  @@index([userId, status])
  @@index([sessionId, status])
  @@map("paniers")
}

model CartItem {
  id           BigInt    @id @default(autoincrement())
  cartId       BigInt    @map("cart_id")
  productId    BigInt    @map("produit_id")
  quantite     Int
  prixUnitaire Decimal   @map("prix_unitaire") @db.Decimal(10, 2)
  taille       String?
  couleur      String?
  notes        String?
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  cart         Cart      @relation(fields: [cartId], references: [id], onDelete: Cascade)
  product      Product   @relation(fields: [productId], references: [id])

  @@map("panier_items")
}

model Order {
  id                    BigInt        @id @default(autoincrement())
  userId                BigInt        @map("user_id")
  total                 Int
  status               OrderStatus   @default(PENDING) @map("statut")
  adresse              String
  paymentMethod        String?       @map("payment_method")
  paymentPhone         String?       @map("payment_phone")
  paymentReference     String?       @map("payment_reference")
  paymentProof         String?       @map("payment_proof")
  paymentStatus        PaymentStatus @default(UNPAID) @map("payment_status")
  pawapayDepositId     String?       @unique @map("pawapay_deposit_id")
  mobileMoneyProvider  String?       @map("mobile_money_provider")
  mobileMoneyNumber    String?       @map("mobile_money_number")
  createdAt            DateTime      @default(now()) @map("created_at")
  updatedAt            DateTime      @updatedAt @map("updated_at")

  user                 User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  items                OrderItem[]

  @@index([status])
  @@index([paymentStatus])
  @@index([createdAt])
  @@map("commandes")
}

model OrderItem {
  id           BigInt   @id @default(autoincrement())
  orderId      BigInt   @map("commande_id")
  productId    BigInt   @map("produit_id")
  quantite     Int
  prixUnitaire Int      @map("prix_unitaire")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product      Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@map("commande_produit")
}

model Message {
  id         BigInt   @id @default(autoincrement())
  isAdmin    Boolean  @default(false) @map("is_admin")
  nom        String
  email      String
  message    String
  status     String?
  reply      String?  @db.Text
  clientRead Boolean  @default(false) @map("client_read")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("messages")
}

model ErrorLog {
  id         BigInt   @id @default(autoincrement())
  message    String   @db.Text
  stackTrace String   @map("stack_trace") @db.Text
  url        String
  method     String
  ipAddress  String   @map("ip_address")
  status     String
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  @@map("error_logs")
}

model SiteConfig {
  id        BigInt   @id @default(autoincrement())
  key       String   @unique
  value     String   @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("site_configs")
}
```

### 8.6 Cache (Redis)

#### Stratégie de Cache

| Données | Durée | Invalidation |
|---------|-------|--------------|
| Produits | 1 heure | Sur modification produit |
| Catégories | 24 heures | Sur modification catégorie |
| Configs site | 24 heures | Sur modification config |
| Panier (session) | 7 jours | Sur conversion en commande |
| Rate limiting | 1 minute | Expiration TTL |
| Recherche populaire | 1 heure | Toutes les heures |

#### Implémentation NestJS

```typescript
// cache/cache.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        ttl: 3600, // 1 heure par défaut
      }),
    }),
  ],
  exports: [CacheModule],
})
export class CacheModule {}
```

### 8.7 File d'Attente (BullMQ)

#### Tâches Asynchrones

| Tâche | Déclencheur | Retry | Priorité |
|-------|-------------|-------|----------|
| Email confirmation commande | OrderCreated | 3 | Normal |
| Email paiement validé | PaymentCompleted | 3 | Normal |
| Email réponse message | MessageReplied | 3 | Normal |
| Newsletter bulk | AdminSendNewsletter | 3 | Low |
| Notification stock bas | ProductOutOfStock | 3 | Normal |

#### Implémentation NestJS

```typescript
// queue/queue.module.ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'emails',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    }),
  ],
})
export class QueueModule {}
```

### 8.8 Stockage (S3/MinIO)

#### Configuration

- **Développement** : Local storage ou MinIO
- **Production** : AWS S3 ou compatible

#### Types de fichiers

| Type | Dossier | ACL |
|------|---------|-----|
| Images produits | products/ | public-read |
| Avatars | avatars/ | public-read |
| Images catégories | categories/ | public-read |
| Preuves paiement | proofs/ | private |
| Logs | logs/ | private |

### 8.9 Recherche

#### Approche PostgreSQL Full-Text Search

```sql
-- Ajouter colonne tsvector
ALTER TABLE produits ADD COLUMN search_vector tsvector;

-- Créer trigger pour mise à jour automatique
CREATE OR REPLACE FUNCTION produits_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', coalesce(NEW.nom, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER produits_search_vector_trigger
  BEFORE INSERT OR UPDATE ON produits
  FOR EACH ROW
  EXECUTE FUNCTION produits_search_vector_update();

-- Index GIN
CREATE INDEX produits_search_vector_idx ON produits USING GIN(search_vector);

-- Requête recherche
SELECT * FROM produits
WHERE search_vector @@ to_tsquery('french', 'chaussure');
```

#### Si besoin avancé : Elasticsearch ou Meilisearch

- Seulement si PostgreSQL insuffisant
- Recherche floue, faceting, autocomplete avancé
- Surcoût infrastructure significatif

---

## PHASE 9 - CONCEPTION DÉTAILLÉE DU BACKEND NESTJS

*Cette section décrit la conception cible TheBox. Les exemples doivent être validés lors de l’implémentation.*

### 9.1 Convention de Nommage

- **Modules** : kebab-case (auth, users, products)
- **Classes** : PascalCase (AuthService, UsersController)
- **Méthodes** : camelCase (createUser, findById)
- **DTOs** : PascalCase + suffixe DTO (CreateUserDTO, UpdateUserDTO)
- **Entities** : PascalCase (User, Product)
- **Interfaces** : PascalCase + prefix I (IUsersRepository)
- **Constants** : UPPER_SNAKE_CASE (MAX_RETRIES, CACHE_TTL)

### 9.2 Structure des Dossiers

```
src/
├── main.ts                    # Point d'entrée
├── app.module.ts              # Module racine
├── common/                    # Code partagé
│   ├── constants/             # Constantes
│   ├── decorators/            # Décorateurs custom
│   ├── dto/                   # DTOs partagés
│   ├── exceptions/            # Exceptions custom
│   ├── filters/               # Exception filters
│   ├── guards/                # Guards (auth, roles)
│   ├── interceptors/          # Interceptors (logging, transform)
│   ├── middlewares/           # Middlewares
│   └── pipes/                 # Pipes (validation)
├── config/                    # Configuration
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   └── pawapay.config.ts
├── [module-name]/             # Chaque module
│   ├── [module].module.ts
│   ├── [module].controller.ts
│   ├── [module].service.ts
│   ├── [module].repository.ts
│   ├── entities/
│   ├── dto/
│   └── guards/
```

### 9.3 DTOs (Data Transfer Objects)

#### Exemple : Users

```typescript
// users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  telephone?: string;
  adresse?: string;
  ville?: string;
}

// users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {}

// users/dto/user-response.dto.ts
import { Exclude } from 'class-transformer';

export class UserResponseDTO {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  googleId: string;
}
```

### 9.4 Services

#### Exemple : UsersService

```typescript
// users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDTO) {
    // Vérifier email unique
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email déjà utilisé');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Créer user
    const user = await this.prisma.user.create({
      data: {
        ...dto,
        password: hashedPassword,
      },
      include: { client: true },
    });

    // Créer client si adresse fournie
    if (dto.adresse || dto.telephone) {
      await this.prisma.client.create({
        data: {
          userId: user.id,
          telephone: dto.telephone,
          adresse: dto.adresse,
          ville: dto.ville,
        },
      });
    }

    return this.excludePassword(user);
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { client: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return this.excludePassword(user);
  }

  async update(id: number, dto: UpdateUserDTO) {
    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dto,
      include: { client: true },
    });

    return this.excludePassword(user);
  }

  async remove(id: number) {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  private excludePassword(user: any) {
    const { password, googleId, ...result } = user;
    return result;
  }
}
```

### 9.5 Controllers

#### Exemple : UsersController

```typescript
// users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDTO: CreateUserDTO) {
    return this.usersService.create(createUserDTO);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDTO: UpdateUserDTO) {
    return this.usersService.update(+id, updateUserDTO);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
```

### 9.6 Guards

#### Exemple : RolesGuard

```typescript
// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
```

### 9.7 Transactions

#### Exemple : OrderService avec Transaction

```typescript
// orders/orders.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDTO } from './dto/create-order.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDTO, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Récupérer les produits avec lock
      const productIds = dto.items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      // 2. Vérifier le stock
      for (const item of dto.items) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new ConflictException(`Produit ${item.productId} non trouvé`);
        }
        if (product.stock < item.quantite) {
          throw new ConflictException(`Stock insuffisant pour ${product.nom}`);
        }
      }

      // 3. Créer la commande
      const order = await tx.order.create({
        data: {
          userId,
          total: dto.total,
          adresse: dto.adresse,
          status: 'PENDING',
          paymentStatus: 'UNPAID',
        },
      });

      // 4. Créer les lignes de commande et décrémenter le stock
      for (const item of dto.items) {
        const product = productMap.get(item.productId);

        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantite: item.quantite,
            prixUnitaire: product.prix,
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantite },
          },
        });
      }

      // 5. Marquer le panier comme converti
      await tx.cart.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'CONVERTED' },
      });

      return order;
    });
  }
}
```

### 9.8 Exceptions

#### Exemple : InsufficientStockException

```typescript
// common/exceptions/insufficient-stock.exception.ts
import { HttpException, HttpStatus } from '@nestjs/common';

export class InsufficientStockException extends HttpException {
  constructor(productId: number, requested: number, available: number) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: `Stock insuffisant pour le produit ${productId}`,
        error: 'INSUFFICIENT_STOCK',
        details: {
          productId,
          requested,
          available,
        },
      },
      HttpStatus.CONFLICT,
    );
  }
}
```

### 9.9 Interceptors

#### Exemple : LoggingInterceptor

```typescript
// common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`→ ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(`← ${method} ${url} ${response.statusCode} ${delay}ms`);
      }),
    );
  }
}
```

### 9.10 Modules NestJS Détailés

#### 9.10.1 AuthModule

**Responsabilité** : Authentification et autorisation

**Services** :
- AuthService : login, register, refresh token
- JwtStrategy : validation JWT
- LocalStrategy : validation local (username/password)

**DTOs** :
- RegisterDTO
- LoginDTO
- RefreshTokenDTO

**Guards** :
- JwtAuthGuard
- RolesGuard

**Routes** :
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET /auth/me

#### 9.10.2 UsersModule

**Responsabilité** : Gestion des utilisateurs

**Services** :
- UsersService : CRUD users
- ClientsService : CRUD clients

**DTOs** :
- CreateUserDTO
- UpdateUserDTO
- UserResponseDTO

**Routes** :
- GET /users (admin/manager)
- GET /users/:id
- PATCH /users/:id
- DELETE /users/:id (admin)

#### 9.10.3 ProductsModule

**Responsabilité** : Gestion des produits

**Services** :
- ProductsService : CRUD produits
- ProductsRepository : accès données avec cache

**DTOs** :
- CreateProductDTO
- UpdateProductDTO
- ProductResponseDTO
- ProductFilterDTO

**Routes** :
- GET /products (public)
- GET /products/:id (public)
- POST /products (admin/manager)
- PATCH /products/:id (admin/manager)
- DELETE /products/:id (admin)

#### 9.10.4 CategoriesModule

**Responsabilité** : Gestion des catégories

**Services** :
- CategoriesService : CRUD catégories

**DTOs** :
- CreateCategoryDTO
- UpdateCategoryDTO
- CategoryResponseDTO

**Routes** :
- GET /categories (public)
- GET /categories/:id (public)
- GET /categories/:id/products (public)
- POST /categories (admin)
- PATCH /categories/:id (admin)
- DELETE /categories/:id (admin)

#### 9.10.5 CartModule

**Responsabilité** : Gestion du panier

**Services** :
- CartService : logique panier (DB + session)

**DTOs** :
- AddItemDTO
- UpdateItemDTO
- CartResponseDTO

**Routes** :
- GET /cart (public + auth)
- POST /cart/items (public + auth)
- PATCH /cart/items/:id (public + auth)
- DELETE /cart/items/:id (public + auth)
- DELETE /cart (public + auth)

#### 9.10.6 OrdersModule

**Responsabilité** : Gestion des commandes

**Services** :
- OrdersService : logique commandes avec transactions

**DTOs** :
- CreateOrderDTO
- UpdateOrderStatusDTO
- OrderResponseDTO

**Routes** :
- GET /orders (auth)
- POST /orders (auth)
- GET /orders/:id (auth)
- PATCH /orders/:id/status (admin/manager)

#### 9.10.7 PaymentsModule

**Responsabilité** : Gestion des paiements

**Sous-modules** :
- PawaPayModule : intégration PawaPay
- DriversModule : Stripe, PayPal, Orange Money

**Services** :
- PaymentsService : abstraction paiement
- PawaPayService : intégration PawaPay

**DTOs** :
- InitiateDepositDTO
- DepositStatusDTO

**Routes** :
- POST /payments/pawapay/initiate
- GET /payments/pawapay/status/:depositId
- POST /webhooks/pawapay/callback

#### 9.10.8 MessagesModule

**Responsabilité** : Messagerie

**Services** :
- MessagesService : logique messagerie

**DTOs** :
- CreateMessageDTO
- MessageResponseDTO

**Routes** :
- POST /messages (public)
- GET /messages (auth)
- POST /messages/:id/reply (admin)

#### 9.10.9 AdminModule

**Responsabilité** : Administration

**Sous-modules** :
- StatsModule : statistiques dashboard
- ConfigModule : configuration site

**Services** :
- StatsService : calculs KPIs
- ConfigService : gestion configs

**Routes** :
- GET /admin/stats
- GET /admin/config
- PATCH /admin/config

---

## PHASE 10 - CONCEPTION COMPLÈTE DES API

*Cette section décrit la conception cible TheBox. Les exemples doivent être validés lors de l’implémentation.*

### 10.1 Conventions API

#### Format de Réponse

**Succès** :
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-10-26T10:00:00Z"
  }
}
```

**Erreur** :
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-10-26T10:00:00Z"
  }
}
```

#### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Succès GET, PUT, PATCH |
| 201 | Création réussie POST |
| 204 | Suppression réussie DELETE |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Ressource introuvable |
| 409 | Conflit (email déjà utilisé, stock insuffisant) |
| 422 | Validation error |
| 429 | Rate limit exceeded |
| 500 | Erreur serveur |

#### Pagination

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 10.2 Endpoints API

#### 10.2.1 Auth

| Méthode | Chemin | Auth | Description | Body |
|---------|-------|------|-------------|------|
| POST | /api/v1/auth/register | Public | Inscription | `{ email, password, name, telephone?, adresse?, ville? }` |
| POST | /api/v1/auth/login | Public | Connexion | `{ email, password }` |
| POST | /api/v1/auth/logout | JWT | Déconnexion | - |
| POST | /api/v1/auth/refresh | Public | Refresh token | `{ refreshToken }` |
| GET | /api/v1/auth/me | JWT | Profil utilisateur | - |
| PATCH | /api/v1/auth/me | JWT | Modifier profil | `{ name?, telephone?, adresse?, ville? }` |
| POST | /api/v1/auth/password/reset-request | Public | Demande reset mot de passe | `{ email }` |
| POST | /api/v1/auth/password/reset | Public | Reset mot de passe | `{ token, password }` |

**Rate limiting** : 10 req/min sur register, login, password-reset

#### 10.2.2 Users

| Méthode | Chemin | Auth | Roles | Description | Body |
|---------|-------|------|-------|-------------|------|
| GET | /api/v1/users | JWT | Admin, Manager | Liste utilisateurs | Query: `page, limit, search, role` |
| GET | /api/v1/users/:id | JWT | Admin, Manager, Self | Détail utilisateur | - |
| PATCH | /api/v1/users/:id | JWT | Admin, Manager, Self | Modifier utilisateur | `{ name?, email?, role? }` |
| DELETE | /api/v1/users/:id | JWT | Admin | Supprimer utilisateur | - |
| POST | /api/v1/users/:id/restore | JWT | Admin | Restaurer utilisateur (soft delete) | - |

**Rate limiting** : 30 req/min sur write operations

#### 10.2.3 Products

| Méthode | Chemin | Auth | Roles | Description | Body |
|---------|-------|------|-------|-------------|------|
| GET | /api/v1/products | Public | - | Liste produits | Query: `page, limit, search, category_id, min_price, max_price, sort` |
| GET | /api/v1/products/:id | Public | - | Détail produit | - |
| POST | /api/v1/products | JWT | Admin, Manager | Créer produit | `{ nom, description, prix, stock, category_id, image?, galerie? }` |
| PATCH | /api/v1/products/:id | JWT | Admin, Manager | Modifier produit | `{ nom?, description?, prix?, stock?, category_id?, image?, galerie? }` |
| DELETE | /api/v1/products/:id | JWT | Admin, Manager | Supprimer produit | - |
| PATCH | /api/v1/products/:id/stock | JWT | Admin, Manager | Modifier stock | `{ stock, delta? }` |

**Rate limiting** : 30 req/min sur write operations

#### 10.2.4 Categories

| Méthode | Chemin | Auth | Roles | Description | Body |
|---------|-------|------|-------|-------------|------|
| GET | /api/v1/categories | Public | - | Liste catégories | Query: `parent_id?` |
| GET | /api/v1/categories/:id | Public | - | Détail catégorie | - |
| GET | /api/v1/categories/:id/products | Public | - | Produits catégorie | Query: `page, limit, sort` |
| POST | /api/v1/categories | JWT | Admin | Créer catégorie | `{ nom, parent_id?, image?, display_order? }` |
| PATCH | /api/v1/categories/:id | JWT | Admin | Modifier catégorie | `{ nom?, parent_id?, image?, display_order? }` |
| DELETE | /api/v1/categories/:id | JWT | Admin | Supprimer catégorie | - |

#### 10.2.5 Cart

| Méthode | Chemin | Auth | Description | Body |
|---------|-------|------|-------------|------|
| GET | /api/v1/cart | Optional | Récupérer panier | - |
| POST | /api/v1/cart/items | Optional | Ajouter article | `{ product_id, quantite, taille?, couleur?, notes? }` |
| PATCH | /api/v1/cart/items/:id | Optional | Modifier article | `{ quantite }` |
| DELETE | /api/v1/cart/items/:id | Optional | Supprimer article | - |
| DELETE | /api/v1/cart | Optional | Vider panier | - |

**Note** : "Optional" = fonctionne pour invités (session) et authentifiés (JWT)

#### 10.2.6 Orders

| Méthode | Chemin | Auth | Roles | Description | Body |
|---------|-------|------|-------|-------------|------|
| GET | /api/v1/orders | JWT | Customer | Liste commandes user | Query: `page, limit, status` |
| GET | /api/v1/orders/:id | JWT | Customer, Admin, Manager | Détail commande | - |
| POST | /api/v1/orders | JWT | Customer | Créer commande | `{ adresse, items? }` (items optionnels si depuis panier) |
| PATCH | /api/v1/orders/:id/status | JWT | Admin, Manager | Modifier statut | `{ status }` |
| POST | /api/v1/orders/:id/cancel | JWT | Customer | Annuler commande | - |

**Rate limiting** : 30 req/min sur update status

#### 10.2.7 Payments (PawaPay)

| Méthode | Chemin | Auth | Description | Body |
|---------|-------|------|-------------|------|
| POST | /api/v1/payments/pawapay/initiate | JWT | Initier paiement PawaPay | `{ order_id, phone, provider }` |
| GET | /api/v1/payments/pawapay/status/:depositId | Optional | Vérifier statut dépôt | - |
| POST | /webhooks/pawapay/callback | Public | Webhook PawaPay | `{ depositId, status, ... }` |

**Note** : Webhook exclut CSRF et rate limiting (configuré spécifiquement)

#### 10.2.8 Messages

| Méthode | Chemin | Auth | Roles | Description | Body |
|---------|-------|------|-------|-------------|------|
| POST | /api/v1/messages | Public | - | Envoyer message contact | `{ nom, email, message }` |
| GET | /api/v1/messages | JWT | Customer | Liste messages user | - |
| GET | /api/v1/messages/:id | JWT | Admin, Manager, Customer | Détail message | - |
| POST | /api/v1/messages/:id/reply | JWT | Admin, Manager | Répondre message | `{ reply }` |

#### 10.2.9 Admin

| Méthode | Chemin | Auth | Roles | Description | Body |
|---------|-------|------|-------|-------------|------|
| GET | /api/v1/admin/stats | JWT | Admin, Manager | Dashboard stats | Query: `period?` (day, week, month, year) |
| GET | /api/v1/admin/config | JWT | Admin | Configuration site | - |
| PATCH | /api/v1/admin/config | JWT | Admin | Modifier configuration | `{ key, value }` |
| GET | /api/v1/admin/errors | JWT | Admin | Liste erreurs | Query: `status?, page, limit` |
| GET | /api/v1/admin/errors/:id | JWT | Admin | Détail erreur | - |
| PATCH | /api/v1/admin/errors/:id | JWT | Admin | Modifier statut erreur | `{ status }` |
| DELETE | /api/v1/admin/errors/:id | JWT | Admin | Supprimer erreur | - |

### 10.3 Validation

#### Exemple : CreateProductDTO

```typescript
import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateProductDTO {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nom: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  prix: number;

  @IsInt()
  @Min(0)
  stock: number;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  galerie?: string[];
}
```

### 10.4 Documentation OpenAPI

#### Configuration NestJS

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Stepora API')
    .setDescription('API e-commerce Stepora')
    .setVersion('1.0')
    .addTag('auth')
    .addTag('products')
    .addTag('orders')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
}
```

### 10.5 Versionnement API

- **Version actuelle** : v1
- **URL pattern** : `/api/v1/*`
- **Backward compatibility** : Maintenir v1 pendant 12 mois après sortie v2
- **Dépréciation** : Ajouter header `X-API-Deprecated: true` sur endpoints v1 obsolètes

---

## PHASE 11 - AUTHENTIFICATION ET AUTORISATION

*Cette section décrit la conception cible TheBox. Les exemples doivent être validés lors de l’implémentation.*

### 11.1 Stratégie Recommandée : JWT + Refresh Token

#### Justification

1. **Stateless** : Adapté pour API REST
2. **Scalable** : Pas de stockage session côté serveur
3. **Mobile-friendly** : Fonctionne nativement sur mobile
4. **SPA-friendly** : Compatible React
5. **Sécurité** : Refresh token rotation pour mitigation XSS

### 11.2 Flux d'Authentification

```
1. REGISTER
   Client → POST /auth/register → { email, password }
   Server → Créer user + hash password
   Server → Générer access token (15 min) + refresh token (7 days)
   Server → Retourner { accessToken, refreshToken, user }

2. LOGIN
   Client → POST /auth/login → { email, password }
   Server → Vérifier credentials
   Server → Générer tokens
   Server → Retourner { accessToken, refreshToken, user }

3. REFRESH
   Client → POST /auth/refresh → { refreshToken }
   Server → Valider refresh token
   Server → Générer nouveau access token + nouveau refresh token (rotation)
   Server → Retourner { accessToken, refreshToken }

4. LOGOUT
   Client → POST /auth/logout → Authorization: Bearer accessToken
   Server → Invalider refresh token (blacklist ou DB)
   Server → Retourner 204 No Content
```

### 11.3 Implémentation NestJS

#### 11.3.1 AuthService

```typescript
// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credentials invalides');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credentials invalides');
    }

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, roles: user.roles };
    
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Stocker refresh token en DB ou Redis
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.excludePassword(user),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      // Vérifier que refresh token est valide et non révoqué
      const isValid = await this.validateRefreshToken(payload.sub, refreshToken);
      if (!isValid) {
        throw new UnauthorizedException('Refresh token invalide');
      }

      const user = await this.usersService.findOne(payload.sub);
      
      // Générer nouveaux tokens (rotation)
      const newPayload = { sub: user.id, email: user.email, roles: user.roles };
      const newAccessToken = this.jwtService.sign(newPayload, { expiresIn: '15m' });
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Révoquer ancien refresh token, sauvegarder nouveau
      await this.rotateRefreshToken(payload.sub, refreshToken, newRefreshToken);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (e) {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

  async logout(userId: number, refreshToken: string) {
    // Révoquer refresh token
    await this.revokeRefreshToken(userId, refreshToken);
  }

  private excludePassword(user: any) {
    const { password, ...result } = user;
    return result;
  }

  private async saveRefreshToken(userId: number, token: string) {
    // Implémentation : stocker en DB ou Redis
  }

  private async validateRefreshToken(userId: number, token: string): Promise<boolean> {
    // Implémentation : vérifier en DB ou Redis
    return true;
  }

  private async rotateRefreshToken(userId: number, oldToken: string, newToken: string) {
    // Implémentation : révoquer old, sauvegarder new
  }

  private async revokeRefreshToken(userId: number, token: string) {
    // Implémentation : marquer comme révoqué
  }
}
```

#### 11.3.2 JwtStrategy

```typescript
// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

#### 11.3.3 Guards

```typescript
// auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

### 11.4 Gestion des Rôles

#### Table roles (nouvelle)

```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

#### Rôles

- **ADMIN** : Accès complet administration
- **MANAGER** : Accès gestion (produits, commandes, mais pas users/admins)
- **CUSTOMER** : Accès client (panier, commandes, profil)

#### Decorator Roles

```typescript
// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

#### Utilisation

```typescript
// products.controller.ts
@Controller('products')
export class ProductsController {
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'MANAGER')
  create(@Body() dto: CreateProductDTO) {
    return this.productsService.create(dto);
  }
}
```

### 11.5 Alternative : Sessions + Cookies

Si l'application est principalement web (pas mobile), sessions peuvent être préférables :

**Avantages** :
- Plus simple à implémenter
- Révocation instantanée (supprimer session)
- Moins de complexité JWT

**Inconvénients** :
- Stateful (stockage session côté serveur)
- Moins scalable (nécessite Redis/DB partagé)
- Moins adapté mobile

**Recommandation** : JWT pour API + SPA, Sessions pour admin panel web classique.

---

## PLAN DE CONSTRUCTION DE THEBOX

Ce plan concerne la reconstruction neuve de TheBox. Les durées ne sont pas garanties : elles dépendront du temps disponible, du niveau de détail de l'application source et des résultats des tests. Il faut terminer et valider une phase avant de considérer la suivante comme acquise.

### Phase 0 — Geler et documenter la référence Stepora

1. Garder le dépôt et la base Stepora en l'état ; créer une sauvegarde exploitable.
2. Capturer les pages et parcours importants : accueil, catalogue, recherche, détail produit, panier, connexion/inscription, commande, paiement, suivi de commande et administration.
3. Inventorier les catégories, champs produits, tailles, états de commande, rôles, messages et règles de stock.
4. Vérifier les fonctions signalées dans l'audit en consultant le code et en exécutant les parcours ; marquer chaque élément **confirmé**, **à corriger**, **non implémenté** ou **inconnu**.
5. Ne pas copier les secrets, les données personnelles réelles ou les clés de paiement dans le nouveau dépôt.

**Livrable** : matrice des fonctionnalités et règles métier validées.

### Phase 1 — Initialiser l'environnement et le dépôt

1. Créer le dépôt TheBox séparé du projet Stepora.
2. Initialiser le backend NestJS avec TypeScript et le frontend React avec TypeScript.
3. Configurer PostgreSQL et Prisma ; ajouter les variables requises dans `.env.example`, sans valeurs secrètes.
4. Ajouter `.gitignore`, scripts npm, lint/formatage, configuration de tests et documentation de démarrage.
5. Ajouter Docker Compose uniquement pour les services nécessaires au développement (par exemple PostgreSQL) et vérifier la consommation mémoire sur le PC de développement.
6. Vérifier que l'application démarre sur Windows 10 et documenter les commandes de démarrage/arrêt.

**Critère de sortie** : frontend et backend démarrent séparément, se joignent correctement à PostgreSQL et disposent d'un premier test automatisé.

### Phase 2 — Modèle de données et fondations backend

1. Concevoir les entités et relations : utilisateurs, rôles, catégories, produits, images produit, panier/lignes de panier, commandes/lignes de commande, paiements et messages si ces fonctions sont confirmées.
2. Définir les contraintes SQL, index, clés étrangères, valeurs monétaires en type décimal adapté et dates cohérentes.
3. Créer les migrations Prisma et les données de développement fictives.
4. Organiser NestJS en modules métier, DTOs, contrôleurs, services et gestion d'erreurs.
5. Ajouter validation, configuration centralisée, journalisation utile et gestion uniforme des erreurs.

**Critère de sortie** : migrations reproductibles, contraintes vérifiées et tests des règles de données essentiels.

### Phase 3 — Catalogue et frontend public

1. Construire les pages React à partir de la référence visuelle Stepora : accueil, catégories, liste de produits, détail, recherche et navigation responsive.
2. Implémenter les endpoints de lecture du catalogue et des catégories.
3. Gérer pagination, filtres, recherche, images manquantes et états de chargement/erreur.
4. Ajouter des tests API et des tests d'interface pour les parcours principaux.

**Critère de sortie** : un visiteur peut naviguer et rechercher des produits sur des données de test.

### Phase 4 — Authentification, autorisations et administration

1. Implémenter inscription, connexion, déconnexion, récupération de compte et vérification d'adresse e-mail si retenues dans le périmètre.
2. Choisir explicitement la stratégie de session/cookie ou JWT ; ne pas cumuler les mécanismes sans besoin. Pour une SPA web, évaluer d'abord les cookies `HttpOnly`, `Secure` et `SameSite`, la protection CSRF et la rotation/révocation des sessions.
3. Appliquer les rôles et permissions côté backend ; masquer un bouton dans React ne constitue pas un contrôle d'accès.
4. Construire l'administration des produits, catégories, stocks, commandes et utilisateurs selon les rôles confirmés.
5. Ajouter limitation des tentatives, validation stricte, journalisation des actions sensibles et tests d'accès refusé.

**Critère de sortie** : les routes privées sont protégées et les tests prouvent qu'un rôle non autorisé ne peut pas effectuer une action administrative.

### Phase 5 — Panier, commandes et stock

1. Définir une seule source de vérité côté serveur pour le panier, même si plusieurs interfaces l'utilisent.
2. Valider prix, disponibilité, quantité et identifiant produit côté serveur ; ne jamais faire confiance aux montants envoyés par le navigateur.
3. Calculer le total à partir des données serveur et enregistrer une copie des prix/produits dans les lignes de commande pour préserver l'historique.
4. Créer les commandes dans une transaction PostgreSQL ; utiliser une stratégie de concurrence adaptée pour empêcher les ventes au-delà du stock disponible.
5. Définir les transitions permises de commande et les règles d'annulation/restauration du stock.
6. Tester les doubles soumissions, les quantités invalides, les changements de prix et les commandes concurrentes.

**Critère de sortie** : les commandes et mouvements de stock restent cohérents même en cas de requêtes concurrentes ou d'erreur.

### Phase 6 — Paiements Mobile Money et PawaPay

1. Commencer par un environnement sandbox et des tests automatisés ; aucune vraie transaction avant revue de sécurité et validation du parcours.
2. Isoler l'intégration derrière un service/adaptateur de paiement ; garder les règles de commande indépendantes du fournisseur.
3. Vérifier les exigences et le format exacts du fournisseur PawaPay dans sa documentation officielle au moment de l'intégration.
4. Vérifier côté serveur les références, montants, devises, statuts et identifiants de transaction ; valider l'authenticité du webhook selon le mécanisme officiellement pris en charge.
5. Implémenter l'idempotence afin qu'un webhook répété ne valide pas deux fois une commande.
6. Utiliser TLS avec vérification de certificat activée ; ne pas désactiver la vérification SSL en production. Ne jamais exposer les clés API au frontend.
7. Prévoir états de paiement explicites, délais d'expiration, échecs, rapprochement et journalisation sans secrets ni données de paiement excessives.
8. Ne considérer le paiement comme confirmé qu'après confirmation serveur fiable ; définir une procédure de rapprochement en cas de statut ambigu.

**Critère de sortie** : tests couvrant succès, refus, timeout, webhook répété, montant incorrect, référence inconnue et notification non authentifiée.

### Phase 7 — Tests de bout en bout et durcissement

1. Tester les parcours complets : consultation → panier → commande → paiement sandbox → confirmation ; ainsi que les parcours d'échec.
2. Tester les autorisations, les validations, les limites de requêtes et les erreurs de configuration.
3. Vérifier CORS, cookies, CSRF selon le mécanisme retenu, en-têtes de sécurité, politique de mots de passe et gestion des secrets.
4. Vérifier les sauvegardes PostgreSQL et effectuer un test de restauration.
5. Exécuter les tests et la vérification des dépendances avant chaque livraison.

**Critère de sortie** : les tests critiques passent dans un environnement propre et la procédure de restauration est documentée.

### Phase 8 — Déploiement contrôlé et amélioration

1. Configurer les environnements développement, test et production séparément.
2. Définir les variables d'environnement, logs, sauvegardes, migrations et procédure de rollback.
3. Déployer d'abord une version limitée, surveiller erreurs et performances, puis élargir l'accès.
4. Comparer le comportement de TheBox avec les parcours Stepora de référence.
5. Ajouter ensuite, selon les priorités, wishlist, promotions, newsletter, analytics ou autres fonctions secondaires.

**Critère de sortie** : déploiement reproductible, restauration testée, parcours métier validés et procédure de retour arrière disponible.

---

## RISQUES ET MITIGATIONS

| Risque | Niveau | Mesure de réduction |
|---|---|---|
| Fonctionnalités de Stepora oubliées ou mal comprises | Élevé | Matrice de parité, vérification du code et tests manuels de référence |
| Réécriture trop large avant d'avoir une première version utilisable | Élevé | Développement par tranches verticales et livrables courts |
| Divergence entre interface et API | Moyen/élevé | Contrats API documentés, DTOs et tests d'intégration |
| Vente au-delà du stock ou total incorrect | Critique | Transactions, contrôle serveur, stratégie de concurrence et tests |
| Faux webhook ou double validation de paiement | Critique | Authentification du webhook, idempotence, validation montant/référence/statut |
| Secrets exposés dans Git ou le navigateur | Critique | `.env`, `.gitignore`, rotation des secrets et revue du dépôt |
| Authentification mal sécurisée | Élevé | Choix explicite session/JWT, cookies sûrs, CSRF selon architecture et tests d'autorisation |
| Base de données perdue ou migrations destructrices | Élevé | Sauvegardes, migrations revues et tests de restauration |
| Poste de développement limité à 8 Go de RAM | Moyen | Démarrer peu de services, éviter les conteneurs superflus et fermer les outils inutiles |
| Périmètre trop ambitieux pour le temps disponible | Élevé | Prioriser catalogue, comptes, panier, commandes, administration et paiement sandbox |

---

## RECOMMANDATIONS FINALES

### Décision pour TheBox

**Construire TheBox sur Node.js + NestJS + TypeScript, React + TypeScript et PostgreSQL**, conformément à l'objectif du projet. Ne pas modifier Stepora pour réaliser cette reconstruction.

Le code source Stepora reste une référence utile pour identifier les pages, règles métier, données et intégration de paiement. Il ne faut toutefois pas supposer que chaque fonction décrite dans l'audit est achevée, sécurisée ou testée : vérifier les points critiques dans le dépôt et par des tests.

### Ordre de priorité

1. **P0 — Référence et fondations** : matrice de parité, dépôt séparé, environnement reproductible, PostgreSQL, configuration et tests.
2. **P1 — Parcours essentiels** : catalogue, recherche, comptes, administration, panier, commandes et gestion du stock.
3. **P1 — Paiement sûr** : PawaPay sandbox, vérification côté serveur, webhooks authentifiés, idempotence et journalisation.
4. **P2 — Qualité et livraison** : tests E2E, accessibilité/responsive, sauvegardes, documentation, déploiement et rollback.
5. **P3 — Extensions** : promotions, wishlist, analytics, notifications ou autres fonctions seulement après stabilisation du cœur e-commerce.

### Principes d'architecture à maintenir

- Commencer par un **monolithe modulaire NestJS** ; extraire un service séparé uniquement si un besoin opérationnel le justifie.
- Garder une seule source de vérité métier pour panier, prix, stock, commandes et paiements.
- Utiliser PostgreSQL pour les contraintes d'intégrité et les transactions ; éviter de faire reposer la cohérence sur le frontend.
- Définir les contrats API et les DTOs avant de multiplier les écrans.
- Séparer les adaptateurs externes (PawaPay, e-mail, stockage d'images) des règles métier.
- Traiter sécurité et tests comme des critères de livraison, non comme des améliorations ultérieures.
- Ne pas importer des données de production sans autorisation, sauvegarde, minimisation des données et plan de validation.

### Critères de parité avant de considérer TheBox comme une reprise fonctionnelle

- Les fonctionnalités de référence sont classées et chacune possède un statut vérifié.
- Les parcours critiques sont couverts par des tests reproductibles.
- Les données et les règles de prix, stock, commandes et paiements sont cohérentes.
- Les droits sont appliqués côté backend et les secrets ne sont pas exposés.
- Les paiements sont testés en sandbox et les webhooks répétés ou invalides ne peuvent pas confirmer abusivement une commande.
- Les migrations, sauvegardes et procédures de déploiement/rollback sont documentées.
- Les pages essentielles sont comparées visuellement à Stepora et fonctionnent sur mobile comme sur ordinateur.

---

**FIN DU DOCUMENT**

**Version** : 2.0 — adaptation TheBox  
**Date** : 26 octobre 2026  
**Projet cible** : TheBox — React, NestJS, TypeScript et PostgreSQL  
**Projet de référence** : Stepora — Laravel 12  
