import { createFileRoute } from "@tanstack/react-router";
import { HepanPage } from "@/components/hepan-page";

export const Route = createFileRoute("/hepan")({ component: HepanPage });
