import { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';

export default function AudioRecorder({ onAudioRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onAudioRecorded) {
          onAudioRecorded(audioBlob);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const clearAudio = () => {
    setAudioUrl(null);
    if (onAudioRecorded) {
      onAudioRecorded(null);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm font-medium"
        >
          <Mic className="h-4 w-4" />
          Record Voice Note
        </button>
      )}

      {isRecording && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-rose-500 font-medium text-sm animate-pulse">
            <div className="h-2 w-2 rounded-full bg-rose-500"></div>
            Recording...
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors text-sm font-medium"
          >
            <Square className="h-4 w-4" />
            Stop
          </button>
        </div>
      )}

      {audioUrl && !isRecording && (
        <div className="flex items-center gap-3 bg-indigo-50/50 p-1.5 rounded-full border border-indigo-100 pr-3">
          <audio controls src={audioUrl} className="h-8 max-w-[200px]" />
          <button
            type="button"
            onClick={clearAudio}
            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
            title="Remove recording"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
