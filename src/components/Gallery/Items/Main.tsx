"use client";
import { supabase } from "@/lib/supabaseClient";
import ConfirmModal from "@/ui/ConfirmDelete";
import { useParams } from "next/navigation";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { getFormatedDate } from "@/helpers/getDate";
import { getImagePath } from "@/helpers/getImagePath";
import { getUnicName } from "@/helpers/getUnicName";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";

interface Folder {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

interface GalleryFile {
  id: string;
  folder_id: string;
  user_id: string;
  file_path: string;
  created_at: string;
}

export default function GalleryFilesManager() {
  const { id } = useParams<{ id: string }>();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<GalleryFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<GalleryFile | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [confirm, setConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GalleryFile | null>(null);

  const fetchFolder = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("galleries_folders")
        .select("*")
        .eq("id", id)
        .single<Folder>();
      if (error) throw error;
      setFolder(data);
    } catch (err) {
      console.error("Folder fetch error:", err);
    }
  }, [id]);

  const fetchFiles = useCallback(async () => {
    if (!id) return;
    try {
      const { data, error } = await supabase
        .from("galleries_files")
        .select("*")
        .eq("folder_id", id)
        .order("created_at", { ascending: false })
        .returns<GalleryFile[]>();
      if (error) throw error;
      setFiles(data || []);
    } catch (err) {
      console.error("Files fetch error:", err);
      setFiles([]);
    } 
  }, [id]);

  const uploadFiles = async (fileList: File[]) => {
    if (!folder || fileList.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = fileList.length;
      let uploadedCount = 0;

      for (const file of fileList) {
        if (!file.type.startsWith("image/")) {
          uploadedCount++;
          setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
          continue;
        }

        const uniqueName = getUnicName(file.name);

        const { error: uploadError } = await supabase.storage
          .from("galleries")
          .upload(uniqueName, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from("galleries_files")
          .insert({
            folder_id: folder.id,
            user_id: folder.user_id,
            file_path: uniqueName,
          });

        if (dbError) throw dbError;

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100));
      }

      await fetchFiles();
      await fetchFolder();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFile) return;
    setConfirm(false);
    setSelectedImage(null);
    try {
      const { error: storageError } = await supabase.storage
        .from("galleries")
        .remove([selectedFile.file_path]);
      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("galleries_files")
        .delete()
        .eq("id", selectedFile.id);
      if (dbError) throw dbError;

      await fetchFiles();
      await fetchFolder();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
  const deleteFile = async (file: GalleryFile) => {
    setSelectedFile(file);
    setConfirm(true);
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      uploadFiles(files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) uploadFiles(files);
  };

  const openImageViewer = (file: GalleryFile, index: number) => {
    setSelectedImage(file);
    setCurrentImageIndex(index);
  };

  const closeImageViewer = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (files.length === 0) return;
    const next = (currentImageIndex + 1) % files.length;
    setSelectedImage(files[next]);
    setCurrentImageIndex(next);
  };

  const prevImage = () => {
    if (files.length === 0) return;
    const prev = (currentImageIndex - 1 + files.length) % files.length;
    setSelectedImage(files[prev]);
    setCurrentImageIndex(prev);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeImageViewer();
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [selectedImage, currentImageIndex, files.length]);

  useEffect(() => {
    if (id) {
      fetchFolder();
      fetchFiles();
    }
  }, [id, fetchFolder, fetchFiles]);



  if (!folder) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <X className="w-16 h-16 text-red-400" />
        <p className="ml-4 text-lg">Papka topilmadi</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darker text-white flex flex-col">
      <header className=" p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">{folder.name}</h1>
        <p className="text-gray-400 text-sm">
          {files.length} ta rasm • {getFormatedDate(folder.created_at)}
        </p>
      </header>

      <main className="flex-1  w-full p-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 mb-6   lg:min-h-[230px] lg:w-[300px] text-center transition-all duration-200 ${
            dragOver
              ? "border-blue-400 bg-blue-500/10 scale-105"
              : "border-gray-600 hover:border-gray-500"
          }`}
        >
          {uploading ? (
            <div>
              <Upload className="w-12 h-12 mx-auto text-blue-400 animate-bounce" />
              <p className="mt-5 text-blue-400">Загружается...</p>
              <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">{uploadProgress}%</p>
            </div>
          ) : (
            <div>
              <Plus className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-2 text-lg font-semibold">
                Загрузка изображения
              </h3>
              <p className="text-gray-400 mb-4 text-sm">
                Перетащите или выберите изображения
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-[6px]">
                <Upload className="w-5 h-5" />
                Выбрать
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {files.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file, index) => (
              <div
                key={file.id}
                className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group"
              >
                <Image
                  src={getImagePath(file.file_path)}
                  alt={file.file_path}
                  width={500}
                  height={500}
                  quality={100}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openImageViewer(file, index)}
                />
                {/* Desktop hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center gap-2">
                  <button
                    onClick={() => openImageViewer(file, index)}
                    className="p-2 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a
                    href={getImagePath(file.file_path)}
                    download
                    className="p-2 bg-green-600 rounded-full hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deleteFile(file)}
                    className="p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile action buttons - always visible on small screens */}
                <div className="absolute top-2 right-2 md:hidden flex gap-1">
                  <button
                    onClick={() => openImageViewer(file, index)}
                    className="p-1.5 bg-blue-600/80 backdrop-blur-sm rounded-full"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <a
                    href={getImagePath(file.file_path)}
                    download
                    className="p-1.5 bg-green-600/80 backdrop-blur-sm rounded-full"
                  >
                    <Download className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => deleteFile(file)}
                    className="p-1.5 bg-red-600/80 backdrop-blur-sm rounded-full"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            Изображений пока нет. Попробуйте загрузить.
          </div>
        )}
      </main>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
          <button
            onClick={closeImageViewer}
            className="absolute top-4 right-4 p-2 bg-gray-800 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-[250px] lg:w-[450px]">
            <Image
              src={getImagePath(selectedImage.file_path)}
              alt={selectedFile?.file_path || "ss"}
              width={800}
              height={800}
              quality={100}
              className="w-full h-full object-cover cursor-pointer"
            />
          </div>

          <div className="absolute bottom-4 right-4 flex gap-2">
            <a
              href={getImagePath(selectedImage.file_path)}
              download
              className="p-2 bg-green-600 rounded-full"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={() => deleteFile(selectedImage)}
              className="p-2 bg-red-600 rounded-full"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirm}
        title="Вы уверены?"
        text="Этот файл будет удален безвозвратно!"
        confirmText="Да, удалить"
        cancelText="Отмена"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
