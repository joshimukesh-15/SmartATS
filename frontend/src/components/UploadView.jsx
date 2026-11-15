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
  X,
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
  }, [jobId]);

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
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header: Serif H1 (36-40px) + One Muted Sentence */}
      <div className="pb-6 border-b border-line">
        <h1 className="font-serif text-[36px] sm:text-[40px] font-normal text-ink tracking-tight leading-none">
          Resume Ingestion & Parsing
        </h1>
        <p className="text-[15px] text-ink-muted mt-2 font-sans">
          Batch parse PDF and DOCX files with automated SHA-256 duplicate validation and OCR fallback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Job Selection Dropdown */}
          <div className="quiet-card p-6 bg-surface space-y-3">
            <label className="block text-[13px] font-sans font-medium text-ink-muted">
              Target Job Specification *
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[8px] text-[14px] text-ink font-medium focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
            >
              {jobs.map((j) => (
                <option key={j.job_id} value={j.job_id}>
                  {j.title} ({j.applications_count || 0} existing applicants)
                </option>
              ))}
            </select>

            {/* Target Job Skills Preview */}
            {activeJob && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[13px]">
                <span className="font-mono text-ink-muted uppercase">Required:</span>
                {activeJob.required_skills?.map((s, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-[6px] bg-surface-alt text-ink font-sans"
                  >
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
            className={`border-2 border-dashed rounded-[16px] p-10 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-wine bg-wine-soft/30'
                : 'border-line bg-surface hover:border-ink-muted/50'
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
              <div className="w-12 h-12 rounded-[10px] bg-surface-alt flex items-center justify-center mx-auto text-ink">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-[17px] font-serif font-normal text-ink">
                  Select or drop candidate documents
                </h3>
                <p className="text-[13px] text-ink-muted mt-1 font-mono">
                  Accepts PDF &amp; DOCX files up to 15MB
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-surface hover:bg-surface-alt text-ink rounded-[8px] text-[14px] font-medium border border-line transition-colors shadow-xs"
              >
                Browse Files
              </button>
            </div>
          </div>

          {/* Queued Files Box */}
          {files.length > 0 && (
            <div className="quiet-card bg-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[13px] uppercase font-mono font-medium text-ink-muted">
                  Queued for Ingestion ({files.length})
                </span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-[13px] text-ink-muted hover:text-wine font-mono transition-colors"
                >
                  Clear Queue
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-line">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-[14px]"
                  >
                    <div className="flex items-center space-x-2 truncate max-w-sm">
                      <FileText className="w-4 h-4 text-ink-muted flex-shrink-0" />
                      <span className="text-ink truncate font-medium">{file.name}</span>
                      <span className="text-ink-muted text-[13px] font-mono">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-ink-muted hover:text-wine transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 bg-wine hover:bg-wine-hover text-white rounded-[8px] text-[14px] font-medium transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 shadow-xs"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Parsing &amp; Evaluating...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 text-white" />
                    <span>Ingest {files.length} Documents</span>
                  </>
                )}
              </button>
            </div>
          )}

        </div>

        {/* Results & Architecture Sidebar */}
        <div className="space-y-6">
          
          {/* Upload Status Card */}
          {uploadResults.length > 0 && (
            <div className="quiet-card bg-surface p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-lg font-serif font-normal text-ink">Ingestion Status</h3>
                <span className="text-[13px] font-mono text-ink-muted">{uploadResults.length} files</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {uploadResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-canvas rounded-[8px] border border-line space-y-1 text-[13px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink truncate max-w-[170px]">
                        {res.filename}
                      </span>
                      {res.status === 'ACCEPTED' ? (
                        <span className="inline-flex items-center space-x-1 text-wine font-mono font-medium bg-wine-soft px-2 py-0.5 rounded-[6px]">
                          <CheckCircle2 className="w-3 h-3 text-wine" />
                          <span>QUEUED</span>
                        </span>
                      ) : res.status === 'DUPLICATE' ? (
                        <span className="inline-flex items-center space-x-1 text-gold-text font-mono font-medium bg-gold-soft px-2 py-0.5 rounded-[6px]">
                          <AlertTriangle className="w-3 h-3 text-gold" />
                          <span>DUPLICATE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-ink-muted font-mono font-medium bg-surface-alt px-2 py-0.5 rounded-[6px]">
                          <XCircle className="w-3 h-3 text-ink-muted" />
                          <span>REJECTED</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-ink-muted">{res.message}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectJobForRankings(jobId)}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 border border-line text-ink hover:text-wine hover:border-wine rounded-[8px] text-[14px] font-medium transition-colors shadow-xs"
              >
                <span>View Job Leaderboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Diagnostic Pipeline Information */}
          <div className="quiet-card bg-surface p-6 space-y-4">
            <div className="text-[13px] uppercase font-mono text-ink-muted font-medium">
              Pipeline Architecture
            </div>
            <ul className="space-y-3.5 text-[14px] text-ink-muted leading-relaxed font-sans">
              <li className="flex items-start space-x-2.5">
                <span className="font-serif text-gold font-normal text-lg leading-none">01.</span>
                <span><strong className="text-ink font-medium">Binary Hashing:</strong> SHA-256 binary validation blocks identical uploads before GPU computation.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="font-serif text-gold font-normal text-lg leading-none">02.</span>
                <span><strong className="text-ink font-medium">Text Extraction:</strong> PyMuPDF extracts page text; Tesseract OCR activates automatically on scanned images.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <span className="font-serif text-gold font-normal text-lg leading-none">03.</span>
                <span><strong className="text-ink font-medium">Dual-Track Scoring:</strong> Computes mandatory keyword coverage and contextual cosine similarity vectors.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
