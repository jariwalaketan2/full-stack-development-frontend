import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  type?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onRetry,
  retryLabel = 'Try Again',
  type = 'error',
}) => {
  const colors = {
    error: {
      bg: '#FEE',
      border: '#F44336',
      text: '#C62828',
      icon: '❌',
    },
    warning: {
      bg: '#FFF3E0',
      border: '#FF9800',
      text: '#E65100',
      icon: '⚠️',
    },
    info: {
      bg: '#E3F2FD',
      border: '#2196F3',
      text: '#1565C0',
      icon: 'ℹ️',
    },
  };

  const style = colors[type];

  return (
    <div
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0',
      }}
      role="alert"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '24px', flexShrink: 0 }}>{style.icon}</span>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: style.text,
              marginBottom: '8px',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: style.text,
              lineHeight: '1.6',
              marginBottom: onRetry ? '16px' : 0,
            }}
          >
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '8px 16px',
                background: style.border,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
