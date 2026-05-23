import { redirect } from "next/navigation";

export const metadata = { title: "Registro Cliente" };

export default function RegisterPage() {
  redirect("/registro");
}
