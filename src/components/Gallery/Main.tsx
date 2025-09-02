"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserStore } from "@/store/UserStore";
import debounce from "lodash.debounce";
import Link from "next/link";
import {
  FileText,
  Edit2,
  ExternalLink,
  Plus,
  Trash2
} from "lucide-react";



export const GalleryMain = () => {
  const { user } = UserStore();
  const [filesData, setFiles] = useState<
    { id: string; name: string; countitem: number; created_at: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("galleries_folders")
      .select("*")
      .eq("user_id", user.user_id)
      .order("created_at", { ascending: true });

    if (error) console.log("Fetch error:", error.message);
    else setFiles(data || []);
    setLoading(false);
  };

  // Yangi fayl qo'shish
  const addNewFile = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("galleries_folders")
      .insert([{ user_id: user.user_id , name: "New Folder" }])
      .select()
      .single();

    if (error) console.log("Insert error:", error.message);
    else setFiles([...filesData, data]);

    setLoading(false);
  };

  const editFileNameDebounced = useCallback(
    debounce(async (id: string, newName: string) => {
      const { error } = await supabase
        .from("galleries_folders")
        .update({ name: newName })
        .eq("id", id);

      if (error) console.log("Update error:", error.message);
    }, 300),
    []
  );

  const handleChange = (id: string, value: string) => {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id ? { ...file, name: value } : file
      )
    );
    editFileNameDebounced(id, value);
  };


const deleteFile = async (id: string) => {
  const { error } = await supabase
    .from("galleries_folders")
    .delete()
    .eq("id", id);

  if (error) {
    console.log("Delete error:", error.message);
  } else {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }
};


const dateFormat = (sana: string) => {
  const formated = new Date(sana).toLocaleString()

  return formated.split(",")[0]
}



  const getFileExtension = (filename: string) => {
    if(!filename) return
    return filename.split(".").pop()?.toUpperCase() || "FILE";
  };


  useEffect(() => {
    fetchFiles();
  }, [user]);

  if (!user)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400 text-lg">
          Please log in to see your gallery.
        </p>
      </div>
    );

  return (
    <section className="py-9 px-5 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-100">ГАЛЕРЕЯ</h1>
        <button
          onClick={addNewFile}
          disabled={loading}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2 font-medium disabled:opacity-50 cursor-pointer transform"
        >
          <Plus className="w-5 h-5" />
          Создать Файл
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filesData.map((file) => {
          return (
            <div
              key={file.id}
              className="group  border  rounded-xl p-4 flex flex-col justify-between hover:shadow-2xl hover:border-blue-500 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:bg-slate-750"
            >
              {/* File Icon and Type */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <FileText />
                  <span className="text-xs font-medium text-slate-300 bg-slate-700 px-3 py-1 rounded-full">
                    {getFileExtension(file.name)}
                  </span>
                </div>
                <div className="flex flex-row gap-1">
                  <button
                    onClick={() =>
                      setEditingId(editingId === file.id ? null : file.id)
                    }
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-700 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* File Name */}
              <div className="my-3">
                {editingId === file.id ? (
                  <input
                    className="w-full font-medium text-slate-100  outline-none border-b-2 border-blue-500 pb-1 bg-transparent placeholder-slate-500"
                    value={file.name}
                    onChange={(e) => handleChange(file.id, e.target.value)}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => e.key === "Enter" && setEditingId(null)}
                    autoFocus
                  />
                ) : (
                  <h3
                    className="font-medium text-slate-100 truncate border-b-2 border-b-transparent  pb-1 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => setEditingId(file.id)}
                    title={file.name}
                  >
                    {file.name}
                  </h3>
                )}
              </div>

              {/* File Details */}
              <div className="flex justify-between items-center  mt-2 text-sm text-slate-500 mb-4">
                <span className="font-medium">{file.countitem}</span>
                <span>{dateFormat(file.created_at)}</span>
              </div>

              {/* Action Button */}
              <Link
                href={`/gallery/${file.id}`}
                className="w-full bg-slate-700 mt-5 hover:bg-slate-600 text-slate-200 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2  group-hover:text-white no-underline"
              >
                <span>Открыть</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
};
