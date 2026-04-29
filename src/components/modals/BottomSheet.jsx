import React from 'react';

/**
 * Slide-up bottom sheet primitive. Shared across the app.
 * Renders a backdrop + rounded white panel anchored to the bottom of the viewport.
 */
export const BottomSheet = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, zIndex: 200,
                background: 'rgba(15,23,42,0.45)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: 640,
                    background: '#fff',
                    borderTopLeftRadius: 20, borderTopRightRadius: 20,
                    padding: '8px 16px calc(20px + env(safe-area-inset-bottom))',
                    boxShadow: '0 -10px 30px rgba(15,23,42,0.18)',
                }}
            >
                <div style={{ width: 36, height: 4, borderRadius: 999, background: '#e2e8f0', margin: '4px auto 12px' }} />
                {title && (
                    <div style={{
                        fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: 14,
                    }}>{title}</div>
                )}
                {children}
            </div>
        </div>
    );
};

/**
 * Confirmation sheet — Cancel + destructive action side-by-side.
 * Uses the app's muted coral (#e57373) for the destructive action.
 */
export const ConfirmSheet = ({
    open, onClose, onConfirm, title, confirmLabel, cancelLabel = 'Cancel', busy,
}) => (
    <BottomSheet open={open} onClose={() => !busy && onClose()} title={title}>
        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
                type="button"
                disabled={busy}
                onClick={onClose}
                style={{
                    flex: 1, padding: '13px', borderRadius: 12,
                    border: '1px solid #e2e8f0', background: '#fff',
                    color: '#1e293b', fontSize: '0.95rem', fontWeight: 600,
                    cursor: busy ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
            >
                {cancelLabel}
            </button>
            <button
                type="button"
                disabled={busy}
                onClick={onConfirm}
                style={{
                    flex: 1, padding: '13px', borderRadius: 12,
                    border: 'none', background: '#e57373',
                    color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(229,115,115,0.28)',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    opacity: busy ? 0.7 : 1, fontFamily: 'inherit',
                }}
            >
                {confirmLabel}
            </button>
        </div>
    </BottomSheet>
);

export default BottomSheet;
