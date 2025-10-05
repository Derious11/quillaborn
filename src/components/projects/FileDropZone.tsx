import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  uploading?: boolean;
}

export function FileDropZone({ onFiles, uploading }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFiles,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-6 cursor-pointer transition 
      ${
        isDragActive
          ? "border-green-500 bg-green-500/10"
          : "border-gray-600 hover:border-green-400 bg-gray-800"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center text-gray-400">
        {uploading ? (
          <p className="text-sm text-green-400">Uploading...</p>
        ) : (
          <>
            <Upload className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm">
              {isDragActive
                ? "Drop your file here"
                : "Drag & drop files here, or click to select"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
