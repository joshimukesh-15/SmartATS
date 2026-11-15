import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Briefcase } from 'lucide-react';
import { createJob } from '../api';

export default function CreateJobModal({ isOpen, onClose, onJobCreated }) {
  const dialogRef = useRef(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [reqInput, setReqInput] = useState('');
  const [prefInput, setPrefInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog && dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom;
    if (!isInDialog) {
      onClose();
    }
  };

  const addRequiredSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = reqInput.trim().replace(/^,+|,+$/g, '');
      if (val && !requiredSkills.includes(val)) {
        setRequiredSkills([...requiredSkills, val]);
        setReqInput('');
      }
    }
  };

  const removeRequiredSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const addPreferredSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = prefInput.trim().replace(/^,+|,+$/g, '');
      if (val && !preferredSkills.includes(val)) {
        setPreferredSkills([...preferredSkills, val]);
        setPrefInput('');
      }
    }
  };

  const removePreferredSkill = (skillToRemove) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Provide both job title and description.');
      return;
    }
    if (requiredSkills.length === 0) {
      setError('Specify at least one mandatory technical skill.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newJob = await createJob({
        title: title.trim(),
        description: description.trim(),
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
      });
      setTitle('');
      setDescription('');
      setRequiredSkills([]);
      setPreferredSkills([]);
      onJobCreated(newJob);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleBackdropClick}
      aria-labelledby="create-job-modal-title"
      className="fixed inset-0 m-auto bg-white border border-[#E6E1D7] rounded-2xl w-full max-w-xl p-0 text-[#191716] shadow-xl backdrop:bg-[#191716]/40 backdrop:backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-[#E6E1D7] flex items-center justify-between bg-[#F6F3ED]">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-[#C96442]">
              New Specification
            </span>
            <h2 id="create-job-modal-title" className="text-2xl font-serif font-bold text-[#191716] mt-0.5 tracking-tight">
              Create Job Opening
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-[#79736B] hover:text-[#191716] hover:bg-[#EFEAE1] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-[#FDF3F1] border border-[#F8D2CC] rounded-xl text-xs text-[#B93826] font-mono">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="job-title" className="block text-xs font-mono uppercase tracking-wider text-[#4A4641] mb-1.5 font-semibold">
              Position Title *
            </label>
            <input
              id="job-title"
              type="text"
              required
              placeholder="e.g. Senior Backend Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F6F3ED] border border-[#E6E1D7] rounded-xl text-xs text-[#191716] placeholder-[#A8A29A] focus:outline-none focus:border-[#C96442] transition-colors shadow-xs"
            />
          </div>

          <div>
            <label htmlFor="job-desc" className="block text-xs font-mono uppercase tracking-wider text-[#4A4641] mb-1.5 font-semibold">
              Role Description *
            </label>
            <textarea
              id="job-desc"
              rows={4}
              required
              placeholder="Detail key responsibilities, deliverables, and technical scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F6F3ED] border border-[#E6E1D7] rounded-xl text-xs text-[#191716] placeholder-[#A8A29A] focus:outline-none focus:border-[#C96442] leading-relaxed transition-colors shadow-xs"
            />
          </div>

          {/* Mandatory Skills */}
          <div>
            <label htmlFor="req-skills-input" className="block text-xs font-mono uppercase tracking-wider text-[#276749] mb-1.5 font-semibold">
              Required Technical Skills * (Press Enter or comma)
            </label>
            <input
              id="req-skills-input"
              type="text"
              placeholder="Type skill (e.g. Python) and press Enter"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={addRequiredSkill}
              className="w-full px-3.5 py-2.5 bg-[#F6F3ED] border border-[#E6E1D7] rounded-xl text-xs text-[#191716] placeholder-[#A8A29A] focus:outline-none focus:border-[#C96442] transition-colors shadow-xs"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F0F6F2] text-[#276749] border border-[#C8E3D4]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeRequiredSkill(skill)}
                    className="hover:text-[#B93826] transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label htmlFor="pref-skills-input" className="block text-xs font-mono uppercase tracking-wider text-[#C96442] mb-1.5 font-semibold">
              Preferred Qualifications (Optional)
            </label>
            <input
              id="pref-skills-input"
              type="text"
              placeholder="Type optional skill (e.g. Redis, AWS) and press Enter"
              value={prefInput}
              onChange={(e) => setPrefInput(e.target.value)}
              onKeyDown={addPreferredSkill}
              className="w-full px-3.5 py-2.5 bg-[#F6F3ED] border border-[#E6E1D7] rounded-xl text-xs text-[#191716] placeholder-[#A8A29A] focus:outline-none focus:border-[#C96442] transition-colors shadow-xs"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {preferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF0EB] text-[#C96442] border border-[#F0D5CA]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removePreferredSkill(skill)}
                    className="hover:text-[#B93826] transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E6E1D7] flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-[#F6F3ED] text-[#191716] border border-[#E6E1D7] text-xs font-semibold rounded-full shadow-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#C96442] hover:bg-[#B55433] text-white text-xs font-semibold rounded-full shadow-xs transition disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Save Job Opening'}
            </button>
          </div>
        </form>

      </div>
    </dialog>
  );
}
