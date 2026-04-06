"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type CourseProgressData = {
  course_slug: string;
  current_module: number;
  current_sublesson: string;
  modules_completed: number[];
  started_at: string;
  last_activity_at: string;
  completed_at: string | null;
};

export type SublessonProgressData = {
  module_number: number;
  sublesson_letter: string;
  completed: boolean;
};

export function useProgress(courseSlug?: string) {
  const { user } = useAuth();
  const [courseProgress, setCourseProgress] = useState<CourseProgressData | null>(null);
  const [sublessonProgress, setSublessonProgress] = useState<SublessonProgressData[]>([]);
  const [allProgress, setAllProgress] = useState<CourseProgressData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load progress for a specific course
  const loadCourseProgress = useCallback(async () => {
    if (!user || !courseSlug) { setLoading(false); return; }

    const [courseRes, subRes] = await Promise.all([
      supabase
        .from("course_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("course_slug", courseSlug)
        .single(),
      supabase
        .from("sublesson_progress")
        .select("module_number, sublesson_letter, completed")
        .eq("user_id", user.id)
        .eq("course_slug", courseSlug),
    ]);

    if (courseRes.data) setCourseProgress(courseRes.data);
    if (subRes.data) setSublessonProgress(subRes.data);
    setLoading(false);
  }, [user, courseSlug]);

  // Load all course progress (for dashboard)
  const loadAllProgress = useCallback(async () => {
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from("course_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("last_activity_at", { ascending: false });

    if (data) setAllProgress(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (courseSlug) loadCourseProgress();
    else loadAllProgress();
  }, [courseSlug, loadCourseProgress, loadAllProgress]);

  // Start a course (or get existing progress)
  const startCourse = useCallback(async () => {
    if (!user || !courseSlug) return;

    const { data } = await supabase
      .from("course_progress")
      .upsert(
        {
          user_id: user.id,
          course_slug: courseSlug,
          current_module: 1,
          current_sublesson: "A",
          modules_completed: [],
          last_activity_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug" }
      )
      .select()
      .single();

    if (data) setCourseProgress(data);
    return data;
  }, [user, courseSlug]);

  // Complete a sub-lesson
  const completeSublesson = useCallback(
    async (moduleNumber: number, sublessonLetter: string, nextModule: number, nextSublesson: string) => {
      if (!user || !courseSlug) return;

      // Mark sub-lesson complete
      await supabase.from("sublesson_progress").upsert(
        {
          user_id: user.id,
          course_slug: courseSlug,
          module_number: moduleNumber,
          sublesson_letter: sublessonLetter,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug,module_number,sublesson_letter" }
      );

      // Update course progress pointer
      await supabase
        .from("course_progress")
        .upsert(
          {
            user_id: user.id,
            course_slug: courseSlug,
            current_module: nextModule,
            current_sublesson: nextSublesson,
            last_activity_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_slug" }
        );

      // Refresh
      await loadCourseProgress();
    },
    [user, courseSlug, loadCourseProgress]
  );

  // Complete a module
  const completeModule = useCallback(
    async (moduleNumber: number) => {
      if (!user || !courseSlug || !courseProgress) return;

      const updated = [...new Set([...(courseProgress.modules_completed || []), moduleNumber])].sort(
        (a, b) => a - b
      );

      await supabase
        .from("course_progress")
        .update({
          modules_completed: updated,
          last_activity_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("course_slug", courseSlug);

      await loadCourseProgress();
    },
    [user, courseSlug, courseProgress, loadCourseProgress]
  );

  // Complete the entire course
  const completeCourse = useCallback(async () => {
    if (!user || !courseSlug) return;

    await supabase
      .from("course_progress")
      .update({
        completed_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("course_slug", courseSlug);

    await loadCourseProgress();
  }, [user, courseSlug, loadCourseProgress]);

  // Helper: is a specific sub-lesson completed?
  const isSublessonCompleted = (moduleNumber: number, letter: string) =>
    sublessonProgress.some(
      (sp) => sp.module_number === moduleNumber && sp.sublesson_letter === letter && sp.completed
    );

  // Helper: is a module completed?
  const isModuleCompleted = (moduleNumber: number) =>
    courseProgress?.modules_completed?.includes(moduleNumber) ?? false;

  // Helper: is a module accessible? (module 1 always, others need previous complete)
  const isModuleAccessible = (moduleNumber: number) => {
    if (moduleNumber === 1) return true;
    return isModuleCompleted(moduleNumber - 1);
  };

  return {
    courseProgress,
    sublessonProgress,
    allProgress,
    loading,
    startCourse,
    completeSublesson,
    completeModule,
    completeCourse,
    isSublessonCompleted,
    isModuleCompleted,
    isModuleAccessible,
    reload: courseSlug ? loadCourseProgress : loadAllProgress,
  };
}
