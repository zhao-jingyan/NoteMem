import { ref, onUnmounted } from 'vue';
import { YIN } from 'pitchfinder';
import { getNoteFromFrequency } from '../utils/noteUtils';
import { NoteInfo } from '../types';
import { useAudioContext } from './useAudioContext';

export function usePitchDetector() {
  const { initAudioContext, getMicrophone, cleanup, audioContext } = useAudioContext();
  
  const isListening = ref(false);
  const currentFrequency = ref(0);
  const currentNote = ref<NoteInfo>({ note: '-', octave: 0, centsOff: 0, frequency: 0 });
  
  // 平滑队列
  const bufferSize = 5;
  const frequencyBuffer: number[] = [];

  let audioSource: MediaStreamAudioSourceNode | null = null;
  let analyser: AnalyserNode | null = null;
  let animationFrameId: number | null = null;
  let detectPitch: ((signal: Float32Array) => number | null) | null = null;
  const bufferLength = 4096;
  const dataArray = new Float32Array(bufferLength);

  // 核心：平滑算法 (中值滤波 + 移动平均)
  const getSmoothedFrequency = (freq: number): number => {
    // 1. 过滤掉无效、过低或过高的频率
    // 贝斯最低音 E1 约 41Hz，吉他最高音（24品）约 1300Hz
    // 设置合理范围：40Hz - 2000Hz
    if (!freq || freq < 40 || freq > 2000) return 0;

    frequencyBuffer.push(freq);
    if (frequencyBuffer.length > bufferSize) {
      frequencyBuffer.shift();
    }

    // 2. 中值滤波：排序后取中间值，消除突变噪点
    const sorted = [...frequencyBuffer].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];

    return median;
  };

  const startListening = async () => {
    try {
      const audioCtx = await initAudioContext();
      const stream = await getMicrophone();

      // 获取实际的采样率（通常是 44100 或 48000）
      const sampleRate = audioCtx.sampleRate;
      console.log('AudioContext sampleRate:', sampleRate);
      
      // 使用实际采样率初始化 YIN 算法
      detectPitch = YIN({ sampleRate });

      // 创建音频源和分析器
      audioSource = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = bufferLength * 2;
      analyser.smoothingTimeConstant = 0.8;
      
      audioSource.connect(analyser);

      isListening.value = true;
      processAudio();
    } catch (error) {
      console.error('启动音频监听失败:', error);
      throw error;
    }
  };

  const processAudio = () => {
    if (!isListening.value || !analyser || !audioContext.value || !detectPitch) return;

    analyser.getFloatTimeDomainData(dataArray);
    
    // 使用 pitchfinder 检测音高
    const frequency = detectPitch(dataArray);
    
    if (frequency && !isNaN(frequency) && isFinite(frequency)) {
      // 应用平滑处理
      const smoothFreq = getSmoothedFrequency(frequency);
      currentFrequency.value = smoothFreq;
      
      // 转换数据供 UI 使用
      if (smoothFreq > 0) {
        currentNote.value = getNoteFromFrequency(smoothFreq);
      } else {
        currentNote.value = { note: '-', octave: 0, centsOff: 0, frequency: 0 };
        currentFrequency.value = 0;
      }
    } else {
      currentNote.value = { note: '-', octave: 0, centsOff: 0, frequency: 0 };
      currentFrequency.value = 0;
    }

    // 继续处理
    animationFrameId = requestAnimationFrame(processAudio);
  };

  const stopListening = () => {
    isListening.value = false;
    
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    
    if (audioSource) {
      audioSource.disconnect();
      audioSource = null;
    }
    
    analyser = null;
    detectPitch = null;
    frequencyBuffer.length = 0; // 清空缓冲区
    cleanup();
  };

  onUnmounted(() => {
    stopListening();
  });

  return {
    startListening,
    stopListening,
    isListening,
    currentNote, // 响应式数据，UI 直接绑定这个
    currentFrequency
  };
}
