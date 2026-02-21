# 📤 Subir Código a GitHub

## OPCIÓN 1: Usando GitHub Web (Más fácil)

### Paso 1: Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `liftylife-saas`
3. Descripción: "SaaS de gestión de alquileres vacacionales"
4. Público o Privado (tu elección)
5. **NO** marques "Add a README"
6. Click "Create repository"

### Paso 2: Subir archivos por web
1. En tu nuevo repo, click "uploading an existing file"
2. Arrastra las carpetas `app/` y `backend/` + archivos sueltos
3. Escribe mensaje: "Initial commit - LiftyLife SaaS"
4. Click "Commit changes"

---

## OPCIÓN 2: Usando Git CLI (Recomendado)

### Paso 1: Instalar Git (si no lo tienes)
```bash
# Windows: https://git-scm.com/download/win
# Mac: brew install git
# Linux: sudo apt install git
```

### Paso 2: Configurar Git (primera vez)
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Paso 3: Crear repositorio y subir
```bash
# 1. Entra a la carpeta del proyecto
cd /ruta/a/liftylife

# 2. Inicializa git
git init

# 3. Agrega todos los archivos
git add .

# 4. Crea el primer commit
git commit -m "Initial commit - LiftyLife SaaS"

# 5. Conecta con GitHub (reemplaza TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/liftylife-saas.git

# 6. Sube el código
git push -u origin main
```

---

## 📁 Estructura que debe quedar en GitHub

```
liftylife-saas/
├── 📁 app/                    # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 pages/
│   │   ├── 📁 sections/
│   │   ├── 📁 components/
│   │   ├── 📁 contexts/
│   │   ├── 📁 services/
│   │   └── 📁 types/
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── 📁 backend/                # Backend Node.js
│   ├── server.js
│   ├── database.sql
│   ├── package.json
│   ├── db.js
│   └── railway.toml
│
├── 📄 .gitignore
├── 📄 README.md
├── 📄 DEPLOY_GUIDE.md
└── 📄 deploy.sh
```

---

## ⚠️ IMPORTANTE: No subir estos archivos

El `.gitignore` ya los excluye:
- ❌ `node_modules/` (carpetas grandes)
- ❌ `.env` (variables secretas)
- ❌ `dist/` o `build/` (se generan al compilar)
- ❌ Archivos de logs

---

## ✅ Verificar que subió bien

Después de subir, entra a tu repo en GitHub y verifica:
1. ✅ Carpeta `app/` existe con contenido
2. ✅ Carpeta `backend/` existe con contenido
3. ✅ Archivos sueltos (README.md, etc.)
4. ✅ NO hay carpeta `node_modules/`

---

## 🔗 Conectar con Railway y Vercel

### Railway (Backend)
1. Ve a https://railway.app
2. New Project → Deploy from GitHub repo
3. Selecciona `liftylife-saas`
4. Selecciona carpeta `backend/`
5. Deploy automático

### Vercel (Frontend)
1. Ve a https://vercel.com
2. Add New Project → Import Git Repository
3. Selecciona `liftylife-saas`
4. Root Directory: `app/`
5. Deploy

---

## 🆘 Si tienes problemas

### Error: "fatal: not a git repository"
```bash
# Solución: Estás en la carpeta equivocada
cd /ruta/correcta/a/liftylife
```

### Error: "Permission denied"
```bash
# Solución: Configura tu usuario de Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Error: "failed to push"
```bash
# Solución: Forzar push (solo primera vez)
git push -u origin main --force
```

---

## 📞 ¿Necesitas ayuda?

Si tienes algún error, copia el mensaje completo y te ayudo.
