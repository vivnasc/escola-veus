"use client";

import { useState, useRef } from "react";
import { COURSES } from "@/data/courses";
import { supabase } from "@/lib/supabase";

type ContentType = "video" | "workbook";

type UploadStatus = {
  key: string;
  status: "idle" | "uploading" | "done" | "error";
  url?: string;
  error?: string;
};

export default function AdminConteudoPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>(COURSES[0]?.slug ?? "");
  const [uploads, setUploads] = useState<Record<string, UploadStatus>>({});
  const course = COURSES.find((c) => c.slug === selectedCourse);

  const updateUpload = (key: string, update: Partial<UploadStatus>) => {
    setUploads((prev) => ({
      ...prev,
      [key]: { ...prev[key], key, status: "idle", ...update },
    }));
  };

  const handleUpload = async (
    file: File,
    type: ContentType,
    courseSlug: string,
    moduleNumber: number,
    sublessonLetter?: string
  ) => {
    const key = `${courseSlug}-${moduleNumber}-${sublessonLetter || "workbook"}-${type}`;
    updateUpload(key, { status: "uploading" });

    const ext = file.name.split(".").pop() || "bin";
    const path = sublessonLetter
      ? `escola/${courseSlug}/mod-${moduleNumber}/${sublessonLetter}.${ext}`
      : `escola/${courseSlug}/mod-${moduleNumber}/caderno.${ext}`;

    const bucket = type === "video" ? "escola-videos" : "escola-workbooks";

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });

    if (error) {
      updateUpload(key, { status: "error", error: error.message });
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    updateUpload(key, { status: "done", url: urlData.publicUrl });
  };

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-semibold text-escola-creme">
        Publicar conteudo
      </h2>

      {/* Course selector */}
      <div className="mb-6">
        <label className="mb-1 block text-xs text-escola-creme-50">Curso</label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full rounded-lg border border-escola-border bg-escola-card px-3 py-2.5 text-sm text-escola-creme focus:border-escola-dourado focus:outline-none"
        >
          {COURSES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {course && (
        <div className="space-y-3">
          {course.modules.map((mod) => (
            <div
              key={mod.number}
              className="rounded-xl border border-escola-border bg-escola-card p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-escola-creme">
                  Modulo {mod.number}: {mod.title}
                </h3>
              </div>

              {/* Sub-lessons */}
              <div className="space-y-2">
                {mod.subLessons.map((sl) => {
                  const key = `${course.slug}-${mod.number}-${sl.letter}-video`;
                  const upload = uploads[key];
                  return (
                    <div
                      key={sl.letter}
                      className="flex items-center justify-between rounded-lg bg-escola-bg px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-escola-dourado">
                          {sl.letter}
                        </span>
                        <span className="text-xs text-escola-creme">
                          {sl.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {upload?.status === "done" && (
                          <span className="text-[10px] text-green-400">Enviado</span>
                        )}
                        {upload?.status === "uploading" && (
                          <span className="text-[10px] text-escola-dourado">A enviar...</span>
                        )}
                        {upload?.status === "error" && (
                          <span className="text-[10px] text-escola-terracota" title={upload.error}>
                            Erro
                          </span>
                        )}
                        <UploadButton
                          type="video"
                          label="Video"
                          accept="video/*"
                          onFile={(file) =>
                            handleUpload(file, "video", course.slug, mod.number, sl.letter)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Workbook */}
              {mod.workbook && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-escola-bg px-3 py-2">
                  <span className="text-xs text-escola-creme-50">
                    Caderno: {mod.workbook}
                  </span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const key = `${course.slug}-${mod.number}-workbook-workbook`;
                      const upload = uploads[key];
                      return (
                        <>
                          {upload?.status === "done" && (
                            <span className="text-[10px] text-green-400">Enviado</span>
                          )}
                          {upload?.status === "uploading" && (
                            <span className="text-[10px] text-escola-dourado">A enviar...</span>
                          )}
                          <UploadButton
                            type="workbook"
                            label="PDF"
                            accept=".pdf"
                            onFile={(file) =>
                              handleUpload(file, "workbook", course.slug, mod.number)
                            }
                          />
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadButton({
  type,
  label,
  accept,
  onFile,
}: {
  type: ContentType;
  label: string;
  accept: string;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="rounded border border-escola-border px-2 py-1 text-[10px] text-escola-creme-50 transition-colors hover:border-escola-dourado/40 hover:text-escola-creme"
      >
        {label}
      </button>
    </>
  );
}
