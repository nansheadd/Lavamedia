#!/usr/bin/env bash
set -euo pipefail

# Force the Stripe CLI to emit JSON (avoids jq parse errors when config defaults to text)
STRIPE() {
  stripe "$@" --format json 2>/tmp/stripe_last_error.log
}

# 1. Vérifie que la clé est présente
if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "Définis STRIPE_SECRET_KEY avant d’exécuter ce script." >&2
  exit 1
fi

echo "=== Création des produits Stripe ==="

# -------- Classique (Print + Digital) --------
CLASSIC_PRODUCT=$(stripe products create \
  --name "Lava Classique" \
  --description "Print + Digital — 4 numéros/an + accès illimité" \
  --metadata plan_slug=classic | tee /tmp/stripe_product_classic.json | jq -r '.id')

echo "Produit Classique -> ${CLASSIC_PRODUCT}"

STRIPE prices create \
  --product "${CLASSIC_PRODUCT}" \
  --unit-amount 450 \
  --currency eur \
  --recurring interval=month \
  --metadata plan_slug=classic interval=monthly | jq -r '.id' | xargs echo "Classique mensuel ->"

STRIPE prices create \
  --product "${CLASSIC_PRODUCT}" \
  --unit-amount 5000 \
  --currency eur \
  --recurring interval=year \
  --metadata plan_slug=classic interval=annual | jq -r '.id' | xargs echo "Classique annuel ->"

# -------- Digital --------
DIGITAL_PRODUCT=$(STRIPE products create \
  --name "Lava Digital" \
  --description "Accès 100% numérique illimité" \
  --metadata plan_slug=digital | jq -r '.id')

echo "Produit Digital -> ${DIGITAL_PRODUCT}"

STRIPE prices create \
  --product "${DIGITAL_PRODUCT}" \
  --unit-amount 300 \
  --currency eur \
  --recurring interval=month \
  --metadata plan_slug=digital interval=monthly | jq -r '.id' | xargs echo "Digital mensuel ->"

STRIPE prices create \
  --product "${DIGITAL_PRODUCT}" \
  --unit-amount 3000 \
  --currency eur \
  --recurring interval=year \
  --metadata plan_slug=digital interval=annual | jq -r '.id' | xargs echo "Digital annuel ->"

# -------- Hauts revenus / Supporter --------
SUPPORTER_PRODUCT=$(STRIPE products create \
  --name "Lava Hauts revenus" \
  --description "Print + Digital + soutien aux enquêtes" \
  --metadata plan_slug=supporter | jq -r '.id')

echo "Produit Supporter -> ${SUPPORTER_PRODUCT}"

STRIPE prices create \
  --product "${SUPPORTER_PRODUCT}" \
  --unit-amount 750 \
  --currency eur \
  --recurring interval=month \
  --metadata plan_slug=supporter interval=monthly | jq -r '.id' | xargs echo "Supporter mensuel ->"

STRIPE prices create \
  --product "${SUPPORTER_PRODUCT}" \
  --unit-amount 8500 \
  --currency eur \
  --recurring interval=year \
  --metadata plan_slug=supporter interval=annual | jq -r '.id' | xargs echo "Supporter annuel ->"

echo "=== Terminé ==="
