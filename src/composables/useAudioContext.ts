import { ref, onUnmounted } from 'vue';

export function useAudioContext() {
  const audioContext = ref<AudioContext | null>(null);
  const micStream = ref<MediaStream | null>(null);

  const initAudioContext = async (): Promise<AudioContext> => {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // 如果 AudioContext 被暂停，需要恢复
    if (audioContext.value.state === 'suspended') {
      await audioContext.value.resume();
    }
    
    return audioContext.value;
  };

  const getMicrophone = async (): Promise<MediaStream> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('浏览器不支持麦克风访问');
    }

    micStream.value = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      } 
    });
    
    return micStream.value;
  };

  const stopMicrophone = () => {
    micStream.value?.getTracks().forEach(track => track.stop());
    micStream.value = null;
  };

  const closeAudioContext = () => {
    audioContext.value?.close();
    audioContext.value = null;
  };

  const cleanup = () => {
    stopMicrophone();
    closeAudioContext();
  };

  onUnmounted(() => {
    cleanup();
  });

  return {
    audioContext,
    micStream,
    initAudioContext,
    getMicrophone,
    stopMicrophone,
    closeAudioContext,
    cleanup
  };
}

