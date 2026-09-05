#!/usr/bin/env bash

# ==============================================================================
# Google Play Store Bundle (.AAB) Builder Script
# எடப்பாடி கடை - கூகுள் ப்ளே ஸ்டோர் App Bundle (.AAB) உருவாக்கும் கருவி
# ==============================================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}======================================================================${NC}"
echo -e "${YELLOW}   🚀 GOOGLE PLAY STORE BUNDLE (.AAB) BUILDER${NC}"
echo -e "${YELLOW}   எடப்பாடி கடை - அதிகாரப்பூர்வ ரிலீஸ் பண்டில் தயாரிப்பு${NC}"
echo -e "${CYAN}======================================================================${NC}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

KEYSTORE_PATH="${PROJECT_ROOT}/my-upload-key.jks"
STORE_PASSWORD="${STORE_PASSWORD:-edappadi123}"
KEY_PASSWORD="${KEY_PASSWORD:-edappadi123}"

# Step 1: Check or Generate Upload Keystore
echo -e "\n${BLUE}[1/4] Checking Release Keystore / நற்சான்றிதழ் சரிபார்ப்பு...${NC}"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo -e "${YELLOW}🔑 Generating new upload keystore at: ${KEYSTORE_PATH}...${NC}"
    keytool -genkeypair -v \
        -keystore "$KEYSTORE_PATH" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -alias upload \
        -storepass "$STORE_PASSWORD" \
        -keypass "$KEY_PASSWORD" \
        -dname "CN=Edappadi Kadai, O=Edappadi Kadai, L=Edappadi, S=Tamil Nadu, C=IN"
    echo -e "${GREEN}✓ Upload Keystore successfully created!${NC}"
else
    echo -e "${GREEN}✓ Release Keystore found at: ${KEYSTORE_PATH}${NC}"
fi

# Step 2: Validate Environment & Clean
echo -e "\n${BLUE}[2/4] Preparing Clean Gradle Build Environment...${NC}"
export STORE_PASSWORD="$STORE_PASSWORD"
export KEY_PASSWORD="$KEY_PASSWORD"
export KEYSTORE_PATH="$KEYSTORE_PATH"

# Step 3: Run Gradle BundleRelease
echo -e "\n${BLUE}[3/4] Compiling Signed Android App Bundle (.aab)...${NC}"
echo -e "      (தயவுசெய்து காத்திருக்கவும், கோடுகள் சுருக்கப்பட்டு AAB உருவாக்கப்படுகிறது...)"

gradle :app:bundleRelease --no-daemon

# Step 4: Verification & Output Details
AAB_FILE="app/build/outputs/bundle/release/app-release.aab"

if [ -f "$AAB_FILE" ]; then
    AAB_SIZE=$(du -h "$AAB_FILE" | cut -f1)
    echo -e "\n${GREEN}======================================================================${NC}"
    echo -e "${GREEN}🎉 SUCCESS! Google Play Store Bundle (.AAB) Generated Successfully!${NC}"
    echo -e "${GREEN}   ப்ளே ஸ்டோரில் பதிவேற்ற வேண்டிய .aab கோப்பு தயாராகிவிட்டது!${NC}"
    echo -e "${GREEN}======================================================================${NC}"
    echo -e "📦 File Location: ${CYAN}${AAB_FILE}${NC}"
    echo -e "⚖️ File Size:     ${YELLOW}${AAB_SIZE}${NC}"
    echo -e "\n${BLUE}📋 அடுத்த கட்டங்கள் (Next Steps):${NC}"
    echo -e "1. Open Google Play Console: ${CYAN}https://play.google.com/console${NC}"
    echo -e "2. Go to: ${YELLOW}App > Release > Production (or Testing > Closed testing)${NC}"
    echo -e "3. Click ${GREEN}'Create new release'${NC} and upload: ${CYAN}${AAB_FILE}${NC}"
    echo -e "4. Copy listing details from: ${CYAN}play_store/PLAY_STORE_METADATA.md${NC}"
    echo -e "5. Generate store graphic assets using: ${CYAN}play_store/generate_store_assets.html${NC}"
    echo -e "${GREEN}======================================================================${NC}\n"
else
    echo -e "\n${RED}❌ Error: Bundle file not found at ${AAB_FILE}! Please check Gradle logs.${NC}"
    exit 1
fi
