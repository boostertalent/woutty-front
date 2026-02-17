# 📋 GUIDE DE CONFIGURATION SUPABASE - WOUTTY PLATFORM

## 🎯 OBJECTIF

Ce guide vous explique toutes les configurations nécessaires dans Supabase pour que l'application Woutty-front soit **100% opérationnelle**.

---

## 🔧 ÉTAPE 1 : CRÉATION DU PROJET SUPABASE

### 1.1 Créer un nouveau projet
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous avec votre compte GitHub
3. Cliquez sur **"New Project"**
4. Nommez votre projet : `woutty-platform`
5. Choisissez une région proche de vos utilisateurs (ex: `Europe West`)
6. Créez une base de données avec mot de passe fort

### 1.2 Obtenir les clés d'API
Une fois le projet créé, récupérez :
- **Project URL** : `https://xxx.supabase.co`
- **Anon Public Key** : `eyJhbGciOi...`
- **Service Role Key** : `eyJhbGciOi...` (à garder secrète)

---

## 🗄️ ÉTAPE 2 : STRUCTURE DE LA BASE DE DONNÉES

### 2.1 Tables requises

#### Table `createur` (Créateurs)
```sql
CREATE TABLE createur (
  id_w UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  age INTEGER,
  niche TEXT[],
  avatar_url TEXT,
  instagram_username TEXT,
  youtube_username TEXT,
  tiktok_username TEXT,
  twitter_username TEXT,
  facebook_username TEXT,
  snapchat_username TEXT,
  instagram_followers BIGINT DEFAULT 0,
  youtube_followers BIGINT DEFAULT 0,
  tiktok_followers BIGINT DEFAULT 0,
  role TEXT DEFAULT 'creator',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimisation
CREATE INDEX idx_createur_email ON createur(email);
CREATE INDEX idx_createur_role ON createur(role);
```

#### Table `marque` (Marques/Entreprises)
```sql
CREATE TABLE marque (
  id_w UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom_marque TEXT NOT NULL,
  email_marque TEXT NOT NULL,
  telephone_marque TEXT,
  domaine TEXT,
  site_web TEXT,
  nom_contact TEXT,
  fonction_contact TEXT,
  email_professionnel TEXT,
  telephone_contact TEXT,
  role TEXT DEFAULT 'brand',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimisation
CREATE INDEX idx_marque_email ON marque(email_marque);
CREATE INDEX idx_marque_role ON marque(role);
```

#### Table `admin` (Administrateurs)
```sql
CREATE TABLE admin (
  id_w UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimisation
CREATE INDEX idx_admin_email ON admin(email);
```

#### Table `campaigns` (Campagnes)
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_t_campagne UUID UNIQUE DEFAULT gen_random_uuid(),
  id_w UUID REFERENCES marque(id_w) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  niche TEXT[],
  status TEXT DEFAULT 'draft',
  assigned_creator_id UUID REFERENCES createur(id_w) ON DELETE SET NULL,
  creator_status TEXT DEFAULT 'pending',
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimisation
CREATE INDEX idx_campaigns_brand ON campaigns(id_w);
CREATE INDEX idx_campaigns_creator ON campaigns(assigned_creator_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
```

#### Table `info_profile` (Profils réseaux sociaux)
```sql
CREATE TABLE info_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_w UUID REFERENCES createur(id_w) ON DELETE CASCADE,
  id_plateforme UUID,
  la_plateforme TEXT,
  nom_plateforme TEXT,
  nbre_followers BIGINT DEFAULT 0,
  nbre_follows BIGINT DEFAULT 0,
  nbre_poste INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimisation
CREATE INDEX idx_profile_creator ON info_profile(id_w);
```

#### Table `info_poste` (Posts des créateurs)
```sql
CREATE TABLE info_poste (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_w UUID REFERENCES createur(id_w) ON DELETE CASCADE,
  id_plateforme UUID REFERENCES info_profile(id_plateforme) ON DELETE CASCADE,
  titre_poste TEXT,
  url_poste TEXT,
  type_poste TEXT,
  date_poste TIMESTAMP WITH TIME ZONE,
  nbre_like INTEGER DEFAULT 0,
  nbre_commentaire INTEGER DEFAULT 0,
  nbre_vue BIGINT DEFAULT 0,
  nbre_partage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimisation
CREATE INDEX idx_poste_creator ON info_poste(id_w);
CREATE INDEX idx_poste_date ON info_poste(date_poste);
```

#### Table `admin_logs` (Logs d'activité)
```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT,
  admin_name TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimisation
CREATE INDEX idx_logs_admin ON admin_logs(admin_id);
CREATE INDEX idx_logs_date ON admin_logs(created_at);
```

---

## 🔐 ÉTAPE 3 : CONFIGURATION RLS (ROW LEVEL SECURITY)

### 3.1 Activer RLS sur toutes les tables
```sql
-- Activer RLS
ALTER TABLE createur ENABLE ROW LEVEL SECURITY;
ALTER TABLE marque ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_poste ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
```

### 3.2 Politiques RLS

#### Pour la table `createur`
```sql
-- Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON createur
  FOR SELECT USING (auth.uid() = id_w);

-- Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert own profile" ON createur
  FOR INSERT WITH CHECK (auth.uid() = id_w);

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile" ON createur
  FOR UPDATE USING (auth.uid() = id_w);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all creators" ON createur
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin 
      WHERE admin.id_w = auth.uid()
    )
  );

-- Les admins peuvent tout modifier
CREATE POLICY "Admins can update all creators" ON createur
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin 
      WHERE admin.id_w = auth.uid()
    )
  );
```

#### Pour la table `marque`
```sql
-- Les marques peuvent voir leur propre profil
CREATE POLICY "Brands can view own profile" ON marque
  FOR SELECT USING (auth.uid() = id_w);

-- Les marques peuvent insérer leur propre profil
CREATE POLICY "Brands can insert own profile" ON marque
  FOR INSERT WITH CHECK (auth.uid() = id_w);

-- Les marques peuvent modifier leur propre profil
CREATE POLICY "Brands can update own profile" ON marque
  FOR UPDATE USING (auth.uid() = id_w);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all brands" ON marque
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin 
      WHERE admin.id_w = auth.uid()
    )
  );

-- Les admins peuvent tout modifier
CREATE POLICY "Admins can update all brands" ON marque
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin 
      WHERE admin.id_w = auth.uid()
    )
  );
```

#### Pour la table `campaigns`
```sql
-- Les marques peuvent voir leurs campagnes
CREATE POLICY "Brands can view own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = id_w);

-- Les marques peuvent créer des campagnes
CREATE POLICY "Brands can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = id_w);

-- Les marques peuvent modifier leurs campagnes
CREATE POLICY "Brands can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = id_w);

-- Les créateurs peuvent voir les campagnes qui leur sont assignées
CREATE POLICY "Creators can view assigned campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = assigned_creator_id);

-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all campaigns" ON campaigns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin 
      WHERE admin.id_w = auth.uid()
    )
  );
```

---

## 📁 ÉTAPE 4 : CONFIGURATION STORAGE

### 4.1 Créer les buckets nécessaires

#### Bucket `creator-avatars` (pour les avatars des créateurs)
1. Allez dans **Storage** → **Buckets**
2. Créez un bucket nommé `creator-avatars`
3. **Policy** : `Authenticated` (seuls les utilisateurs connectés peuvent uploader)
4. **File size limit** : `5MB`

#### Bucket `brand-logos` (pour les logos des marques)
1. Créez un bucket nommé `brand-logos`
2. **Policy** : `Authenticated`
3. **File size limit** : `5MB`

---

## 🔑 ÉTAPE 5 : VARIABLES D'ENVIRONNEMENT

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_publique

# Configuration Webhook N8N (optionnel)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://votre-webhook.n8n.cloud/webhook-test
```

---

## 🧪 ÉTAPE 6 : TEST DE CONNEXION

### 6.1 Test de l'application
```bash
npm run dev
```

### 6.2 Vérifier la connexion
1. Accédez à `http://localhost:3000`
2. Cliquez sur "Commencer maintenant"
3. Créez un compte créateur ou marque
4. Vérifiez que les données sont bien sauvegardées dans Supabase

### 6.3 Test des permissions
1. Connectez-vous en tant que créateur
2. Vérifiez que vous ne voyez que vos données
3. Essayez d'accéder à une autre URL (ex: `/admin/dashboard`) - vous devriez être redirigé

---

## ⚙️ ÉTAPE 7 : CONFIGURATION AVANCÉE

### 7.1 Triggers SQL (optionnel)
Pour créer automatiquement un profil lors de l'inscription :

```sql
-- Trigger pour créer un profil créateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer dans la table createur avec le rôle par défaut
  INSERT INTO createur (id_w, email, role)
  VALUES (NEW.id, NEW.email, 'creator');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 7.2 Fonctions SQL utiles
```sql
-- Fonction pour vérifier si un utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin 
    WHERE admin.id_w = user_id
  );
END;
$$ LANGUAGE plpgsql;
```

---

## 🔍 ÉTAPE 8 : VÉRIFICATION FINALE

### 8.1 Checklist de validation
- [ ] Tables créées avec la bonne structure
- [ ] Index configurés pour les performances
- [ ] RLS activé sur toutes les tables
- [ ] Politiques RLS correctement configurées
- [ ] Buckets Storage créés
- [ ] Variables d'environnement configurées
- [ ] Test d'inscription réussi
- [ ] Test de connexion réussi
- [ ] Permissions correctement appliquées

### 8.2 Tests manuels recommandés
1. **Inscription créateur** → Vérifier dans la table `createur`
2. **Inscription marque** → Vérifier dans la table `marque`
3. **Création campagne** → Vérifier dans la table `campaigns`
4. **Upload avatar** → Vérifier dans le bucket `creator-avatars`
5. **Logs admin** → Vérifier dans la table `admin_logs`

---

## 🚨 DÉPANNAGE COMMUN

### Problèmes fréquents
1. **"Permission denied"** : Vérifiez les politiques RLS
2. **"Table not found"** : Vérifiez que la table existe bien
3. **"Storage bucket not found"** : Vérifiez le nom du bucket
4. **"Invalid JWT"** : Vérifiez les clés Supabase

### Commandes SQL utiles
```sql
-- Vérifier les tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- Vérifier les buckets
SELECT bucket_id, name, public, avif_extension
FROM storage.buckets;
```

---

## 📞 SUPPORT

Si vous rencontrez des problèmes :
1. Vérifiez ce guide étape par étape
2. Consultez la documentation Supabase
3. Contactez le support technique Woutty

**Une fois ces configurations terminées, votre application Woutty sera 100% opérationnelle !** 🎉

---

*Dernière mise à jour : Février 2026*
