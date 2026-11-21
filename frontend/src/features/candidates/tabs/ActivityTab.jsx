import { useState } from 'react';
import { MessageSquare, History } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export default function ActivityTab({
  candidate,
  notesList: propNotesList,
  statusHistoryList: propStatusHistoryList,
  onAddNote,
  newNoteContent: propNewNoteContent,
  setNewNoteContent: propSetNewNoteContent,
  isAddingNote: propIsAddingNote,
  showAuditTrail: propShowAuditTrail,
  setShowAuditTrail: propSetShowAuditTrail,
  stageWorkflow,
}) {
  // Support internal state fallbacks if parent doesn't provide them
  const [internalNoteContent, setInternalNoteContent] = useState('');
  const [internalShowAudit, setInternalShowAudit] = useState(false);

  // Extract from stageWorkflow if provided
  const resolvedNewNoteContent = stageWorkflow?.newNoteContent !== undefined
    ? stageWorkflow.newNoteContent
    : (propNewNoteContent !== undefined ? propNewNoteContent : internalNoteContent);

  const resolvedSetNewNoteContent = stageWorkflow?.setNewNoteContent !== undefined
    ? stageWorkflow.setNewNoteContent
    : (propSetNewNoteContent !== undefined ? propSetNewNoteContent : setInternalNoteContent);

  const resolvedOnAddNote = stageWorkflow?.handleAddNote || onAddNote;
  const resolvedIsAddingNote = Boolean(stageWorkflow?.isAddingNote ?? propIsAddingNote);

  const showAudit = propShowAuditTrail !== undefined ? propShowAuditTrail : internalShowAudit;
  const setShowAudit = propSetShowAuditTrail !== undefined ? propSetShowAuditTrail : setInternalShowAudit;

  const notesList = propNotesList || candidate?.notes || [];
  const statusHistoryList = propStatusHistoryList || candidate?.status_history || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolvedNewNoteContent?.trim() || resolvedIsAddingNote) return;
    if (resolvedOnAddNote) {
      resolvedOnAddNote(e);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* 1. Add Note Form */}
      <form onSubmit={handleSubmit} className="space-y-2 p-3.5 rounded-[12px] bg-surface-alt/40 border border-line">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink">
          <MessageSquare className="w-4 h-4 text-champagne" strokeWidth={1.75} />
          <span>Add Recruiter Note</span>
        </div>
        <textarea
          placeholder="Add recruiter interview feedback or screening note..."
          value={resolvedNewNoteContent}
          onChange={(e) => resolvedSetNewNoteContent(e.target.value)}
          rows={3}
          className="w-full p-3 text-[13px] rounded-[10px] border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-hidden focus:ring-2 focus:ring-primary resize-y"
        />
        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!resolvedNewNoteContent?.trim() || resolvedIsAddingNote}
            loading={resolvedIsAddingNote}
          >
            {resolvedIsAddingNote ? 'Saving...' : 'Add Note'}
          </Button>
        </div>
      </form>

      {/* 2. Recruiter Notes Timeline */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[13px] text-ink-muted pb-1 border-b border-line px-1">
          <span className="font-semibold text-ink">Recruiter Timeline</span>
          <span className="tabular-nums">{notesList.length} note(s)</span>
        </div>

        {notesList.length === 0 ? (
          <p className="text-[13px] text-ink-muted italic py-3 text-center">
            No recruiter notes recorded yet.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {notesList.map((n, i) => (
              <div
                key={n.note_id || i}
                className="p-3.5 rounded-[10px] bg-surface border border-line text-[13px] space-y-1.5"
              >
                <div className="flex items-center justify-between text-[13px] text-ink-muted">
                  <span className="font-semibold text-ink">{n.author || 'Recruiter'}</span>
                  <span className="tabular-nums text-ink-subtle text-[12px]">
                    {n.created_at
                      ? new Date(n.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </span>
                </div>
                <p className="text-ink leading-relaxed whitespace-pre-line text-[13px]">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Stage History Transition Audit Trail */}
      <div className="pt-2 border-t border-line">
        <button
          type="button"
          onClick={() => setShowAudit(!showAudit)}
          className="flex items-center justify-between w-full text-[13px] font-semibold text-ink hover:text-primary transition-colors cursor-pointer py-1.5 px-1"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-champagne" strokeWidth={1.75} />
            <span>Stage History Audit ({statusHistoryList.length})</span>
          </div>
          <span className="text-[13px] text-ink-muted font-normal hover:underline">
            {showAudit ? 'Hide Audit Trail' : 'Show Audit Trail'}
          </span>
        </button>

        {showAudit && (
          <div className="space-y-2.5 pt-2.5 pl-3 border-l-2 border-champagne/40 ml-2 animate-fadeIn">
            {statusHistoryList.length === 0 ? (
              <p className="text-[13px] text-ink-muted italic py-1">
                No stage transitions recorded yet.
              </p>
            ) : (
              statusHistoryList.map((h, i) => (
                <div key={h.history_id || i} className="text-[13px] space-y-0.5 pb-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium text-ink">
                      {h.from_stage ? `${h.from_stage} → ${h.to_stage}` : `Initial: ${h.to_stage}`}
                    </span>
                    <span className="text-ink-subtle text-[12px] tabular-nums">
                      {h.created_at
                        ? new Date(h.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </div>
                  <div className="text-ink-muted text-[12px]">
                    by {h.changed_by || 'System'}
                    {h.note && (
                      <span className="italic text-ink"> — "{h.note}"</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
