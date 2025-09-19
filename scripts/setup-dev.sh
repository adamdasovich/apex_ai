### **4. Create Setup Script**

```bash
# scripts/setup-dev.sh
#!/bin/bash

echo "🚀 Setting up Mining AI Platform development environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Setup backend
echo "📦 Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    cp ../.env.example .env
    echo "⚠️  Please update .env with your configuration"
fi

# Run migrations
python manage.py migrate

# Create superuser
echo "Creating Django superuser..."
python manage.py createsuperuser

cd ..

# Setup frontend
echo "📦 Setting up frontend..."
cd frontend
npm install

cd ..

# Setup smart contracts
echo "📦 Setting up smart contracts..."
cd contracts
npm install

cd ..

echo "✅ Setup complete!"
echo "🚀 Start development with: docker-compose up"
echo "   Or manually:"
echo "   Backend: cd backend && python manage.py runserver"
echo "   Frontend: cd frontend && npm run dev"