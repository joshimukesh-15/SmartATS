import { Button } from '../../components/ui/Button';

export default function ReviewNotesTimeline({
  candidate,
  newNote,
  setNewNote,
  onAddNote,
  isAddingNote = false,
}) {
  if (!candidate) return null;

  const notesList = candidate.notes || [];
  const statusHistoryList = candidate.status_history || [];

  return (
    <div className="space-y-4">
      {/* Add Note Form */}
      <form onSubmit={onAddNote} className="space-y-2">
        <textarea
          placeholder="Add recruiter interview feedback or screening note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          className="w-full p-3 text-[13px] rounded-[10px] border border-line bg-surface text-ink placeholder:text-ink-subtle focus:outline-hidden focus:ring-2 focus:ring-primary"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!newNote.trim() || isAddingNote}
          >
            {isAddingNote ? 'Saving...' : 'Add Note'}
          </Button>
        </div>
      </form>

      {/* Notes list */}
      <div className="space-y-2.5">
        {notesList.map((n, i) => (
          <div
            key={n.note_id || i}
            className="p-3.5 rounded-[10px] bg-surface border border-line space-y-1 text-[13px]"
          >
            <div className="flex items-center justify-between text-[13px] text-ink-subtle">
              <span className="font-semibold text-ink">{n.author}</span>
              <span className="tabular-nums">
                {new Date(n.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-ink leading-relaxed">{n.content}</p>
          </div>
        ))}
      </div>

      {/* Stage History */}
      {statusHistoryList.length > 0 && (
        <div className="pt-3 border-t border-line space-y-2">
          <span className="text-[13px] font-semibold text-ink-muted uppercase tracking-wider">
            Stage History Audit
          </span>
          <div className="space-y-2 text-[13px]">
            {statusHistoryList.map((h, i) => (
              <div
                key={h.history_id || i}
                className="flex items-center justify-between text-ink-muted"
              >
                <span>
                  Stage changed from <strong className="text-ink">{h.from_stage}</strong>{' '}
                  to <strong className="text-ink">{h.to_stage}</strong>
                </span>
                <span className="tabular-nums text-ink-subtle">
                  {new Date(h.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
