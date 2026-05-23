import { redirect } from "next/navigation";

export const metadata = { title: "Login Cliente" };

export default function LoginPage() {
  redirect("/login");
}
