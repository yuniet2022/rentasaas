#!/bin/bash

# 🚀 Script para subir código a GitHub
# Uso: ./github-push.sh TU_USUARIO_GITHUB

echo "🚀 GitHub Push Script - LiftyLife SaaS"
echo "======================================="
echo ""

# Verificar argumento
if [ -z "$1" ]; then
    echo "❌ Error: Debes proporcionar tu usuario de GitHub"
    echo ""
    echo "Uso: ./github-push.sh TU_USUARIO_GITHUB"
    echo "Ejemplo: ./github-push.sh juanperez"
    exit 1
fi

GITHUB_USER=$1
REPO_NAME="liftylife-saas"

echo "📋 Configuración:"
echo "   Usuario GitHub: $GITHUB_USER"
echo "   Repositorio: $REPO_NAME"
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -d "app" ] || [ ! -d "backend" ]; then
    echo "❌ Error: No estás en la carpeta correcta"
    echo "   Asegúrate de estar en la carpeta que contiene 'app' y 'backend'"
    exit 1
fi

# Verificar si git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git no está instalado"
    echo "   Descarga desde: https://git-scm.com/downloads"
    exit 1
fi

echo "✅ Git detectado"
echo ""

# Configurar git si es necesario
GIT_NAME=$(git config --global user.name)
GIT_EMAIL=$(git config --global user.email)

if [ -z "$GIT_NAME" ]; then
    echo "⚙️  Configurando nombre de usuario de Git..."
    read -p "Ingresa tu nombre: " name
    git config --global user.name "$name"
fi

if [ -z "$GIT_EMAIL" ]; then
    echo "⚙️  Configurando email de Git..."
    read -p "Ingresa tu email: " email
    git config --global user.email "$email"
fi

echo ""
echo "📦 Preparando archivos..."

# Inicializar repositorio si no existe
if [ ! -d ".git" ]; then
    echo "   → Inicializando repositorio git..."
    git init
    git branch -M main
else
    echo "   → Repositorio git ya existe"
fi

# Agregar archivos al .gitignore si no existe
if [ ! -f ".gitignore" ]; then
    echo "   → Creando .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Logs
*.log

# Editor
.vscode/
.idea/
.DS_Store

# Temporary files
.cache/
*.tmp
EOF
fi

echo ""
echo "📤 Agregando archivos a git..."
git add .

echo ""
echo "💾 Creando commit..."
git commit -m "Initial commit - LiftyLife SaaS Platform

Features:
- Multi-tenant SaaS architecture
- Property management (CRUD)
- Booking system with calendar
- Payment gateways (Stripe, PayPal, WebPay)
- Cleaning staff management
- Supplies tracking
- Super admin dashboard

Ready for deployment to Railway & Vercel"

echo ""
echo "🔗 Conectando con GitHub..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo "🚀 Subiendo código a GitHub..."
echo "   (Si te pide usuario/contraseña, usa tu token de GitHub)"
echo ""

if git push -u origin main; then
    echo ""
    echo "✅ ¡Código subido exitosamente!"
    echo ""
    echo "🔗 Tu repositorio: https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📋 Siguientes pasos:"
    echo "   1. Ve a https://github.com/$GITHUB_USER/$REPO_NAME"
    echo "   2. Verifica que todo se subió correctamente"
    echo "   3. Sigue la guía DEPLOY_GUIDE.md para deployar"
    echo ""
else
    echo ""
    echo "❌ Error al subir código"
    echo ""
    echo "Posibles soluciones:"
    echo "   1. Crea el repositorio primero en: https://github.com/new"
    echo "   2. Verifica tu usuario de GitHub: $GITHUB_USER"
    echo "   3. Si usas 2FA, necesitas un token de acceso personal"
    echo ""
    echo "Para crear un token:"
    echo "   https://github.com/settings/tokens"
fi
