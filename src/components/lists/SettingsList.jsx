/* eslint-disable react-refresh/only-export-components */
import { ChevronRight } from 'lucide-react';

/**
 * iOS-style grouped settings primitives.
 * Use as: <SectionLabel>Group Name</SectionLabel><SettingsGroup><SettingsRow .../>...</SettingsGroup>
 */

export const SectionLabel = ({ children, action }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 0 6px',
    }}>
        <p style={{
            fontSize: '0.7rem', fontWeight: 600, color: 'var(--c-text-secondary)',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: 0, flex: 1, minWidth: 0,
        }}>{children}</p>
        {action && <div style={{ flexShrink: 0, marginLeft: 8 }}>{action}</div>}
    </div>
);

export const SettingsGroup = ({ children, footer }) => (
    <div style={{ marginBottom: 24 }}>
        <div style={{
            background: 'var(--c-surface)',
            borderRadius: 14,
            border: '1px solid var(--c-border)',
            overflow: 'hidden',
        }}>{children}</div>
        {footer && <p style={{ fontSize: '0.7rem', color: 'var(--c-text-muted)', padding: '6px 16px 0', margin: 0 }}>{footer}</p>}
    </div>
);

export const SettingsRow = ({ label, sublabel, children, onClick, danger, icon: Icon, last, chevron = true }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            borderBottom: last ? 'none' : '1px solid var(--c-border)',
            cursor: onClick ? 'pointer' : 'default',
            color: danger ? 'var(--c-danger)' : 'var(--c-text)',
        }}
    >
        {Icon && <Icon size={16} color={danger ? 'var(--c-danger)' : 'var(--c-primary)'} />}
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{label}</p>
            {sublabel && <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: 'var(--c-text-muted)' }}>{sublabel}</p>}
        </div>
        {children}
        {onClick && chevron && <ChevronRight size={16} color="var(--c-border-strong)" />}
    </div>
);

export const settingsInputStyle = {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: '0.9rem', color: 'var(--c-text)', textAlign: 'right',
    minWidth: 0, flex: 1, fontFamily: 'inherit',
};

/** Toggle switch in the row's right slot */
export const SettingsToggle = ({ value, onChange }) => (
    <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(!value); }}
        style={{
            width: 44, height: 24, borderRadius: 12, border: 'none',
            background: value ? 'var(--c-primary)' : '#cbd5e1',
            position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
        }}
    >
        <span style={{
            display: 'block', width: 18, height: 18, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3, transition: 'left 0.2s',
            left: value ? 23 : 3,
        }} />
    </button>
);

/** Equal-width segmented control for the row's right slot */
export const SettingsSegmented = ({ options, value, onChange, fullWidth }) => (
    <div style={{
        display: 'flex', gap: 4,
        padding: 3, borderRadius: 8, background: 'var(--c-surface-hover)',
        width: fullWidth ? '100%' : 'auto',
    }}>
        {options.map(opt => {
            const active = value === opt.value;
            return (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    style={{
                        flex: fullWidth ? 1 : '0 0 auto',
                        padding: '6px 12px', borderRadius: 6, border: 'none',
                        background: active ? 'var(--c-surface)' : 'transparent',
                        color: active ? 'var(--c-text)' : 'var(--c-text-secondary)',
                        fontSize: '0.8rem', fontWeight: active ? 600 : 500,
                        cursor: 'pointer', boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        transition: 'background 0.15s',
                    }}
                >{opt.label}</button>
            );
        })}
    </div>
);
