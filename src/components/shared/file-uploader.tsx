"use client";

import { useState, useRef } from "react";
import { Upload, X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { toast } from "sonner";

interface FileUploaderProps {
  folder?: string;
  accept?: string;
  onUpload: (url: string, name: string) => void;
  className?: string;
}

export function FileUploader({ folder = "uploads", accept, onUpload, className }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFileName(file.name);
      onUpload(res.data.url, file.name);
      toast.success("File uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />
      {fileName ? (
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <FileIcon className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">{fileName}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFileName(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
      )}
    </div>
  );
}
