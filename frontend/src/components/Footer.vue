<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-content">
        <!-- Company Info -->
        <div class="footer-section">
          <div class="footer-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" class="logo-icon">
              <path d="M12 2.5c-1.5 0-3 .5-4.2 1.4L3 8l9 5 9-5-4.8-4.1C15 3 13.5 2.5 12 2.5z" fill="currentColor"/>
              <path d="M3 8v8c0 .8.4 1.5 1 1.9L12 22l8-4.1c.6-.4 1-1.1 1-1.9V8l-9 5-9-5z" fill="currentColor" opacity="0.7"/>
            </svg>
            <span class="logo-text">migo.md</span>
          </div>
          <p class="footer-description">
            Ваш надежный спутник в мире путешествий. 
            Находим лучшие туры для незабываемого отдыха.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h3 class="footer-title">Навигация</h3>
          <ul class="footer-links">
            <li><router-link to="/" class="footer-link">Поиск туров</router-link></li>
            <li><router-link to="/bookings" class="footer-link">Мои бронирования</router-link></li>
            <li><router-link to="/about" class="footer-link">О компании</router-link></li>
            <li><router-link to="/contact" class="footer-link">Контакты</router-link></li>
          </ul>
        </div>

        <!-- Support -->
        <div class="footer-section">
          <h3 class="footer-title">Поддержка</h3>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">Помощь</a></li>
            <li><a href="#" class="footer-link">Условия</a></li>
            <li><a href="#" class="footer-link">Конфиденциальность</a></li>
            <li><a href="#" class="footer-link">FAQ</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="footer-section">
          <h3 class="footer-title">Связаться с нами</h3>
          <div class="contact-info">
            <div class="contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>+373 (60) 123-456</span>
            </div>
            <div class="contact-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>info@migo.md</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>&copy; {{ currentYear }} migo.md. Все права защищены.</p>
        </div>
        <div class="footer-social">
          <a href="#" class="social-link" aria-label="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Instagram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.2-3.44-.594-.906-.36-1.653-1.107-2.013-2.013-.394-.992-.594-2.143-.594-3.44s.2-2.448.594-3.44c.36-.906 1.107-1.653 2.013-2.013.992-.394 2.143-.594 3.44-.594s2.448.2 3.44.594c.906.36 1.653 1.107 2.013 2.013.394.992.594 2.143.594 3.44s-.2 2.448-.594 3.44c-.36.906-1.107 1.653-2.013 2.013-.992.394-2.143.594-3.44.594zm7.5-10.403c-.297 0-.54-.242-.54-.54s.242-.54.54-.54.54.242.54.54-.242.54-.54.54zm-3.233 7.663c-1.515 0-2.75-1.235-2.75-2.75s1.235-2.75 2.75-2.75 2.75 1.235 2.75 2.75-1.235 2.75-2.75 2.75z"/>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="Telegram">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-top: 1px solid var(--color-border);
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 1.5rem; /* Такой же padding как у хедера слева-справа */
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1.5fr;
  gap: 3rem;
  margin-bottom: 2rem;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-icon {
  color: var(--color-ocean);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-ocean), var(--color-ocean-light));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: var(--color-text-soft);
  line-height: 1.6;
  max-width: 280px;
}

.footer-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 1rem;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.footer-link {
  color: var(--color-text-soft);
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: var(--color-ocean);
  transform: translateX(4px);
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.contact-item svg {
  color: var(--color-ocean);
  flex-shrink: 0;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.footer-copyright {
  color: var(--color-text-soft);
  font-size: 0.85rem;
}

.footer-social {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-ocean);
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--color-ocean);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .footer-container {
    padding: 2rem 1rem 1rem;
  }
  
  .footer-content {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .footer-description {
    max-width: none;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer-container {
    padding: 1.5rem 0.75rem 1rem;
  }
  
  .footer-content {
    gap: 1.5rem;
  }
}
</style>
