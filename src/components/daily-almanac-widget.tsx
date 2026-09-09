import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { stemElement } from "@/lib/element-colors";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { galleryPublicUrl, listPublicGalleryAssets, type GalleryAsset } from "@/lib/gallery-assets";
import { isPublicAtlasAsset } from "@/lib/gallery-groups";
import { dayGanzhi, hourPillar, yearMonthPillars, lunarDateLabel } from "@/lib/bazi/calendar";

const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;
