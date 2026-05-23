import { redirect } from "next/navigation";

export const metadata = { title: "Tracks" };

export default async function TracksPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = (await searchParams) ?? {};
  const query = params.q ? `?q=${encodeURIComponent(params.q)}` : "";
  redirect(`/beats${query}`);
}
