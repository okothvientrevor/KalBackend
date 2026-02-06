#!/bin/bash

# Firebase Storage CORS Configuration Script
# This script helps you apply CORS configuration to your Firebase Storage bucket

echo "🔥 Firebase Storage CORS Configuration Helper"
echo "=============================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK (gcloud) is not installed."
    echo ""
    echo "Please install it first:"
    echo "  macOS: brew install --cask google-cloud-sdk"
    echo "  Or visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo "✅ Google Cloud SDK is installed"
echo ""

# Get project ID
echo "📋 Step 1: Firebase Project Configuration"
echo "----------------------------------------"
read -p "Enter your Firebase Project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID is required!"
    exit 1
fi

# Get storage bucket
echo ""
read -p "Enter your Storage Bucket name (e.g., project-id.appspot.com): " STORAGE_BUCKET

if [ -z "$STORAGE_BUCKET" ]; then
    echo "❌ Storage Bucket name is required!"
    exit 1
fi

# Confirm
echo ""
echo "📝 Configuration Summary:"
echo "  Project ID: $PROJECT_ID"
echo "  Storage Bucket: $STORAGE_BUCKET"
echo ""
read -p "Is this correct? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "❌ Configuration cancelled"
    exit 1
fi

# Authenticate
echo ""
echo "🔐 Step 2: Authentication"
echo "------------------------"
echo "Opening browser for authentication..."
gcloud auth login

if [ $? -ne 0 ]; then
    echo "❌ Authentication failed!"
    exit 1
fi

echo "✅ Authentication successful"

# Set project
echo ""
echo "🎯 Step 3: Setting Project"
echo "-------------------------"
gcloud config set project $PROJECT_ID

if [ $? -ne 0 ]; then
    echo "❌ Failed to set project!"
    exit 1
fi

echo "✅ Project set successfully"

# Apply CORS configuration
echo ""
echo "📦 Step 4: Applying CORS Configuration"
echo "--------------------------------------"
echo "Applying CORS configuration from cors.json..."

if [ ! -f "cors.json" ]; then
    echo "❌ cors.json file not found!"
    echo "Please make sure you're running this script from the project root directory."
    exit 1
fi

gcloud storage buckets update gs://$STORAGE_BUCKET --cors-file=cors.json

if [ $? -ne 0 ]; then
    echo "❌ Failed to apply CORS configuration!"
    echo ""
    echo "Trying alternative method with gsutil..."
    gsutil cors set cors.json gs://$STORAGE_BUCKET
    
    if [ $? -ne 0 ]; then
        echo "❌ Both methods failed!"
        echo "Please check:"
        echo "  1. Storage bucket name is correct"
        echo "  2. You have permission to modify the bucket"
        echo "  3. Firebase Storage is initialized for your project"
        exit 1
    fi
fi

echo "✅ CORS configuration applied successfully!"

# Verify
echo ""
echo "🔍 Step 5: Verification"
echo "----------------------"
echo "Verifying CORS configuration..."
gsutil cors get gs://$STORAGE_BUCKET

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ CORS configuration verified!"
else
    echo "⚠️  Could not verify CORS configuration"
fi

# Final message
echo ""
echo "🎉 All done!"
echo "==========="
echo ""
echo "Next steps:"
echo "  1. Restart your development server"
echo "  2. Try uploading a file in your app"
echo "  3. Check browser console for any remaining errors"
echo ""
echo "If you still see CORS errors:"
echo "  1. Clear your browser cache"
echo "  2. Try a different browser"
echo "  3. Check Firebase Storage Security Rules"
echo ""
echo "For more help, see CORS_FIX_GUIDE.md"
