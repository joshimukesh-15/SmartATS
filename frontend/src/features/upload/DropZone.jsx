import { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export default function DropZone({ onFilesAdded }) {
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className="rounded-[14px] border-2 border-dashed border-line bg-surface hover:bg-surface-alt/40 p-10 text-center transition-colors cursor-pointer space-y-3 shadow-xs"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onFilesAdded(e.target.files);
        }}
      />
      <div className="w-12 h-12 rounded-[10px] bg-surface-alt border border-line flex items-center justify-center mx-auto text-ink-muted">
        <UploadCloud className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <div className="space-y-1">
        <div className="text-[15px] font-medium text-ink">
          Drag and drop candidate files here, or click to browse
        </div>
        <p className="text-[13px] text-ink-muted">Supports PDF and DOCX files up to 15MB each.</p>
      </div>
    </div>
  );
}
