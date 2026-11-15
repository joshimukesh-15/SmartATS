import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
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
      className="fixed inset-0 m-auto bg-surface border border-line rounded-[16px] w-full max-w-xl p-0 text-ink shadow-[0_1px_2px_rgba(42,16,21,0.04),0_24px_64px_rgba(42,16,21,0.12)] backdrop:bg-ink/40 backdrop:backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-line flex items-center justify-between bg-surface-alt">
          <div>
            <h2
              id="create-job-modal-title"
              className="text-2xl font-serif font-normal text-ink tracking-tight"
            >
              Create Job Specification
            </h2>
            <p className="text-[13px] text-ink-muted font-sans mt-0.5">
              Define mandatory criteria and contextual scope.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-[8px] text-ink-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-surface-alt border border-line rounded-[8px] text-[13px] text-ink font-mono">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="job-title"
              className="block text-[13px] font-sans font-medium text-ink-muted mb-1.5"
            >
              Position Title *
            </label>
            <input
              id="job-title"
              type="text"
              required
              placeholder="e.g. Senior Backend Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[8px] text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
            />
          </div>

          <div>
            <label
              htmlFor="job-desc"
              className="block text-[13px] font-sans font-medium text-ink-muted mb-1.5"
            >
              Role Description *
            </label>
            <textarea
              id="job-desc"
              rows={4}
              required
              placeholder="Detail key responsibilities, deliverables, and technical scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[8px] text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-gold leading-relaxed transition-colors"
            />
          </div>

          {/* Mandatory Skills */}
          <div>
            <label
              htmlFor="req-skills-input"
              className="block text-[13px] font-sans font-medium text-ink-muted mb-1.5"
            >
              Required Technical Skills * (Press Enter or comma)
            </label>
            <input
              id="req-skills-input"
              type="text"
              placeholder="Type skill (e.g. Python) and press Enter"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={addRequiredSkill}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[8px] text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] text-[13px] bg-surface-alt text-ink font-sans"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeRequiredSkill(skill)}
                    className="hover:text-wine transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills */}
          <div>
            <label
              htmlFor="pref-skills-input"
              className="block text-[13px] font-sans font-medium text-ink-muted mb-1.5"
            >
              Preferred Qualifications (Optional)
            </label>
            <input
              id="pref-skills-input"
              type="text"
              placeholder="Type optional skill (e.g. Redis, AWS) and press Enter"
              value={prefInput}
              onChange={(e) => setPrefInput(e.target.value)}
              onKeyDown={addPreferredSkill}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[8px] text-[14px] text-ink placeholder:text-ink-subtle focus:outline-none focus:ring-2 focus:ring-gold transition-colors"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {preferredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-[6px] text-[13px] bg-surface-alt text-ink font-sans"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removePreferredSkill(skill)}
                    className="hover:text-wine transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-line flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface hover:bg-surface-alt text-ink border border-line text-[14px] font-medium rounded-[8px] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-wine hover:bg-wine-hover text-white text-[14px] font-medium rounded-[8px] transition-colors disabled:opacity-50 shadow-xs"
            >
              {loading ? 'Publishing...' : 'Save Job Opening'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
