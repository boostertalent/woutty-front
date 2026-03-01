# 🚀 BoosterTalent - Plateforme de Marketing d'Influence

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

## 📋 Table des Matières

- [Vue d'ensemble](#-vue-densemble)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [Scripts disponibles](#-scripts-disponibles)
- [Base de données](#-base-de-données)
- [Authentification](#-authentification)
- [Contribution](#-contribution)
- [Documentation](#-documentation)

---

## 🎯 Vue d'ensemble

**Woutty** est une plateforme web moderne de mise en relation entre **marques** et **créateurs de contenu** pour des campagnes de marketing d'influence. La plateforme facilite la gestion complète du cycle de vie des campagnes, de la création à la validation des contenus.

### Objectifs principaux

- 🤝 **Mise en relation** : Connecter marques et influenceurs de manière efficace
- 📊 **Suivi en temps réel** : Tableau de bord avec statistiques détaillées par plateforme
- ✅ **Validation de contenu** : Workflow de validation admin pour les posts liés aux campagnes
- 🎨 **Interface moderne** : UX/UI optimisée pour tous les types d'utilisateurs
- 📱 **Multi-plateforme** : Support Instagram, TikTok, YouTube, X (Twitter), Snapchat, Facebook

---

## ✨ Fonctionnalités

### Pour les Créateurs 👤

- ✅ **Dashboard personnalisé** avec métriques par plateforme sociale
- ✅ **Gestion des posts** : Import automatique depuis les réseaux sociaux
- ✅ **Opportunités de campagnes** : Réception et acceptation de propositions
- ✅ **Liaison posts/campagnes** : Association des contenus aux campagnes actives
- ✅ **Suivi de validation** : Statut de validation admin en temps réel
- ✅ **Historique des revenus** : Suivi des campagnes terminées et gains

### Pour les Marques 🏢

- ✅ **Création de campagnes** : Définition d'objectifs, budget, durée
- ✅ **Sélection de créateurs** : Attribution manuelle ou via système de packs
- ✅ **Suivi des performances** : Métriques d'engagement par campagne
- ✅ **Gestion des budgets** : Allocation et suivi des dépenses
- ✅ **Demande d'assistance** : Support dédié pour la création de campagnes

### Pour les Administrateurs 🛡️

- ✅ **Dashboard global** : Vue d'ensemble de la plateforme
- ✅ **Validation de posts** : Workflow d'approbation des contenus liés aux campagnes
- ✅ **Gestion des packs** : Création et attribution de packs créateurs
- ✅ **Logs d'activité** : Historique complet des actions admin
- ✅ **Support marques** : Gestion des demandes d'assistance campagnes
- ✅ **Statistiques avancées** : Croissance, inscriptions, engagement

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │  Créateurs  │  │   Marques   │  │    Admin    ││
│  │  Dashboard  │  │  Dashboard  │  │  Dashboard  ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
├─────────────────────────────────────────────────────┤
│              API Routes (Next.js API)               │
├─────────────────────────────────────────────────────┤
│           Supabase Client (Auth + Database)         │
├─────────────────────────────────────────────────────┤
│                   BACKEND (Supabase)                │
├─────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐│
│  │ PostgreSQL  │  │    Auth     │  │   Storage   ││
│  │  Database   │  │   Service   │  │   Service   ││
│  └─────────────┘  └─────────────┘  └─────────────┘│
└─────────────────────────────────────────────────────┘
```

### Architecture des données

- **Utilisateurs** : Séparation stricte créateurs/marques/admins
- **Profils sociaux** : Liaison via `id_w` (user ID) et `id_plateforme`
- **Posts** : Importation automatique avec normalisation des métriques
- **Campagnes** : Workflow complet avec statuts (pending/accepted/completed)
- **Validation** : Système d'approbation admin pour les posts liés aux campagnes

---

## 🛠️ Technologies

### Frontend
- **Next.js 15** - Framework React avec App Router
- **React 19** - Bibliothèque UI avec Server Components
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **Framer Motion** - Animations fluides
- **Lucide React** - Bibliothèque d'icônes

### Backend
- **Supabase** - Backend-as-a-Service (PostgreSQL + Auth + Storage)
- **PostgreSQL** - Base de données relationnelle
- **Row Level Security (RLS)** - Sécurité au niveau des lignes

### Outils & Services
- **Git/GitHub** - Contrôle de version
- **ESLint** - Linter JavaScript/TypeScript
- **PostCSS** - Transformation CSS

---

## 📦 Installation

### Prérequis

- Node.js 18+ et npm/yarn/pnpm
- Compte Supabase configuré
- Git

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/boostertalent/woutty-front.git
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env.local
```

Remplir `.env.local` avec vos credentials Supabase :
```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
```

4. **Initialiser la base de données**
lien supabase:https://supabase.com/dashboard/project/lwkhxnhmubwgvpoqnuhl

5. **Lancer le serveur de développement**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

---

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de  projet Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service pour opérations admin (côté serveur) | ⚠️ |

### Configuration Supabase

#### 1. Politiques RLS (Row Level Security)

Les politiques RLS sont configurées pour :
- Créateurs : Accès à leurs propres données uniquement
- Marques : Accès à leurs campagnes et créateurs assignés
- Admins : Accès complet en lecture/écriture

#### 2. Storage

Buckets configurés :
- `creator-avatars` : Avatars des créateurs (public)
- `brand-logos` : Logos des marques (public)
- `post-media` : Médias des posts (public)

---

## 📁 Structure du projet
NB:Les  pages (page.test.tsx) sont les pages de test
NB:La page d'accueil regroupe plusieurs composants et qui se trouve components
```
woutty-front/
├── src/
│   └── app/                           # App Router (Next.js 15)
│       │
│       ├── admin/                     # 🛡️ Dashboard Administrateur
│       │   ├── admins/               # Gestion des administrateurs
│       │   │   └── page.tsx
│       │   ├── assistance/           # Support demandes marques
│       │   │   └── page.tsx
│       │   ├── brands/               # Vue marques côté admin
│       │   │   └── page.tsx
│       │   ├── creators/             # Vue créateurs côté admin
│       │   │   └── page.tsx
│       │   ├── dashboard/            # Dashboard principal admin
│       │   │   └── page.tsx
│       │   ├── logs/                 # Logs d'activité admin
│       │   │   └── page.tsx
│       │   ├── packs/                # Gestion des packs créateurs
│       │   │   └── page.tsx
│       │   ├── profile/              # Profil administrateur
│       │   │   └── page.tsx
│       │   ├── validate-posts/       # ✅ Validation posts campagnes
│       │   │   └── page.tsx
│       │   └── layout.tsx
│       │
│       ├── auth/                     # 🔐 Authentification
│       │   ├── callback/
│       │   │   ├── route.test.ts
│       │   │   └── route.ts
│       │   ├── forgot-password/
│       │   │   ├── page.test.tsx
│       │   │   └── page.tsx
│       │   ├── login/
│       │   │   ├── page.test.tsx
│       │   │   └── page.tsx
│       │   └── reset-password/
│       │       ├── page.test.tsx
│       │       └── page.tsx
│       │
│       ├── brands/                   # 🏢 Dashboard Marques
│       │   ├── auth/                 # Authentification & workflow marques
│       │   │   ├── campagne/        # 📝 Création campagne - Étape 1
│       │   │   ├── campagne2/       # 📝 Création campagne - Étape 2
│       │   │   ├── campagne3/       # 📝 Création campagne - Étape 3
│       │   │   ├── campagne4/       # 📝 Création campagne - Étape 4
│       │   │   ├── edit/            # ✏️ Édition campagne
│       │   │   ├── formulaire/      # 📋 Formulaire complet
│       │   │   ├── success/         # ✅ Confirmation création
│       │   │   ├── campaign-choice/ # 🎯 Choix type de campagne
│       │   │   ├── dashboard/       # 📊 Dashboard marque
│       │   │   ├── matching-analysis/ # 🔍 Analyse et matching créateurs
│       │   │   └── my-pack/         # 📦 Mes packs créateurs
│       │   └── layout.tsx
│       │
│       ├── creators/                 # 👤 Dashboard Créateurs
│       │   ├── auth/
│       │   │   └── formulaire/      # 📝 Inscription créateur
│       │   │       ├── etape1/      # Étape 1: Informations personnelles
│       │   │       ├── etape2/      # Étape 2: Réseaux sociaux
│       │   │       └── etape3/      # Étape 3: Finalisation profil
│       │   ├── dashboard/           # 📊 Dashboard principal créateur
│       │   │   ├── profile/         # 👤 Gestion profil
│       │   │   │   ├── page.test.tsx
│       │   │   │   └── page.tsx
│       │   │   └── page.tsx
│       │   └── page.tsx
│       │
│       ├── globals.css              # Styles globaux Tailwind
│       ├── layout.tsx               # Layout racine application
│       └── page.tsx                 # Page d'accueil
│
├── components/                       # Composants réutilisables
│   ├── ui/                          # Composants UI génériques
│   └── shared/                      # Composants partagés métier
│
├── lib/                             # Utilitaires et helpers
│   ├── supabase/                    # Configuration Supabase client
│   └── utils.ts                     # Fonctions utilitaires
│
├── public/                          # Assets statiques
│   └── images/                      # Images et logos
│
├── .env.example                     # Template variables d'environnement
├── .env.local                       # Variables locales (non versionné)
├── .gitignore                       # Fichiers ignorés par Git
├── next.config.js                   # Configuration Next.js
├── package.json                     # Dépendances npm
├── postcss.config.js                # Configuration PostCSS
├── tailwind.config.js               # Configuration Tailwind CSS
├── tsconfig.json                    # Configuration TypeScript
└── README.md                        # Documentation projet
```

### 📂 Détails des sections principales

#### 🛡️ Admin (`/admin`)
Espace d'administration complet pour la gestion de la plateforme :
- **Dashboard** : Statistiques globales, vue d'ensemble plateforme
- **Validate Posts** : Interface de validation des posts liés aux campagnes avec workflow d'approbation
- **Packs** : Création, édition et attribution de packs créateurs aux marques
- **Assistance** : Gestion des demandes d'aide des marques pour création de campagnes
- **Admins** : Gestion des administrateurs (admin principal uniquement)
- **Brands** : Vue d'ensemble des marques inscrites
- **Creators** : Vue d'ensemble des créateurs actifs
- **Logs** : Historique complet des actions administrateur (audit trail)
- **Profile** : Gestion du profil admin

#### 🏢 Brands (`/brands/auth`)
Parcours complet pour les marques :
- **Campaign Creation Workflow** : Processus en 4 étapes
  - `campagne/` : Informations de base (nom, objectifs)
  - `campagne2/` : Budget et durée
  - `campagne3/` : Critères de sélection créateurs
  - `campagne4/` : Révision et confirmation
- **Campaign Choice** : Sélection du type de campagne (standard/personnalisée)
- **Matching Analysis** : Algorithme de matching et sélection de créateurs compatibles
- **My Pack** : Gestion des packs de créateurs attribués
- **Dashboard** : Vue d'ensemble campagnes actives, statistiques, performances
- **Edit** : Modification de campagnes existantes
- **Success** : Page de confirmation après création campagne

#### 👤 Creators (`/creators`)
Espace créateur de contenu :
- **Dashboard** : 
  - Métriques détaillées par plateforme (Instagram, TikTok, YouTube, etc.)
  - Liste des posts avec statistiques (likes, vues, commentaires, engagement)
  - Opportunités de campagnes (pending/accepted)
  - Historique des revenus
- **Inscription Workflow** (3 étapes) :
  - `etape1/` : Informations personnelles (nom, email, téléphone)
  - `etape2/` : Connexion réseaux sociaux (import profils)
  - `etape3/` : Finalisation et création du compte
- **Profile** : Gestion complète du profil et paramètres

#### 🔐 Auth (`/auth`)
Système d'authentification complet :
- **Login** : Connexion utilisateurs (créateurs/marques/admins)
- **Forgot Password** : Demande de réinitialisation mot de passe
- **Reset Password** : Création nouveau mot de passe
- **Callback** : Gestion des callbacks OAuth et redirections post-auth

### 🎨 Conventions de nommage

- **Composants** : PascalCase (`CreatorDashboard.tsx`)
- **Routes** : kebab-case (`validate-posts/`, `campaign-choice/`)
- **Fichiers de test** : `*.test.tsx` ou `*.test.ts`
- **Types/Interfaces** : PascalCase avec préfixe (`IUser`, `TPost`)

---

## 📜 Scripts disponibles

```bash
# Développement
npm run dev          # Lance le serveur de développement sur localhost:3000

```

---

## 🗄️ Base de données

### Tables principales

#### `createur`
Profils des créateurs de contenu
- `id_w` (PK) - UUID user
- `full_name` - Nom complet
- `email` - Email
- `phone` - Téléphone
- `avatar_url` - URL avatar
- `role` - Rôle (creator/admin)

#### `marque`
Profils des marques
- `id_w` (PK) - UUID user
- `nom_marque` - Nom de la marque
- `email` - Email
- `phone` - Téléphone
- `logo_url` - URL logo

#### `info_profile`
Profils sociaux des créateurs
- `id_plateforme` (PK) - ID unique du profil
- `id_w` (FK) - Référence au créateur
- `la_plateforme` - Nom de la plateforme
- `nbre_followers` - Nombre d'abonnés
- `nbre_follows` - Nombre d'abonnements

#### `info_poste`
Posts des créateurs
- `id_t_poste` (PK) - ID unique du post
- `id_w` (FK) - Référence au créateur
- `id_plateforme` (FK) - Référence au profil social
- `id_t_campagne` (FK) - Référence à la campagne (nullable)
- `titre_poste` - Titre du post
- `nbre_like`, `nbre_vue`, `nbre_commentaire`, `nbre_partage` - Métriques
- `is_validated` - Statut de validation admin
- `validated_at` - Date de validation

#### `campaigns`
Campagnes marketing
- `id_t_campagne` (PK) - ID unique campagne
- `id_w` (FK) - Référence à la marque
- `title` - Titre
- `budget` - Budget alloué
- `start_date`, `end_date` - Dates de campagne
- `assigned_creator_id` (FK) - Créateur assigné
- `creator_status` - Statut (pending/accepted/rejected)

#### `admin_logs`
Logs d'activité des admins
- `id` (PK) - ID unique
- `admin_id` - ID de l'admin
- `action` - Type d'action (CREATE/UPDATE/DELETE/VALIDATE_POST)
- `target_type` - Type de cible (post/campaign/user)
- `details` - Détails de l'action

### Schéma complet

 pour le schéma SQL complet avec toutes les contraintes et index.

---
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admin (
  id_w uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  role text DEFAULT 'admin'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT admin_pkey PRIMARY KEY (id_w),
  CONSTRAINT admin_id_w_fkey FOREIGN KEY (id_w) REFERENCES auth.users(id)
);
CREATE TABLE public.admin_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_name text NOT NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  details text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.campaign_assistance_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL,
  brand_name text,
  brand_email text NOT NULL,
  brand_phone text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])),
  assigned_to uuid,
  notes text,
  requested_at timestamp with time zone DEFAULT now(),
  contacted_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaign_assistance_requests_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_assistance_requests_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES auth.users(id),
  CONSTRAINT campaign_assistance_requests_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id)
);
CREATE TABLE public.campaign_drafts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  brand_id uuid NOT NULL,
  pack_id text NOT NULL,
  pack_name text NOT NULL,
  budget numeric NOT NULL,
  original_price numeric,
  duration_days integer NOT NULL,
  expected_posts integer NOT NULL,
  expected_creators integer NOT NULL,
  format text,
  has_videos boolean DEFAULT false,
  has_reporting boolean DEFAULT false,
  has_image_rights boolean DEFAULT false,
  bonus text,
  status text DEFAULT 'draft'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT campaign_drafts_pkey PRIMARY KEY (id),
  CONSTRAINT fk_campaign_drafts_marque FOREIGN KEY (brand_id) REFERENCES public.marque(id_w)
);
CREATE TABLE public.campaign_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  creator_id uuid NOT NULL,
  brand_id uuid NOT NULL,
  notification_type text DEFAULT 'campaign_assigned'::text CHECK (notification_type = ANY (ARRAY['campaign_assigned'::text, 'campaign_updated'::text, 'campaign_cancelled'::text])),
  message text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  creator_phone text,
  CONSTRAINT campaign_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT campaign_notifications_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id_t_campagne),
  CONSTRAINT campaign_notifications_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.createur(id_w),
  CONSTRAINT campaign_notifications_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.marque(id_w)
);
CREATE TABLE public.campaigns (
  created_at timestamp with time zone DEFAULT now(),
  title text NOT NULL,
  objectives jsonb,
  interests jsonb,
  formats jsonb,
  start_date date NOT NULL,
  end_date date NOT NULL,
  age_min_cible integer DEFAULT 13,
  age_max_cible integer DEFAULT 80,
  country text NOT NULL,
  nb_publications integer NOT NULL,
  tone text NOT NULL,
  budget numeric NOT NULL,
  currency text DEFAULT 'CFA'::text,
  status text DEFAULT 'active'::text,
  id_w uuid NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  assigned_creator_id uuid,
  id_t_campagne uuid NOT NULL DEFAULT gen_random_uuid(),
  creator_status text CHECK (creator_status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text])),
  accepted_at timestamp with time zone,
  CONSTRAINT campaigns_pkey PRIMARY KEY (id_t_campagne),
  CONSTRAINT campaigns_marque_fkey FOREIGN KEY (id_w) REFERENCES public.marque(id_w)
);
CREATE TABLE public.createur (
  id_w uuid NOT NULL,
  full_name text,
  age integer,
  niche jsonb,
  role character varying DEFAULT 'creator'::character varying CHECK (role::text = ANY (ARRAY['creator'::text, 'admin'::text, 'autre_role'::text])),
  avatar_url text,
  phone text,
  email text,
  youtube_username text,
  instagram_username text,
  tiktok_username text,
  facebook_username text,
  snapchat_username text,
  twitter_username text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_socials jsonb DEFAULT '[]'::jsonb,
  CONSTRAINT createur_pkey PRIMARY KEY (id_w),
  CONSTRAINT createur_id_w_fkey FOREIGN KEY (id_w) REFERENCES auth.users(id)
);
CREATE TABLE public.document_campagns (
  id bigint NOT NULL DEFAULT nextval('documents_id_seq'::regclass),
  content text,
  metadata jsonb,
  embedding USER-DEFINED,
  CONSTRAINT document_campagns_pkey PRIMARY KEY (id)
);
CREATE TABLE public.document_createur (
  id bigint NOT NULL DEFAULT nextval('documents_id_seq'::regclass),
  content text,
  metadata jsonb,
  embedding USER-DEFINED,
  CONSTRAINT document_createur_pkey PRIMARY KEY (id)
);
CREATE TABLE public.document_info_poste (
  id bigint NOT NULL DEFAULT nextval('documents_id_seq'::regclass),
  content text,
  metadata jsonb,
  embedding USER-DEFINED,
  CONSTRAINT document_info_poste_pkey PRIMARY KEY (id)
);
CREATE TABLE public.document_info_profile (
  id bigint NOT NULL DEFAULT nextval('documents_id_seq'::regclass),
  content text,
  metadata jsonb,
  embedding USER-DEFINED,
  CONSTRAINT document_info_profile_pkey PRIMARY KEY (id)
);
CREATE TABLE public.document_marque (
  id bigint NOT NULL DEFAULT nextval('documents_id_seq'::regclass),
  content text,
  metadata jsonb,
  embedding USER-DEFINED,
  CONSTRAINT document_marque_pkey PRIMARY KEY (id)
);
CREATE TABLE public.info_poste (
  id_w uuid NOT NULL DEFAULT gen_random_uuid(),
  id_plateforme text,
  url_poste character varying,
  titre_poste character varying,
  type_poste text,
  nbre_like double precision,
  nbre_commentaire double precision,
  nbre_partage double precision,
  nbre_vue double precision,
  date_poste timestamp without time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id_poste bigint,
  id_t_poste uuid NOT NULL DEFAULT gen_random_uuid(),
  local_media_url character varying,
  thumbnail_url text,
  media_status text DEFAULT 'pending'::text CHECK (media_status = ANY (ARRAY['pending'::text, 'processing'::text, 'ready'::text, 'failed'::text])),
  file_size_bytes bigint,
  media_width integer,
  media_height integer,
  duration_seconds integer,
  mime_type text,
  media_downloaded_at timestamp with time zone,
  last_sync_attempt timestamp with time zone,
  sync_error_message text,
  id_t_campagne uuid,
  is_validated boolean DEFAULT false,
  validated_at timestamp with time zone,
  CONSTRAINT info_poste_pkey PRIMARY KEY (id_t_poste),
  CONSTRAINT info_poste_id_t_campagne_fkey FOREIGN KEY (id_t_campagne) REFERENCES public.campaigns(id_t_campagne)
);
CREATE TABLE public.info_profile (
  id_plateforme text,
  nom_plateforme character varying,
  nom_complet character varying,
  biographie text,
  url_photo_profile character varying,
  nbre_followers double precision,
  nbre_follows double precision,
  nbre_poste double precision,
  la_plateforme text,
  date_ajout timestamp with time zone NOT NULL DEFAULT now(),
  id_w uuid NOT NULL,
  id_t_profile uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT info_profile_pkey PRIMARY KEY (id_t_profile)
);
CREATE TABLE public.marque (
  id_w uuid NOT NULL DEFAULT gen_random_uuid(),
  nom_marque text,
  site_web character varying,
  telephone_marque double precision,
  domaine text,
  email_professionnel text,
  telephone_contact text,
  email_marque text,
  fonction_contact text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nom_contact text,
  role text,
  CONSTRAINT marque_pkey PRIMARY KEY (id_w),
  CONSTRAINT marque_id_w_fkey FOREIGN KEY (id_w) REFERENCES auth.users(id)
);
CREATE TABLE public.n8n_chat_histories (
  id integer NOT NULL DEFAULT nextval('n8n_chat_histories_id_seq'::regclass),
  session_id character varying NOT NULL,
  message jsonb NOT NULL,
  CONSTRAINT n8n_chat_histories_pkey PRIMARY KEY (id)
);

## 🔐 Authentification

### Workflow d'authentification

1. **Inscription** :
   - Créateur : Email + mot de passe → Création profil `createur`
   - Marque : Email + mot de passe → Création profil `marque`

2. **Connexion** :
   - Supabase Auth avec session JWT
   - Redirection vers dashboard approprié selon le rôle

3. **Sécurité** :
   - Row Level Security (RLS) sur toutes les tables
   - Sessions sécurisées avec refresh tokens
   - HTTPS obligatoire en production

### Rôles et permissions

| Rôle | Permissions |
|------|-------------|
| **Créateur** | Lecture/écriture ses propres données, lecture campagnes assignées |
| **Marque** | Lecture/écriture ses campagnes, lecture créateurs assignés |
| **Admin** | Lecture/écriture complète, validation posts, logs |
| **Admin Principal** | Admin + gestion d'autres admins |

### Liens utiles

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)


