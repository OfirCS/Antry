import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/discovery/admin";
import { DiscoveryQueueClient } from "./DiscoveryQueueClient";

export default async function AdminDiscoveryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.id)) {
    redirect("/dashboard");
  }

  const adminClient = createAdminClient();
  const { data: projects } = await adminClient
    .from("discovered_projects")
    .select("*")
    .order("quality_score", { ascending: false });

  return <DiscoveryQueueClient projects={projects || []} />;
}
