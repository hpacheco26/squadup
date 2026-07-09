import PropTypes from 'prop-types';
import useLanguageStore from '../store/languageStore';

/**
 * Fallback UI rendered by the top-level Sentry ErrorBoundary in main.jsx when an
 * uncaught render error would otherwise white-screen the app. Sentry.ErrorBoundary
 * already reports the error + component stack before rendering this.
 */
const ErrorFallback = ({ resetError }) => {
    const { t } = useLanguageStore();

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '100dvh', padding: 24, textAlign: 'center', gap: 12, background: 'var(--c-bg)',
        }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--c-text)', margin: 0 }}>
                {t('somethingWentWrong') || 'Something went wrong'}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--c-text-muted)', margin: 0, maxWidth: 320 }}>
                {t('unexpectedErrorHint') || 'An unexpected error occurred. You can try again or reload the app.'}
            </p>
            <button
                type="button"
                className="btn-primary"
                onClick={() => {
                    resetError();
                    window.location.href = '/';
                }}
                style={{
                    marginTop: 8, padding: '12px 24px', borderRadius: 12, border: 'none',
                    background: 'var(--c-primary)', color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                    cursor: 'pointer',
                }}
            >
                {t('goHome') || 'Go Home'}
            </button>
        </div>
    );
};

ErrorFallback.propTypes = {
    resetError: PropTypes.func.isRequired,
};

export default ErrorFallback;
