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
      <div className="border-b border-[#E6E1D7] pb-6">
        <span className="text-xs uppercase font-mono tracking-wider text-[#C96442]">
          Ingestion Pipeline
        </span>
        <h1 className="text-3xl font-serif font-bold text-[#191716] mt-1 tracking-tight">
          Resume Upload & Parsing
        </h1>
        <p className="text-xs text-[#79736B] mt-1 font-sans">
          Batch parse PDF and DOCX documents with automated SHA-256 duplicate detection and OCR fallback.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Form Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Job Selection Dropdown */}
          <div className="bg-white border border-[#E6E1D7] rounded-2xl p-6 space-y-3 shadow-xs">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#4A4641] font-semibold">
              Target Job Requirement *
            </label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F6F3ED] border border-[#E6E1D7] rounded-xl text-xs text-[#191716] font-medium focus:outline-none focus:border-[#C96442] transition-colors shadow-xs"
            >
              {jobs.map((j) => (
                <option key={j.job_id} value={j.job_id}>
                  {j.title} ({j.applications_count || 0} existing candidates)
                </option>
              ))}
            </select>

            {/* Target Job Skills Preview */}
            {activeJob && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs text-[#4A4641]">
                <span className="text-[10px] uppercase font-mono text-[#79736B]">Required:</span>
                {activeJob.required_skills.map((s, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full bg-[#F0F6F2] text-[#276749] border border-[#C8E3D4] text-xs font-medium">
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
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
              isDragging
                ? 'border-[#C96442] bg-[#FAF0EB]'
                : 'border-[#D5CEBE] bg-[#F6F3ED]/50 hover:border-[#C96442] hover:bg-[#FAF0EB]/30'
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
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E6E1D7] flex items-center justify-center mx-auto text-[#C96442] shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#191716]">
                  Select or drop candidate documents
                </h3>
                <p className="text-xs text-[#79736B] mt-1 font-mono">
                  Accepts PDF & DOCX formats (up to 15MB)
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-white hover:bg-[#F6F3ED] text-[#191716] rounded-full text-xs font-semibold border border-[#E6E1D7] transition shadow-xs"
              >
                Browse Files
              </button>
            </div>
          </div>

          {/* Queued Files Box */}
          {files.length > 0 && (
            <div className="bg-white border border-[#E6E1D7] rounded-2xl p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono font-semibold text-[#79736B]">
                  Queued For Ingestion ({files.length})
                </span>
                <button
                  type="button"
                  onClick={() => setFiles([])}
                  className="text-xs text-[#79736B] hover:text-[#B93826] transition font-mono"
                >
                  Clear Queue
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-[#E6E1D7]">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 first:pt-0 last:pb-0 text-xs"
                  >
                    <div className="flex items-center space-x-2 truncate max-w-sm">
                      <FileText className="w-4 h-4 text-[#79736B] flex-shrink-0" />
                      <span className="text-[#191716] truncate font-medium">{file.name}</span>
                      <span className="text-[#79736B] text-[10px] font-mono">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-[#79736B] hover:text-[#B93826] transition font-bold text-sm"
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
                className="w-full py-3 bg-[#C96442] hover:bg-[#B55433] text-white rounded-full text-xs font-semibold tracking-wide transition-all flex items-center justify-center space-x-2 disabled:opacity-50 shadow-xs active:scale-[0.98]"
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
            <div className="bg-white border border-[#E6E1D7] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#E6E1D7] pb-3">
                <h3 className="text-base font-bold text-[#191716]">Ingestion Status</h3>
                <span className="text-xs font-mono text-[#79736B]">{uploadResults.length} files</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {uploadResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#F6F3ED] rounded-xl border border-[#E6E1D7] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#191716] truncate max-w-[170px]">
                        {res.filename}
                      </span>
                      {res.status === 'ACCEPTED' ? (
                        <span className="inline-flex items-center space-x-1 text-[#276749] font-mono text-[10px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>QUEUED</span>
                        </span>
                      ) : res.status === 'DUPLICATE' ? (
                        <span className="inline-flex items-center space-x-1 text-[#B45309] font-mono text-[10px] font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          <span>DUPLICATE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[#B93826] font-mono text-[10px] font-semibold">
                          <XCircle className="w-3 h-3" />
                          <span>REJECTED</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#4A4641]">{res.message}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectJobForRankings(jobId)}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 bg-[#191716] hover:bg-[#2B2927] text-[#FAF8F5] rounded-full text-xs font-semibold transition active:scale-[0.98] shadow-xs"
              >
                <span>View Job Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Diagnostic Pipeline Information */}
          <div className="bg-[#F6F3ED] border border-[#E6E1D7] rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="text-xs uppercase font-mono tracking-wider font-semibold text-[#191716]">
              Pipeline Architecture
            </div>
            <ul className="space-y-3 text-xs text-[#4A4641] leading-relaxed">
              <li className="flex items-start space-x-2">
                <span className="font-mono text-[#C96442] font-bold">01.</span>
                <span><strong className="text-[#191716] font-semibold">Cryptographic Hash:</strong> SHA-256 binary validation blocks duplicate uploads.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-mono text-[#C96442] font-bold">02.</span>
                <span><strong className="text-[#191716] font-semibold">Extraction:</strong> PyMuPDF extracts page text; Tesseract OCR activates on scanned images.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="font-mono text-[#C96442] font-bold">03.</span>
                <span><strong className="text-[#191716] font-semibold">Hybrid Matching:</strong> Computes token coverage and contextual cosine similarity.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
