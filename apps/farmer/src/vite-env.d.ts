/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_FRONTEND_URL: string;
  readonly VITE_SLIDE_1: string;
  readonly VITE_SLIDE_2: string;
  readonly VITE_SLIDE_3: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
