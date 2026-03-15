import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { getAuthInfo } from "@/lib/auth-helpers";

export default async function AdminPage() {
  const supabase = await createClient();
  const auth = await getAuthInfo();

  // Role-based admin check
  if (!auth.user || !auth.isAdmin) {
    redirect("/");
  }

  const { data: tricks } = await supabase
    .from("tricks")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("difficulty", { ascending: true })
    .order("name", { ascending: true });

  const { data: suggestions } = await supabase
    .from("trick_suggestions")
    .select(`
      *,
      tricks (name, difficulty, category)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const { data: newTrickSuggestions } = await supabase
    .from("new_trick_suggestions")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <AdminDashboard 
        initialTricks={tricks || []} 
        suggestions={suggestions || []} 
        newTrickSuggestions={newTrickSuggestions || []}
      />
    </main>
  );
}
