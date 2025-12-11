<template>
  <div class="w-full overflow-x-auto">
    <svg viewBox="0 0 1000 280" class="w-full h-auto bg-gray-900 rounded-lg shadow-xl">
      <!-- 上琴枕 (Nut) - 白色矩形，位于指板最左侧 -->
      <rect 
        x="0" 
        y="10" 
        width="12" 
        height="260" 
        fill="white" 
        stroke="#ddd" 
        stroke-width="1"
      />
      
      <g v-for="i in 24" :key="`fret-${i}`">
        <line 
          :x1="calcFretPos(i)" y1="10" 
          :x2="calcFretPos(i)" y2="270" 
          stroke="#888" stroke-width="2" 
        />
        <!-- 12品之前的品点标记 (3, 5, 7, 9) -->
        <circle v-if="[3,5,7,9].includes(i)" :cx="calcFretCenter(i)" cy="140" r="5" fill="#555" />
        <!-- 12品的双品点标记 -->
        <g v-if="i === 12">
            <circle :cx="calcFretCenter(i)" cy="100" r="5" fill="#555" />
            <circle :cx="calcFretCenter(i)" cy="180" r="5" fill="#555" />
        </g>
        <!-- 12品之后的品点标记 (15, 17, 19) -->
        <circle v-if="[15,17,19].includes(i)" :cx="calcFretCenter(i)" cy="140" r="5" fill="#555" />
      </g>

      <g v-for="(_, index) in 6" :key="`str-${index}`">
        <line 
          x1="0" :y1="stringY(index)" 
          x2="1000" :y2="stringY(index)" 
          :stroke="index === activeStringIndex ? '#eab308' : '#ccc'" 
          :stroke-width="1 + index * 0.5" 
          class="transition-colors duration-300"
        />
      </g>

      <circle 
        v-if="userDetectedFret >= 0"
        :cx="calcFretCenter(userDetectedFret)" 
        :cy="stringY(activeStringIndex)" 
        r="12" 
        fill="rgba(34, 197, 94, 0.8)"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
// Props 接收父组件的游戏状态
defineProps<{
  activeStringIndex: number; // 当前题目指定的弦 (0-5)
  userDetectedFret: number;  // 用户当前弹到的品位 (-1 表示未检测到)
}>();

// 计算品位距离 (基于吉他 17.817 常数)
const calcFretPos = (n: number) => {
    const scaleLen = 1300;
    return scaleLen - (scaleLen / Math.pow(2, n / 12));
}

// 计算品位中间位置 (用于放圆点)
const calcFretCenter = (n: number) => {
    if (n === 0) return 10; // 空弦
    const prev = calcFretPos(n - 1);
    const curr = calcFretPos(n);
    return prev + (curr - prev) / 2;
}

const stringY = (index: number) => 40 + index * 40;
</script>

