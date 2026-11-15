import { Clock } from 'lucide-react';
import { Input, Button } from '../../components/ui';

export default function CandidateActivityTab({
  notesList = [],
  statusHistoryList = [],
  onAddNote,
  newNoteContent,
  setNewNoteContent,
  isAddingNote = false,
  showAuditTrail,
  setShowAuditTrail,
}) {
  return (
    <div className="space-y-4 animate-fadeIn">
      <form onSubmit={onAddNote} className="space-y-2">
        <div className="flex gap-2">
          <Input
            placeholder="Add recruiter feedback or review note..."
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newNoteContent.trim() || isAddingNote}
            loading={isAddingNote}
          >
            Post
          </Button>
        </div>
      </form>

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {notesList.length === 0 ? (
          <p className="text-[13px] text-ink-muted italic py-1">No notes recorded yet.</p>
        ) : (
          notesList.map((n, i) => (
            <div
              key={n.note_id || i}
              className="p-3 rounded-[8px] bg-surface border border-line text-[13px] space-y-1"
            >
              <div className="flex items-center justify-between text-[13px] text-ink-muted">
                <span className="font-semibold text-ink">{n.author}</span>
                <span className="tabular-nums">
                  {new Date(n.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <p className="text-ink leading-relaxed text-[13px]">{n.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="pt-2 border-t border-line">
        <button
          type="button"
          onClick={() => setShowAuditTrail(!showAuditTrail)}
          className="flex items-center justify-between w-full text-[13px] font-semibold text-ink hover:text-primary transition-colors cursor-pointer py-1"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-ink-muted" />
            <span>Status history ({statusHistoryList.length})</span>
          </div>
          <span className="text-[13px] text-ink-muted font-normal">
            {showAuditTrail ? 'Hide' : 'Show'}
          </span>
        </button>

        {showAuditTrail && (
          <div className="space-y-2 pt-2 border-l-2 border-line ml-2 pl-3">
            {statusHistoryList.length === 0 ? (
              <p className="text-[13px] text-ink-muted italic">No transitions recorded.</p>
            ) : (
              statusHistoryList.map((h, i) => (
                <div key={h.history_id || i} className="text-[13px] space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">
                      {h.from_stage ? `${h.from_stage} → ${h.to_stage}` : `Initial: ${h.to_stage}`}
                    </span>
                    <span className="text-ink-muted tabular-nums">
                      {new Date(h.created_at).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="text-ink-muted">
                    by {h.changed_by}
                    {h.note && <span className="italic text-ink"> — "{h.note}"</span>}
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
