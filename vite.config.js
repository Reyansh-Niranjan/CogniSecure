import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: true
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Separate Firebase SDK into its own chunk
                    'firebase': [
                        'firebase/app',
                        'firebase/auth',
                        'firebase/firestore',
                        'firebase/functions',
                        'firebase/storage',
                        'firebase/messaging'
                    ],
                    // Separate React libraries
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                }
            }
        }
    }
})
