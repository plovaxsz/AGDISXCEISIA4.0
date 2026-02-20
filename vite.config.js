import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': Object.fromEntries(
      Object.entries(process.env).filter(([key]) => key.startsWith('VITE_'))
    )
  }
});