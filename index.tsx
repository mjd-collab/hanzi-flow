<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
    <title>沐沐小黑板 MuMu Blackboard</title>
    
    <!-- PWA Settings -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#fdfbf7" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="沐沐小黑板" />
    <link rel="apple-touch-icon" href="/icon.png" />

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Domestic Fonts fallback -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
      
      :root {
        --color-paper: #fdfbf7;
        --color-ink: #1a1a1a;
        --color-accent: #c0392b;
      }
      
      body {
        font-family: "Noto Serif SC", "Songti SC", "SimSun", serif;
        background-color: var(--color-paper);
        /* iOS Safe Area fix */
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
        overscroll-behavior: none;
      }

      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

      /* Loading Animation for Splash */
      #splash {
        position: fixed;
        inset: 0;
        background: #fdfbf7;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: opacity 0.5s ease;
      }
      .loader {
        width: 48px;
        height: 48px;
        border: 3px solid #e5e7eb;
        border-radius: 50%;
        display: inline-block;
        position: relative;
        box-sizing: border-box;
        animation: rotation 1s linear infinite;
      }
      .loader::after {
        content: '';  
        box-sizing: border-box;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid;
        border-color: #c0392b transparent;
      }
      @keyframes rotation {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            fontFamily: {
              serif: ['"Noto Serif SC"', '"Songti SC"', '"SimSun"', 'serif'],
              sans: ['system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
              ink: {
                900: '#1a1a1a', 
                800: '#2d2d2d',
                100: '#f5f5f4', 
                50: '#fafaf9',
              },
              paper: '#fdfbf7', 
              accent: '#c0392b', 
            }
          }
        }
      }
    </script>
<script type="importmap">
{
  "imports": {
    "react": "https://esm.sh/react@^19.2.1",
    "react-dom/": "https://esm.sh/react-dom@^19.2.1/",
    "react/": "https://esm.sh/react@^19.2.1/",
    "hanzi-writer": "https://esm.sh/hanzi-writer@^3.7.3",
    "vite": "https://esm.sh/vite@^7.2.7",
    "@vitejs/plugin-react": "https://esm.sh/@vitejs/plugin-react@^5.1.2",
    "cnchar": "https://esm.sh/cnchar@^3.2.6",
    "cnchar-poly": "https://esm.sh/cnchar-poly@^3.2.6",
    "cnchar-radical": "https://esm.sh/cnchar-radical@^3.2.6",
    "cnchar-explain": "https://esm.sh/cnchar-explain@^3.2.6",
    "cnchar-words": "https://esm.sh/cnchar-words@^3.2.6",
    "cnchar-order": "https://esm.sh/cnchar-order@^3.2.6"
  }
}
</script>
</head>
  <body>
    <!-- Splash Screen -->
    <div id="splash">
      <div class="loader"></div>
      <div style="margin-top: 20px; font-family: serif; color: #1a1a1a; letter-spacing: 0.1em;">沐沐小黑板</div>
    </div>

    <div id="root" class="h-full w-full fixed inset-0"></div>
    
    <!-- Vite Entry Point -->
    <script type="module" src="/index.tsx"></script>
    
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/service-worker.js')
            .catch((err) => console.log('SW failed', err));
        });
      }
      window.removeSplash = () => {
        const splash = document.getElementById('splash');
        if(splash) {
          splash.style.opacity = '0';
          setTimeout(() => splash.remove(), 500);
        }
      }
    </script>
  </body>
</html>
