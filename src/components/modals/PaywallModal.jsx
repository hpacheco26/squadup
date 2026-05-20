import { useState } from 'react';
import { Lock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useLanguageStore from '../../store/languageStore';

export default function PaywallModal({ isOpen, onClose, onSuccess }) {
    const { purchaseGroupSlot } = useAuthStore();
    const { t } = useLanguageStore();
    const [loading, setLoading] = useState(false);

    const handleBuy = async () => {
        setLoading(true);
        const ok = await purchaseGroupSlot();
        setLoading(false);
        if (ok) {
            onSuccess();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal is-active">
            <div className="modal-background" onClick={onClose} />
            <div className="modal-card" style={{ maxWidth: 360, margin: 'auto' }}>
                <div style={{
                    background: 'var(--c-surface)',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    textAlign: 'center',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <div style={{
                            background: 'var(--c-primary-light)',
                            borderRadius: '50%',
                            padding: '14px',
                            display: 'flex',
                        }}>
                            <Lock size={28} color="var(--c-primary)" />
                        </div>
                    </div>

                    <p style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px', color: 'var(--c-text)' }}>
                        {t('paywallTitle')}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--c-text-muted)', marginBottom: '12px', lineHeight: 1.5 }}>
                        {t('paywallBody')}
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--c-primary)', marginBottom: '24px' }}>
                        {t('paywallPrice')}
                    </p>

                    <button
                        onClick={handleBuy}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: 'var(--c-primary)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            marginBottom: '10px',
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? '...' : t('paywallBuy')}
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--c-text-muted)',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            padding: '4px 8px',
                        }}
                    >
                        {t('paywallCancel')}
                    </button>

                    <p style={{ fontSize: '0.75rem', color: 'var(--c-text-muted)', marginTop: '14px' }}>
                        {t('paywallNote')}
                    </p>
                </div>
            </div>
        </div>
    );
}
