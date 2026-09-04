#!/usr/bin/env bash

# ==============================================================================
# JPTL Property Management Platform — Database Seeder & Purger Runner
# ==============================================================================

set -e

# Resolve repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVER_DIR="$ROOT_DIR/apps/server"

# Text styles
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
CYAN="\033[0;36m"
BOLD="\033[1m"
RESET="\033[0m"

usage() {
  echo -e "${BOLD}${CYAN}Usage:${RESET} $0 {seed|purge|reset}"
  echo ""
  echo -e "  ${GREEN}seed${RESET}   - Populate database with complete demo & test dataset across all 10 models"
  echo -e "  ${RED}purge${RESET}  - Safely delete all documents from all platform collections"
  echo -e "  ${YELLOW}reset${RESET}  - Purge existing records and re-seed fresh records (equivalent to purge + seed)"
  echo ""
  exit 1
}

if [ $# -lt 1 ]; then
  usage
fi

COMMAND="$1"

case "$COMMAND" in
  seed)
    echo -e "${CYAN}🚀 Running Database Seeder...${RESET}"
    cd "$SERVER_DIR" && node src/scripts/seed.js
    ;;

  purge)
    echo -e "${YELLOW}⚠️  Running Database Purger...${RESET}"
    cd "$SERVER_DIR" && node src/scripts/purge.js
    ;;

  reset)
    echo -e "${YELLOW}🔄 Resetting Database (Purge + Seed)...${RESET}"
    cd "$SERVER_DIR" && node src/scripts/purge.js && node src/scripts/seed.js
    ;;

  *)
    echo -e "${RED}Unknown command: $COMMAND${RESET}"
    usage
    ;;
esac
