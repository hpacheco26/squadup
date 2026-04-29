import React from "react";
import { Users, UserX, Mail } from "lucide-react";
import theme from "../../theme";

const STATUS_COLORS = {
  in:      { solid: '#5fb088' }, // muted sage
  out:     { solid: '#cf8b90' }, // dusty rose
  pending: { solid: '#a0aab9' }, // soft slate
};

const InvitationBar = ({ inCount, outCount, invitedCount, maxPlayers, t, showHeader = true }) => {
  const total = inCount + outCount + invitedCount;
  if (total === 0) return null;

  const segments = [
    { key: 'in', value: inCount, Icon: Users },
    { key: 'out', value: outCount, Icon: UserX },
    { key: 'pending', value: invitedCount, Icon: Mail },
  ].filter((s) => s.value > 0);

  return (
    <div>
      {showHeader && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px',
        }}>
          <span style={{
            fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px',
            color: theme.textMuted, fontWeight: 500,
          }}>
            {t('invited') || 'Invited'}
          </span>
          <span style={{ fontSize: '0.78rem', color: theme.textSecondary, fontWeight: 500 }}>
            {total}
            {maxPlayers > 0 && (
              <span style={{ color: theme.textMuted }}> · {inCount}/{maxPlayers}</span>
            )}
          </span>
        </div>
      )}

      <div
        role="img"
        aria-label={`${inCount} in, ${outCount} out, ${invitedCount} pending`}
        style={{
          display: 'flex', alignItems: 'stretch',
          height: '22px', borderRadius: '8px',
          overflow: 'hidden',
          background: '#eef0f4',
        }}
      >
        {segments.map((s) => {
          const colors = STATUS_COLORS[s.key];
          return (
            <div
              key={s.key}
              style={{
                flexGrow: s.value,
                flexBasis: 0,
                minWidth: '36px',
                background: colors.solid,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                color: '#fff', fontSize: '0.72rem', fontWeight: 500,
                transition: 'flex-grow 0.3s ease',
              }}
            >
              <s.Icon size={11} color="#fff" strokeWidth={1.75} />
              <span>{s.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InvitationBar;
