#!/bin/bash

echo "🔥 Firebase Storage Rules Deployment Script"
echo "==========================================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed."
    echo "📦 Install it with: npm install -g firebase-tools"
    echo "📋 Or visit: https://firebase.google.com/docs/cli"
    exit 1
fi

echo "✅ Firebase CLI detected"

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔑 Please log in to Firebase:"
    firebase login
fi

echo "📋 Current Firebase projects:"
firebase projects:list

echo ""
echo "🎯 Setting project to: ecommerce-store---fiverr-gig"
firebase use ecommerce-store---fiverr-gig

echo ""
echo "📤 Deploying Storage rules from storage.rules file..."
firebase deploy --only storage

echo ""
echo "✅ Storage rules deployed successfully!"
echo "🔗 You can verify at: https://console.firebase.google.com/project/ecommerce-store---fiverr-gig/storage/rules"

echo ""
echo "🧪 Test your image upload now in the admin panel!"
echo "📍 Go to: http://localhost:5173/admin/products"