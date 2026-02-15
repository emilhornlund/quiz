#!/usr/bin/env bash
set -e

CURRENT_DATE=$(date +%Y-%m-%d)

DUMP_ROOT_DIR="/home/emilhornlund/dumps"
PROD_DUMP_DIR="$DUMP_ROOT_DIR/klurigo_prod-$CURRENT_DATE"
MIGRATION_OUT_DIR="$DUMP_ROOT_DIR/klurigo_migrated"
KLURIGO_PROJECT_DIR="/home/emilhornlund/projects/klurigo"

MONGODB_HOST="192.168.50.99"
MONGODB_PORT="27017"

MONGODB_KLURIGO_PROD_DB="klurigo_prod"
MONGODB_KLURIGO_BETA_DB="klurigo_beta"

# shellcheck disable=SC2034
MONGODB_KLURIGO_LOCAL_URI="mongodb://127.0.0.1:27017/klurigo_service"
# shellcheck disable=SC2034
MONGODB_KLURIGO_PROD_URI="mongodb://$KLURIGO_PROD_USERNAME:$KLURIGO_PROD_PASSWORD@$MONGODB_HOST:$MONGODB_PORT/$MONGODB_KLURIGO_PROD_DB"
# shellcheck disable=SC2034
MONGODB_KLURIGO_BETA_URI="mongodb://$KLURIGO_BETA_USERNAME:$KLURIGO_BETA_PASSWORD@$MONGODB_HOST:$MONGODB_PORT/$MONGODB_KLURIGO_BETA_DB"

confirm_or_exit() {
  read -r -p "$1 [Y/n]: " response
  if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
}

# 1) dump prod
confirm_or_exit "Step 1: Dump production database to $PROD_DUMP_DIR?"
mongodump --uri="$MONGODB_KLURIGO_PROD_URI" --out="$PROD_DUMP_DIR"

# 2) remove existing migrated data directory
confirm_or_exit "Step 2: Remove existing migration output directory $MIGRATION_OUT_DIR?"
rm -rf "$MIGRATION_OUT_DIR"

# 3) migrate data
confirm_or_exit "Step 3: Run mongodb-migrator?"
cd "$KLURIGO_PROJECT_DIR"
yarn workspace mongodb-migrator run start \
  --inputDir "$PROD_DUMP_DIR/$MONGODB_KLURIGO_PROD_DB" \
  --outputDir "$MIGRATION_OUT_DIR"

# 4) restore local
confirm_or_exit "Step 4: Restore LOCAL database?"
mongorestore --uri="$MONGODB_KLURIGO_LOCAL_URI" --drop "$MIGRATION_OUT_DIR"

# 5) restore beta
confirm_or_exit "Step 5: Restore BETA database?"
mongorestore --uri="$MONGODB_KLURIGO_BETA_URI" --drop "$MIGRATION_OUT_DIR"

# 6) restore prod
confirm_or_exit "Step 6: Restore PROD database?"
mongorestore --uri="$MONGODB_KLURIGO_PROD_URI" --drop "$MIGRATION_OUT_DIR"

echo "Done."
