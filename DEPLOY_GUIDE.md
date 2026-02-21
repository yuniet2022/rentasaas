# 🚀 Guía de Deploy - LiftyLife SaaS

## Despliegue Paso a Paso

---

## PARTE 1: Backend en Railway

### 1.1 Crear cuenta en Railway
1. Ve a https://railway.app
2. Regístrate con GitHub
3. Verifica tu email

### 1.2 Crear proyecto
1. Click en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Conecta tu repositorio (o sube el código)

### 1.3 Agregar PostgreSQL
1. En el proyecto, click "New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Espera a que se cree (toma ~1 minuto)

### 1.4 Configurar Variables de Entorno

Ve a tu servicio backend → "Variables" → "New Variable"

```
# Database (Railway genera estas automáticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
PGDATABASE=${{Postgres.PGDATABASE}}

# JWT Secret (genera uno seguro)
JWT_SECRET=tu_jwt_secret_aqui_minimo_32_caracteres

# Encryption Key (genera con: openssl rand -hex 32)
ENCRYPTION_KEY=tu_clave_de_32_bytes_hex_aqui

# Stripe (opcional - solo si vas a usar)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal (opcional)
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_client_secret
PAYPAL_MODE=sandbox

# WebPay Chile (opcional)
WEBPAY_ENABLED=false
WEBPAY_COMMERCE_CODE=597055555532
WEBPAY_API_KEY=579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C
WEBPAY_ENVIRONMENT=integration

# Frontend URL (actualiza después de deployar Vercel)
FRONTEND_URL=https://tu-frontend.vercel.app
PORT=3001
```

### 1.5 Deploy Backend
1. Railway detectará automáticamente el `railway.toml`
2. Click "Deploy"
3. Espera ~2-3 minutos
4. Copia la URL generada (ej: `https://liftylife-api.up.railway.app`)

### 1.6 Crear Base de Datos
```bash
# Conecta a tu base de datos Railway
# Ve a tu PostgreSQL en Railway → "Connect" → "Public Network"
# Copia el comando de conexión

# Ejecuta el script SQL
psql "postgresql://usuario:password@host:puerto/railway" -f backend/database.sql
```

---

## PARTE 2: Frontend en Vercel

### 2.1 Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Regístrate con GitHub
3. Verifica tu email

### 2.2 Importar Proyecto
1. Click "Add New Project"
2. Importa tu repositorio GitHub
3. Selecciona el directorio `/app`

### 2.3 Configurar Variables de Entorno

En Vercel → Project Settings → Environment Variables:

```
VITE_API_URL=https://tu-railway-url.up.railway.app/api
```

(Reemplaza con tu URL de Railway)

### 2.4 Deploy Frontend
1. Click "Deploy"
2. Espera ~2 minutos
3. Copia la URL (ej: `https://liftylife.vercel.app`)

---

## PARTE 3: Configuración Post-Deploy

### 3.1 Actualizar CORS en Backend

Ve a Railway → Variables → Agrega/Actualiza:
```
FRONTEND_URL=https://tu-frontend.vercel.app
```

Redeploy el backend.

### 3.2 Configurar Dominio Personalizado (Opcional)

#### Para Vercel:
1. Ve a Project Settings → Domains
2. Agrega tu dominio
3. Sigue las instrucciones de DNS

#### Para Railway:
1. Ve a Settings → Domains
2. Agrega tu dominio
3. Configura el DNS en tu proveedor

---

## PARTE 4: Acceso Super Admin

Después del deploy, accede a:
```
https://tu-frontend.vercel.app/super-admin
```

Login con credenciales de admin (las creaste en la base de datos).

---

## 📋 Checklist Pre-Deploy

- [ ] Backend compila localmente: `cd backend && npm install && npm start`
- [ ] Frontend compila localmente: `cd app && npm install && npm run build`
- [ ] Variables de entorno configuradas en Railway
- [ ] Base de datos creada con `database.sql`
- [ ] URL de Railway copiada para Vercel

---

## 🔧 Troubleshooting

### Error CORS
Asegúrate que `FRONTEND_URL` en Railway coincida exactamente con tu URL de Vercel (incluyendo `https://`)

### Error de conexión a DB
Verifica que las variables de PostgreSQL estén correctamente vinculadas en Railway

### Build falla en Vercel
Revisa que el `dist` folder se genere correctamente al correr `npm run build`

---

## 💰 Costos Estimados

| Servicio | Costo Mensual |
|----------|---------------|
| Railway (Starter) | $5 |
| Railway PostgreSQL | Incluido |
| Vercel (Hobby) | Gratis |
| **Total** | **$5/mes** |

Para producción con más tráfico:
- Railway Pro: $20/mes
- Vercel Pro: $20/mes
- **Total: $40/mes**
