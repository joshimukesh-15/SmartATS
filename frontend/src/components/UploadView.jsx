import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  FileCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { fetchJobs, uploadResumes } from '../api';

export default function UploadView({ selectedJobId, onSelectJobForRankings }) {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState(selectedJobId || '');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchJobs()
      .then((data) => {
        setJobs(data);
        if (!jobId && data.length > 0) {
          setJobId(data[0].job_id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles) => {
    const valid = newFiles.filter((f) => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ext === 'pdf' || ext === 'docx';
    });
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!jobId) {
      alert('Select a target job opening first.');
      return;
    }
    if (files.length === 0) {
      alert('Add at least one resume document to proceed.');
      return;
    }

    setUploading(true);
    setUploadResults([]);

    try {
      const results = await uploadResumes(jobId, files);
      setUploadResults(results);
      setFiles([]);
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const activeJob = jobs.find((j) => String(j.job_id) === String(jobId));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs uppercase font-mono tracking-wider text-blue-400">
          Ingestion Pipeline
        </span>
        <h1 className="text-3xl font-bold text-white mt-1 tracking-tight">
          Resume Upload & Parsing
        </h1>
        <p className="text-xs text-slate-400 mt-1 font-sans">
          Batch parse PDF and DOCX documents with automated SHA-256 duplicate detection and OCR fallback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Job Selection Dropdown */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-lg">
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Target Job Requirement *
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-medium focus:outline-none focus:border-blue-500 transition-colors"
            >
              {jobs.map((j) => (
                <option key={j.job_id} value={j.job_id}>
                  {j.title} ({j.applications_count || 0} existing candidates)
                </option>
              ))}
            </select>

            {/* Target Job Skills Preview */}
            {activeJob && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[10px] uppercase font-mono text-slate-500">Required:</span>
                {activeJob.required_skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 bg-slate-950/60 ${
              isDragging
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept=".pdf,.docx"
              className="hidden"
            />
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto text-blue-400 shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Select or drop candidate documents
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Accepts PDF & DOCX formats (up to 15MB)
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                Browse Files
              </button>
            </div>
          </div>

          {/* Queued Files Box */}
          {files.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-semibold text-slate-400">
                  Queued For Ingestion ({files.length})
                </span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-slate-400 hover:text-rose-400 transition font-mono"
                >
                  Clear Queue
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-800">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate max-w-sm">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-slate-200 truncate font-medium">{file.name}</span>
                      <span className="text-slate-500 text-[10px] font-mono">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-slate-500 hover:text-rose-400 transition font-bold text-sm"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98]"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Parsing & Computing Scores...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Ingest {files.length} Documents</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Results & Guidelines Sidebar */}
        <div className="space-y-6">
          
          {/* Upload Status Card */}
          {uploadResults.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Ingestion Status</h3>
                <span className="text-xs font-mono text-slate-400">{uploadResults.length} files</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {uploadResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white truncate max-w-[170px]">
                        {res.filename}
                      </span>
                      {res.status === 'ACCEPTED' ? (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 font-mono text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>QUEUED</span>
                        </span>
                      ) : res.status === 'DUPLICATE' ? (
                        <span className="inline-flex items-center space-x-1 text-amber-400 font-mono text-[10px] font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>DUPLICATE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-rose-400 font-mono text-[10px] font-semibold">
                          <XCircle className="w-3 h-3" />
                          <span>REJECTED</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">{res.message}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectJobForRankings(jobId)}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition active:scale-[0.98] shadow-xs"
              >
                <span>View Job Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Diagnostic Pipeline Information */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="text-xs uppercase font-mono tracking-wider font-semibold text-blue-400">
              Pipeline Architecture
            </div>
            <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="font-mono text-blue-400 font-bold">01.</span>
                <span><strong className="text-white">Cryptographic Hash:</strong> SHA-256 binary validation blocks duplicate uploads.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-mono text-blue-400 font-bold">02.</span>
                <span><strong className="text-white">Extraction:</strong> PyMuPDF extracts page text; Tesseract OCR activates on scanned images.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-mono text-blue-400 font-bold">03.</span>
                <span><strong className="text-white">Hybrid Matching:</strong> Computes token coverage and contextual cosine similarity.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
