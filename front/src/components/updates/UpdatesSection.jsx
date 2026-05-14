import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Activity, FileAudio, Plus, Mic } from 'lucide-react';
import { uploadAudio } from '../../api/uploadApi';
import AudioRecorder from '../common/AudioRecorder';

export default function UpdatesSection({ item, onAddUpdate }) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [updateDate, setUpdateDate] = useState(
    () => format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );
  const [audioBlob, setAudioBlob] = useState(null);

  const resetForm = () => {
    setNotes('');
    setUpdateDate(format(new Date(), "yyyy-MM-dd'T'HH:mm"));
    setAudioBlob(null);
    setIsAdding(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload voice note if recorded
      let voiceNoteUrl = '';
      if (audioBlob) {
        const uploadRes = await uploadAudio(audioBlob);
        voiceNoteUrl = uploadRes?.url || '';
      }

      const payload = {
        notes: notes.trim() || undefined,
        createdAt: new Date(updateDate).toISOString(),
        ...(voiceNoteUrl && { voiceNoteUrl }),
      };

      // onAddUpdate wraps apiHandler → returns { data, error }
      const result = await onAddUpdate(payload);

      // Don't reset if the API call failed (error toast already shown by apiHandler)
      if (result && result.error) return;

      resetForm();
    } catch (err) {
      console.error('Failed to add update:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = loading || (!notes.trim() && !audioBlob);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h5 className="flex items-center gap-2 text-sm font-bold text-[var(--color-text)]">
          <Activity className="h-4 w-4 text-[var(--color-primary)]" />
          Updates
        </h5>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition-colors hover:bg-indigo-100"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Update
          </button>
        )}
      </div>

      {/* Add Update Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="mb-4 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm"
        >
          <div className="space-y-3">
            {/* Date & Time */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Date &amp; Time
              </label>
              <input
                type="datetime-local"
                value={updateDate}
                onChange={(e) => setUpdateDate(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--color-border)] bg-slate-50 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What happened? Any progress or blockers?"
                className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-slate-50 px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Voice Note */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                <Mic className="h-3 w-3" />
                Voice Note&nbsp;<span className="font-normal normal-case">(optional)</span>
              </label>
              <AudioRecorder onAudioRecorded={(blob) => setAudioBlob(blob)} />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-[var(--color-border)] pt-2">
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? 'Saving…' : 'Save Update'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Updates list */}
      <div className="space-y-3">
        {!item.updates || item.updates.length === 0 ? (
          <p className="py-2 text-sm italic text-[var(--color-text-muted)]">
            No updates recorded yet.
          </p>
        ) : (
          [...item.updates]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((update, idx) => (
              <div key={update._id || idx} className="flex gap-3">
                {/* Icon */}
                <div className="mt-1 flex-shrink-0">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-indigo-100 bg-indigo-50 text-[var(--color-primary)]">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* Card */}
                <div className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-white px-3 py-2.5 shadow-sm">
                  {/* Timestamp */}
                  <p className="mb-1.5 text-[11px] font-medium text-[var(--color-text-muted)]">
                    {(() => {
                      try {
                        return format(new Date(update.createdAt), 'MMM d, yyyy h:mm a');
                      } catch {
                        return update.createdAt;
                      }
                    })()}
                  </p>

                  {/* Notes */}
                  {update.notes && (
                    <p className="mb-1 text-sm leading-relaxed text-[var(--color-text)] whitespace-pre-wrap">
                      {update.notes}
                    </p>
                  )}

                  {/* Voice note player */}
                  {update.voiceNoteUrl && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-slate-50 p-2">
                      <FileAudio className="h-4 w-4 flex-shrink-0 text-indigo-500" />
                      <audio
                        controls
                        src={update.voiceNoteUrl}
                        className="h-8 w-full max-w-[240px]"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
