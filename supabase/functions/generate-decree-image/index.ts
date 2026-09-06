import { reviewedPersonalKnowledge } from "../_shared/reviewed-personal-art.ts";
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

const IMAGE_STYLE_VERSION = "gallery-seeded-reviewed-r28-20260902";
const GALLERY_DIRECT_VERSION = "gallery-direct-v1-20260827";
const GALLERY_BUCKET = "zhaowu-gallery";
const REPORT_BUCKET = "zhaowu-report-images";
