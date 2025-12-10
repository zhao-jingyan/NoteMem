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
  let gainNode: GainNode | null = null;
  let analyser: AnalyserNode | null = null;
  let animationFrameId: number | null = null;
  let detectPitch: ((signal: Float32Array) => number | null) | null = null;
  const bufferLength = 4096;
  const dataArray = new Float32Array(bufferLength);
  const GAIN_VALUE = 3.0; // 增益倍数，可根据需要调整（1.0 = 无增益，3.0 = 3倍增益）
  
  // Gate 参数
  const GATE_THRESHOLD = 0.01; // 音量阈值（0-1之间，可根据实际调整）
  const GATE_HOLD_TIME = 100; // Gate关闭后保持输出的时间（毫秒）
  let gateOpenTime = 0; // Gate打开的时间戳
  let lastValidNote: NoteInfo | null = null; // 最后一次有效的音符信息

  // 计算音频信号音量（RMS - Root Mean Square）
  const calculateRMS = (audioData: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  };

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

      // 创建音频源、增益节点和分析器
      audioSource = audioCtx.createMediaStreamSource(stream);
      gainNode = audioCtx.createGain();
      gainNode.gain.value = GAIN_VALUE; // 设置增益值
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = bufferLength * 2;
      analyser.smoothingTimeConstant = 0.8;
      
      // 连接音频链路：audioSource -> gainNode -> analyser
      audioSource.connect(gainNode);
      gainNode.connect(analyser);

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
    
    // 计算音频音量（RMS）
    const rms = calculateRMS(dataArray);
    const now = Date.now();
    
    // Gate 逻辑：只有当音量超过阈值时，才检测音高
    if (rms > GATE_THRESHOLD) {
      // Gate 打开，更新打开时间
      gateOpenTime = now;
      
      // 使用 pitchfinder 检测音高
      const frequency = detectPitch(dataArray);
      
      if (frequency && !isNaN(frequency) && isFinite(frequency)) {
        // 应用平滑处理
        const smoothFreq = getSmoothedFrequency(frequency);
        currentFrequency.value = smoothFreq;
        
        // 转换数据供 UI 使用
        if (smoothFreq > 0) {
          const note = getNoteFromFrequency(smoothFreq);
          currentNote.value = note;
          lastValidNote = note; // 保存最后一次有效的音符
        } else {
          currentNote.value = { note: '-', octave: 0, centsOff: 0, frequency: 0 };
          currentFrequency.value = 0;
        }
      } else {
        // 检测失败，但如果之前有有效音符，保持它
        if (lastValidNote) {
          currentNote.value = lastValidNote;
        } else {
          currentNote.value = { note: '-', octave: 0, centsOff: 0, frequency: 0 };
          currentFrequency.value = 0;
        }
      }
    } else {
      // Gate 关闭，但如果在保持时间内，继续输出上次有效音符
      const timeSinceGateClose = now - gateOpenTime;
      
      if (timeSinceGateClose < GATE_HOLD_TIME && lastValidNote) {
        // 在保持时间内，继续显示上次的有效音符
        currentNote.value = lastValidNote;
      } else {
        // 超过保持时间，清空显示
        currentNote.value = { note: '-', octave: 0, centsOff: 0, frequency: 0 };
        currentFrequency.value = 0;
        lastValidNote = null;
      }
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
    
    if (gainNode) {
      gainNode.disconnect();
      gainNode = null;
    }
    
    analyser = null;
    detectPitch = null;
    frequencyBuffer.length = 0; // 清空缓冲区
    lastValidNote = null; // 清空最后有效音符
    gateOpenTime = 0; // 重置 gate 时间
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
