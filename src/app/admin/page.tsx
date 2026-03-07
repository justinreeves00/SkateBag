import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminClient } from "@/components/AdminClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Simple admin check
  if (!user || user.email !== "justinreeves00@gmail.com") {
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
      <AdminClient 
        initialTricks={tricks || []} 
        suggestions={suggestions || []} 
        newTrickSuggestions={newTrickSuggestions || []}
      />
    </main>
  );
}
