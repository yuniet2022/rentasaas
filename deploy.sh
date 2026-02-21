#!/bin/bash

# 🚀 Script de Deploy - LiftyLife SaaS
# Uso: ./deploy.sh [backend|frontend|all]

echo "🚀 LiftyLife Deploy Script"
echo "=========================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones
deploy_backend() {
    echo -e "${YELLOW}📦 Deploying Backend to Railway...${NC}"
    cd backend
    
    # Verificar railway CLI
    if ! command -v railway &> /dev/null; then
        echo -e "${RED}❌ Railway CLI no instalado${NC}"
        echo "Instala con: npm install -g @railway/cli"
        exit 1
    fi
    
    # Login a Railway (si es necesario)
    railway login
    
    # Link proyecto (si no está linkeado)
    railway link
    
    # Deploy
    railway up
    
    echo -e "${GREEN}✅ Backend deployado!${NC}"
    echo -e "${YELLOW}📝 Copia la URL de Railway para configurar en Vercel${NC}"
    
    cd ..
}

deploy_frontend() {
    echo -e "${YELLOW}🎨 Deploying Frontend to Vercel...${NC}"
    cd app
    
    # Verificar vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI no instalado${NC}"
        echo "Instala con: npm install -g vercel"
        exit 1
    fi
    
    # Build
    echo -e "${YELLOW}🔨 Building...${NC}"
    npm run build
    
    # Deploy
    vercel --prod
    
    echo -e "${GREEN}✅ Frontend deployado!${NC}"
    
    cd ..
}

# Menu
case "$1" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        echo ""
        read -p "⏳ Presiona ENTER cuando tengas la URL de Railway..."
        echo ""
        deploy_frontend
        ;;
    *)
        echo "Uso: ./deploy.sh [backend|frontend|all]"
        echo ""
        echo "Opciones:"
        echo "  backend  - Deploy solo backend a Railway"
        echo "  frontend - Deploy solo frontend a Vercel"
        echo "  all      - Deploy backend y frontend"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Deploy completado!${NC}"
