# Ecommerce Store Cloud Functions

This folder contains Firebase Cloud Functions for the Ecommerce Store demo, including the demo data reset endpoint.

## Setup

1. Install dependencies:
   ```
   cd functions
   npm install
   ```
2. Deploy functions:
   ```
   firebase deploy --only functions
   ```

## Functions

- **resetDemoData**: Resets demo data (products, orders, settings) for safe portfolio use.

## Local Development
- Copy `.env.example` to `.env` and fill in your Firebase config if needed.
