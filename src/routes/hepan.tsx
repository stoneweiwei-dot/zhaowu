import { pageHead } from "@/lib/route-meta";
import { createFileRoute } from "@tanstack/react-router";
import { HepanPage } from "@/components/hepan-page";

export const Route = createFileRoute("/hepan")({ head: pageHead, component: HepanPage });
