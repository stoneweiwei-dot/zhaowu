import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  GUARDIAN_STYLE_POOL_VERSION,
  chooseGuardianStyle,
  type GuardianStyle,
} from "./style-pool.ts";
import {
  PREMIUM_COMPOSITION_VERSION,
  premiumCompositionDirective,
} from "./premium-composition.ts";

const IMAGE_STYLE_VERSION = "gallery-seeded-song-v8-optional-personalization-20260827";
const GALLERY_DIRECT_VERSION = "gallery-direct-v1-20260827";
const GALLERY_BUCKET = "zhaowu-gallery";
const REPORT_BUCKET = "zhaowu-report-images";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ELEMENT_KEY: Record<string, "wood" | "fire" | "earth" | "metal" | "water"> = {
  木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water",
};
