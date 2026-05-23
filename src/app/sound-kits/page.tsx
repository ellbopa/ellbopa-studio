import { redirect } from "next/navigation";

export const metadata = { title: "Sound Kits" };

export default function SoundKitsPage() {
  redirect("/presets");
}
