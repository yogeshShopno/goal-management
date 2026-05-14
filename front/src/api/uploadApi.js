import axiosInstance from './axiosInstance';

export async function uploadAudio(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice-note.webm');

  const { data } = await axiosInstance.post('/upload/audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return data.data; // { url: '...' }
}
