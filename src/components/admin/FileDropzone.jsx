import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';
import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_UPLOAD_FILES,
  UPLOAD_ACCEPT,
} from '../../constants/documents';
import { cn } from '../../utils/cn';

const rejectionMessage = (rejections) => {
  const messages = [];

  for (const { file, errors } of rejections) {
    for (const error of errors) {
      if (error.code === 'file-too-large') {
        messages.push(`${file.name} is larger than ${MAX_FILE_SIZE_MB} MB.`);
      } else if (error.code === 'file-invalid-type') {
        messages.push(`${file.name} is not a PDF.`);
      } else if (error.code === 'too-many-files') {
        messages.push(`You can upload up to ${MAX_UPLOAD_FILES} PDFs at a time.`);
      }
    }
  }

  return [...new Set(messages)].join(' ');
};

export default function FileDropzone({
  onFiles,
  multiple = true,
  disabled = false,
  compact = false,
}) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDropAccepted: onFiles,
    onDropRejected: (rejections) => {
      const message = rejectionMessage(rejections);
      if (message) toast.error(message, { id: 'dropzone-rejected' });
    },
    accept: UPLOAD_ACCEPT,
    multiple,
    maxFiles: multiple ? MAX_UPLOAD_FILES : 1,
    maxSize: MAX_FILE_SIZE_BYTES,
    disabled,
    noClick: false,
  });

  return (
    <div
      {...getRootProps({
        className: cn(
          'group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 text-center transition-colors',
          compact ? 'py-6' : 'py-10 sm:py-12',
          isDragReject
            ? 'border-rose-400 bg-rose-50/70'
            : isDragActive
              ? 'border-brand-500 bg-brand-50/70'
              : 'border-slate-300 bg-slate-50/60 hover:border-brand-400 hover:bg-brand-50/40',
          disabled && 'cursor-not-allowed opacity-60 hover:border-slate-300 hover:bg-slate-50/60',
        ),
      })}
    >
      <input {...getInputProps()} />

      <span
        className={cn(
          'flex items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200',
          compact ? 'size-10' : 'size-12',
        )}
      >
        <UploadCloud className={compact ? 'size-5' : 'size-6'} aria-hidden="true" />
      </span>

      <p className="mt-3 text-sm font-semibold text-slate-900">
        {isDragReject
          ? 'Only PDF files can be uploaded'
          : isDragActive
            ? 'Drop the file to add it'
            : multiple
              ? 'Drag & drop PDF files here'
              : 'Drag & drop a PDF here'}
      </p>
      <p className="mt-1 text-xs text-slate-500">or</p>
      <span className="mt-2 inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors group-hover:border-brand-300 group-hover:text-brand-700">
        Browse files
      </span>
      <p className="mt-3 text-[11px] text-slate-400">
        PDF only · up to {MAX_FILE_SIZE_MB} MB each
        {multiple ? ` · max ${MAX_UPLOAD_FILES} files` : ''}
      </p>
    </div>
  );
}
