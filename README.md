# 🏠 LiftyLife - SaaS de Gestión de Alquileres Vacacionales

Sistema completo multi-tenant para gestión de propiedades de alquiler vacacional.

## 🚀 Deploy Rápido (5 minutos)

### 1. Backend - Railway
```bash
cd backend
npm install
# Sube a GitHub y conecta con Railway
```

Variables de entorno en Railway:
- `DATABASE_URL` (PostgreSQL de Railway)
- `JWT_SECRET` (genera uno seguro)
- `ENCRYPTION_KEY` (genera con `openssl rand -hex 32`)
- `FRONTEND_URL` (URL de Vercel)

### 2. Frontend - Vercel
```bash
cd app
npm install
npm run build
# Sube a GitHub y conecta con Vercel
```

Variable de entorno en Vercel:
- `VITE_API_URL` (URL de Railway + /api)

### 3. Base de Datos
```bash
psql $DATABASE_URL -f backend/database.sql
```

## 📁 Estructura del Proyecto

```
/
├── backend/           # API Node.js + Express
│   ├── server.js      # Servidor principal
│   ├── database.sql   # Esquema de BD
│   └── railway.toml   # Config Railway
│
├── app/               # Frontend React + Vite
│   ├── src/
│   │   ├── pages/     # Páginas (Home, Dashboard, etc.)
│   │   ├── sections/  # Componentes de sección
│   │   └── services/  # API services
│   └── vercel.json    # Config Vercel
│
└── DEPLOY_GUIDE.md    # Guía completa
```

## 🎯 Funcionalidades

### Para Clientes (Tenants)
- ✅ Website personalizado con dominio propio
- ✅ Gestión de propiedades (CRUD)
- ✅ Sistema de reservas con calendario
- ✅ Gestión de limpieza y personal
- ✅ Insumos y gastos por propiedad
- ✅ Pasarelas de pago: Stripe, PayPal, WebPay (Chile)
- ✅ Integración Booking.com

### Para Super Admin
- ✅ Panel de control con métricas
- ✅ Aprobación de nuevos clientes
- ✅ Gestión de suscripciones
- ✅ Suspensión/Reactivación de cuentas

## 💳 Planes de Precios

| Plan | Precio | Propiedades |
|------|--------|-------------|
| Starter | $49/mes | 5 |
| Professional | $79/mes | 15 |
| Enterprise | $149/mes | Ilimitado |

## 🛠️ Tecnologías

- **Backend**: Node.js, Express, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Deploy**: Railway (backend), Vercel (frontend)
- **Pagos**: Stripe, PayPal, WebPay (Transbank)

## 📞 Soporte

Para soporte o preguntas, contacta a: soporte@liftylife.com

---

**Desplegado con ❤️ para Rylax y futuros clientes**
