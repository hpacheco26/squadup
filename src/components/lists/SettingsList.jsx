import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * iOS-style grouped settings primitives.
 * Use as: <SectionLabel>Group Name</SectionLabel><SettingsGroup><SettingsRow .../>...</SettingsGroup>
 */

export const SectionLabel = ({ children, action }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 16px 6px',
    }}>
        <p style={{
            fontSize: '0.7rem', fontWeight: 600, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.6px',
            margin: 0,
        }}>{children}</p>
        {action}
    </div>
);

export const SettingsGroup = ({ children, footer }) => (
    <div style={{ marginBottom: 24 }}>
        <div style={{
            background: '#fff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
        }}>{children}</div>
        {footer && <p style={{ fontSize: '0.7rem', color: '#94a3b8', padding: '6px 16px 0', margin: 0 }}>{footer}</p>}
    </div>
);

export const SettingsRow = ({ label, sublabel, children, onClick, danger, icon: Icon, last, chevron = true }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 14px',
            borderBottom: last ? 'none' : '1px solid #f1f5f9',
            cursor: onClick ? 'pointer' : 'default',
            color: danger ? '#dc2626' : '#1e293b',
        }}
    >
        {Icon && <Icon size={16} color={danger ? '#dc2626' : '#5b7bb3'} />}
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 500 }}>{label}</p>
            {sublabel && <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#94a3b8' }}>{sublabel}</p>}
        </div>
        {children}
        {onClick && chevron && <ChevronRight size={16} color="#cbd5e1" />}
    </div>
);

export const settingsInputStyle = {
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: '0.9rem', color: '#1e293b', textAlign: 'right',
    minWidth: 0, flex: 1, fontFamily: 'inherit',
};

/** Toggle switch in the row's right slot */
export const SettingsToggle = ({ value, onChange }) => (
    <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onChange(!value); }}
        style={{
            width: 44, height: 24, borderRadius: 12, border: 'none',
            background: value ? '#5b7bb3' : '#cbd5e1',
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
        padding: 3, borderRadius: 8, background: '#f1f5f9',
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
                        background: active ? '#fff' : 'transparent',
                        color: active ? '#1e293b' : '#64748b',
                        fontSize: '0.8rem', fontWeight: active ? 600 : 500,
                        cursor: 'pointer', boxShadow: active ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                        transition: 'background 0.15s',
                    }}
                >{opt.label}</button>
            );
        })}
    </div>
);
