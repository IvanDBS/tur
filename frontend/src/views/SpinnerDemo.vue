<template>
  <div class="spinner-demo">
    <h1>Демо анимации</h1>
    
    <section class="plane-demo">
      <h2>Самолетики</h2>
      <div class="planes-container">
        <div class="brand-spinner"></div>
        <div class="blue-spinner"></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.spinner-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  text-align: center;
  color: var(--color-text);
  margin-bottom: 3rem;
}



.plane-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  margin: 2rem 0;
}

.plane-demo h2 {
  color: var(--color-text);
  margin-bottom: 2rem;
  text-align: center;
}

.planes-container {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 2rem;
}





@keyframes rotate {
  to {
    transform: rotate(360deg);
  }
}

.brand-spinner {
  position: relative;
  margin-left: 100px;
  border-top: 3px solid #1A3C61;      /* тёмно-синий */
  border-bottom: 0;
  border-left: 3px solid #1A3C61;     /* тёмно-синий */
  border-right: 3px solid transparent;
  animation: rotate 1.6s linear infinite;
  height: 54px;
  width: 54px;
  border-radius: 50%;
}

.brand-spinner::before {
  content: '';
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23FF5A5F' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 11.6C20 10.96 19.44 10.4 18.8 10.4H14.4L10.4 4H8.8L10.8 10.4H6.4L5.2 8.8H4L4.8 11.6L4 14.4H5.2L6.4 12.8H10.8L8.8 19.2H10.4L14.4 12.8H18.8C19.44 12.8 20 12.24 20 11.6Z'/%3E%3C/svg%3E%0A");
  display: block;
  background-size: 30px;
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  z-index: 999;
  top: -19px;
  left: 19px;
  width: 100%;
  height: 100%;
  text-align: center;
  transform: rotate(41deg);
}

.blue-spinner {
  position: relative;
  margin-left: 100px;
  border-top: 3px solid #A7D8F0;      /* голубой */
  border-bottom: 0;
  border-left: 3px solid #A7D8F0;     /* голубой */
  border-right: 3px solid transparent;
  animation: rotate 1.6s linear infinite;
  height: 54px;
  width: 54px;
  border-radius: 50%;
}

.blue-spinner::before {
  content: '';
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='%23FF5A5F' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 11.6C20 10.96 19.44 10.4 18.8 10.4H14.4L10.4 4H8.8L10.8 10.4H6.4L5.2 8.8H4L4.8 11.6L4 14.4H5.2L6.4 12.8H10.8L8.8 19.2H10.4L14.4 12.8H18.8C19.44 12.8 20 12.24 20 11.6Z'/%3E%3C/svg%3E%0A");
  display: block;
  background-size: 30px;
  background-repeat: no-repeat;
  background-position: center;
  position: absolute;
  z-index: 999;
  top: -19px;
  left: 19px;
  width: 100%;
  height: 100%;
  text-align: center;
  transform: rotate(41deg);
}
</style>
