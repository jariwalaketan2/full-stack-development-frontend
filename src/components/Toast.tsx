import { Toaster } from 'react-hot-toast';

export const Toast = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default options
        duration: 3000,
        style: {
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 4px 12px var(--shadow-lg)',
          padding: '12px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        // Success toast
        success: {
          duration: 2500,
          iconTheme: {
            primary: 'var(--success)',
            secondary: 'white',
          },
          style: {
            border: '1px solid var(--success)',
          },
        },
        // Error toast
        error: {
          duration: 4000,
          iconTheme: {
            primary: 'var(--error)',
            secondary: 'white',
          },
          style: {
            border: '1px solid var(--error)',
          },
        },
        // Loading toast
        loading: {
          iconTheme: {
            primary: 'var(--accent)',
            secondary: 'white',
          },
        },
      }}
    />
  );
};
