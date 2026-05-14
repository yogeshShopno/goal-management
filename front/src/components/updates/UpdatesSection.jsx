import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { MessageSquare, User, Activity, FileAudio, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAppContext } from '../../context/AppContext';
import { userDisplayName } from '../../utils/userDisplay';
import AudioRecorder from './AudioRecorder';
import { uploadAudio } from '../../api/uploadApi';

export default function UpdatesSection({ item, type, onAddUpdate }) {
  const { state } = useAppContext();
  const { currentUser } = useAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [notes, setNotes] = useState('');
  const [actionText, setActionText] = useState('');
  const [audioBlob, setAudioBlob] = useState(null);

  // Combine users and staff for the dropdown
  const allAssignees = [
    ...state.users.map(u => ({ ...u, _type: 'user' })),
    ...(state.staff || []).map(s => ({ ...s, _type: 'staff' }))
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let voiceNoteUrl = '';

      if (audioBlob) {
        const uploadRes = await uploadAudio(audioBlob);
        voiceNoteUrl = uploadRes.url;
      }

      let assignedUserId = null;
      let assignedStaffId = null;

      if (assigneeId) {
        const [id, type] = assigneeId.split('::');
        if (type === 'user') assignedUserId = id;
        else assignedStaffId = id;
      }

      const payload = {
        assignedUserId,
        assignedStaffId,
        notes,
        actionText,
        ...(voiceNoteUrl && { voiceNoteUrl })
      };

      await onAddUpdate(payload);
      
      // Reset form
      setAssigneeId('');
      setNotes('');
      setActionText('');
      setAudioBlob(null);
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add update:', err);
      alert('Failed to add update. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAssigneeDetails = (update) => {
    if (update.assignedUserId) {
      return {
        name: userDisplayName(update.assignedUserId, state.users),
        type: 'User'
      };
    }
    if (update.assignedStaffId) {
      return {
        name: userDisplayName(update.assignedStaffId, state.staff),
        type: 'Staff'
      };
    }
    return null;
  };

  return (
    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--color-primary)]" />
          Updates & Logs
        </h5>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-[var(--color-primary)] text-xs font-semibold hover:bg-indigo-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Update
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-[var(--color-border)] mb-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">
                Assign Person
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              >
                <option value="">-- None --</option>
                {allAssignees.map(a => (
                  <option key={a.id} value={`${a.id}::${a._type}`}>
                    {a.name || a.username} ({a._type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">
                Update Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="What happened?"
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-1 uppercase tracking-wider">
                Action Taken
              </label>
              <input
                type="text"
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="What action was taken?"
                className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>

            {type === 'task' && (
              <div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider">
                  Voice Note
                </label>
                <AudioRecorder onAudioRecorded={(blob) => setAudioBlob(blob)} />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (!notes && !actionText && !audioBlob)}
                className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-bold text-[var(--color-card)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Update'}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {(!item.updates || item.updates.length === 0) ? (
          <p className="text-sm text-[var(--color-text-muted)] italic">No updates recorded yet.</p>
        ) : (
          [...item.updates].reverse().map((update, idx) => {
            const assignee = getAssigneeDetails(update);
            
            return (
              <div key={update._id || idx} className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[var(--color-text-muted)]">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 bg-white border border-[var(--color-border)] p-3 rounded-xl shadow-sm">
                  <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                    {assignee ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)]">
                        <User className="h-3 w-3" />
                        {assignee.name}
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-[10px] rounded-md font-medium text-indigo-500 uppercase tracking-wide">
                          {assignee.type}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Unassigned</span>
                    )}
                    <span className="text-xs font-medium text-[var(--color-text-muted)]">
                      {format(new Date(update.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  
                  {update.notes && (
                    <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap mb-2">
                      {update.notes}
                    </p>
                  )}
                  
                  {update.actionText && (
                    <div className="flex items-center gap-2 mb-2 text-sm font-medium text-[var(--color-text)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"></div>
                      <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wide font-bold">Action:</span> {update.actionText}
                    </div>
                  )}

                  {update.voiceNoteUrl && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-[var(--color-border)]">
                      <FileAudio className="h-4 w-4 text-indigo-500" />
                      <audio controls src={update.voiceNoteUrl} className="h-8 max-w-[220px]" />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
