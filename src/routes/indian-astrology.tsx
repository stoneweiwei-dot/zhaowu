import { createFileRoute } from "@tanstack/react-router";
import { IndianAstrologyPage } from "@/components/indian-astrology-page";

export const Route = createFileRoute("/indian-astrology")({ component: IndianAstrologyPage });
