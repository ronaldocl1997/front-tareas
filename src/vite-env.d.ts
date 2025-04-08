/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    // Puedes agregar más variables aquí según necesites
    // readonly VITE_OTRA_VARIABLE: number;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }