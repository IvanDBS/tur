<template>
  <div class="loading-spinner">
    <!-- Вариант 1: Самолетик летит по кругу -->
    <div v-if="variant === 'circle'" class="airplane-loader circle">
      <svg class="airplane" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
      </svg>
    </div>

    <!-- Вариант 2: Самолетик качается -->
    <div v-else-if="variant === 'rock'" class="airplane-loader rock">
      <svg class="airplane" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
      </svg>
    </div>

    <!-- Вариант 3: Самолетик летит вверх-вниз -->
    <div v-else-if="variant === 'bounce'" class="airplane-loader bounce">
      <svg class="airplane" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
      </svg>
    </div>

          <!-- Вариант 4: Самолетик летит по восьмерке -->
      <div v-else-if="variant === 'figure8'" class="airplane-loader figure8">
        <svg class="airplane" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
        </svg>
      </div>

      <!-- Вариант 5: Самолетик летит вокруг земной оси -->
      <div v-else-if="variant === 'earth-axis'" class="airplane-loader earth-axis">
        <svg class="airplane" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
        </svg>
      </div>

      <!-- Вариант 6: Самолетик с пунктирным кругом -->
      <div v-else-if="variant === 'dashed-circle'" class="airplane-loader dashed-circle">
        <div class="plane-circle"></div>
      </div>

      <!-- Вариант по умолчанию: Самолетик летит горизонтально -->
      <div v-else class="airplane-loader horizontal">
        <svg class="airplane" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
        </svg>
      </div>

    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'horizontal' | 'circle' | 'rock' | 'bounce' | 'figure8' | 'earth-axis' | 'dashed-circle'
  text?: string
  size?: 'small' | 'medium' | 'large'
}

withDefaults(defineProps<Props>(), {
  variant: 'horizontal',
  text: '',
  size: 'medium'
})
</script>

<style scoped>
.loading-spinner {
  text-align: center;
  padding: 2rem;
}

.loading-text {
  margin-top: 1rem;
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.airplane-loader {
  margin: 0 auto 1rem;
  position: relative;
}

.airplane-loader.small {
  width: 32px;
  height: 32px;
}

.airplane-loader.medium {
  width: 48px;
  height: 48px;
}

.airplane-loader.large {
  width: 64px;
  height: 64px;
}

.airplane {
  width: 100%;
  height: 100%;
  color: var(--color-secondary);
  transform-origin: center;
}

/* Горизонтальный полет (по умолчанию) */
.airplane-loader.horizontal .airplane {
  animation: fly-horizontal 2s ease-in-out infinite;
}

@keyframes fly-horizontal {
  0% {
    transform: rotate(0deg) translateX(0px);
  }
  25% {
    transform: rotate(15deg) translateX(5px);
  }
  50% {
    transform: rotate(0deg) translateX(10px);
  }
  75% {
    transform: rotate(-15deg) translateX(5px);
  }
  100% {
    transform: rotate(0deg) translateX(0px);
  }
}

/* Полет по кругу */
.airplane-loader.circle .airplane {
  animation: fly-circle 3s linear infinite;
}

@keyframes fly-circle {
  0% {
    transform: rotate(0deg) translateX(20px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(20px) rotate(-360deg);
  }
}

/* Качание */
.airplane-loader.rock .airplane {
  animation: rock 1.5s ease-in-out infinite;
}

@keyframes rock {
  0%, 100% {
    transform: rotate(-15deg);
  }
  50% {
    transform: rotate(15deg);
  }
}

/* Прыжки вверх-вниз */
.airplane-loader.bounce .airplane {
  animation: bounce 1.5s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Полет по восьмерке */
.airplane-loader.figure8 .airplane {
  animation: figure8 4s ease-in-out infinite;
}

@keyframes figure8 {
  0% {
    transform: translateX(-10px) translateY(0px) rotate(0deg);
  }
  25% {
    transform: translateX(0px) translateY(-10px) rotate(90deg);
  }
  50% {
    transform: translateX(10px) translateY(0px) rotate(180deg);
  }
  75% {
    transform: translateX(0px) translateY(10px) rotate(270deg);
  }
  100% {
    transform: translateX(-10px) translateY(0px) rotate(360deg);
  }
}

/* Полет вокруг земной оси */
.airplane-loader.earth-axis .airplane {
  animation: earth-axis 3s linear infinite;
}

@keyframes earth-axis {
  0% {
    transform: rotate(0deg) translateX(8px) rotate(0deg);
  }
  100% {
    transform: rotate(360deg) translateX(8px) rotate(-360deg);
  }
}

/* Самолетик с пунктирным кругом */
.airplane-loader.dashed-circle {
  position: relative;
  display: inline-block;
}

.airplane-loader.dashed-circle .plane-circle {
  position: relative;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  border: 3px dashed var(--color-secondary);
  margin: 0 auto;
}

.airplane-loader.dashed-circle .plane-circle::before {
  content: '✈️';
  display: block;
  font-size: 24px;
  line-height: 24px;
  position: absolute;
  z-index: 999;
  top: -12px;
  left: -12px;
  width: 84px;
  height: 84px;
  text-align: center;
  vertical-align: top;
  animation: plane-spinner 2s linear infinite;
}

@keyframes plane-spinner {
  0% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(450deg);
    visibility: hidden;
  }
  100% {
    transform: rotate(810deg);
    visibility: hidden;
  }
}
</style>
