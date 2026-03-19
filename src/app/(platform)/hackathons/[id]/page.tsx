import { redirect } from "next/navigation";

export default function HackathonDetailRedirect({ params }: { params: { id: string } }) {
  redirect(`/antathons/${params.id}`);
}
