export type MingshuDoctorResult = {
  ok: boolean;
  origin: string;
  apiVersion: string | null;
  connection: "reachable" | "failed";
  note?: string;
};

export async function checkMingshuDoctor(): Promise<MingshuDoctorResult> {
  const response = await fetch("/api/mingshu-doctor", { method: "GET", cache: "no-store" });
  return response.json() as Promise<MingshuDoctorResult>;
}
