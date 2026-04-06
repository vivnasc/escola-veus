"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useJournal(courseSlug: string, moduleNumber: number, sublessonLetter?: string) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const query = supabase
      .from("escola_journal")
      .select("content, updated_at")
      .eq("user_id", user.id)
      .eq("course_slug", courseSlug)
      .eq("module_number", moduleNumber);

    query.eq("sublesson_letter", sublessonLetter || "_");

    const { data } = await query.single();
    if (data) {
      setContent(data.content || "");
      setLastSaved(data.updated_at);
    }
    setLoading(false);
  }, [user, courseSlug, moduleNumber, sublessonLetter]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(
    async (text: string) => {
      if (!user) return;

      await supabase.from("escola_journal").upsert(
        {
          user_id: user.id,
          course_slug: courseSlug,
          module_number: moduleNumber,
          sublesson_letter: sublessonLetter || "_",
          content: text,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug,module_number,sublesson_letter" }
      );

      setSaved(true);
      setLastSaved(new Date().toISOString());
    },
    [user, courseSlug, moduleNumber, sublessonLetter]
  );

  const updateContent = (text: string) => {
    setContent(text);
    setSaved(false);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => save(text), 1500);
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  return { content, updateContent, saved, lastSaved, wordCount, loading };
}
