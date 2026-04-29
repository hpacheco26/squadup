import React from "react";
import { MapPin, CalendarDays } from "lucide-react";
import theme from "../../theme";
import InvitationBar from "../bars/InvitationBar";

const getDayLabel = (dateStr, t) => {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.round((d - today) / 86400000);
  if (diffDays === 0) return (t('today') || 'Today');
  if (diffDays === 1) return (t('tomorrow') || 'Tomorrow');
  if (diffDays > 1 && diffDays < 7) {
    const tpl = t('inDays');
    return tpl ? tpl.replace('{n}', diffDays) : `In ${diffDays} days`;
  }
  return null;
};

const GameCard = ({ game, t, showGroupName = true, backgroundImage }) => {
  const inCount = (game.playersIn || []).length;
  const outCount = (game.playersOut || []).length;
  const invitedCount = (game.playersInvited || []).length;
  const maxPlayers = game.maxPlayers || 0;
  const isFull = maxPlayers > 0 && inCount >= maxPlayers;
  const dayLabel = getDayLabel(game.date, t);
  const accentColor = isFull ? theme.success : theme.primary;

  return (
    <div style={{
      backgroundColor: '#fff',
      backgroundImage: backgroundImage
        ? `linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35)), url(${backgroundImage})`
        : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: `0 7px 18px ${accentColor}26`,
      height: '100%',
      border: `1px solid ${theme.border}`,
    }}>
      <div style={{ padding: 'clamp(10px, 1.8dvh, 16px)' }}>
        {/* Header: group + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          {showGroupName && game.groupName ? (
            <span style={{
              fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
              color: theme.primary, background: theme.primaryLight,
              padding: '3px 8px', borderRadius: '999px',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%',
            }}>
              {game.groupName}
            </span>
          ) : <span />}
          {isFull ? (
            <span style={{
              fontSize: '0.6rem', fontWeight: '700', color: theme.success,
              background: theme.successLight, padding: '3px 8px', borderRadius: '999px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {t('full') || 'Full'}
            </span>
          ) : dayLabel ? (
            <span style={{
              fontSize: '0.6rem', fontWeight: '700', color: theme.warning,
              background: theme.warningLight, padding: '3px 8px', borderRadius: '999px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {dayLabel}
            </span>
          ) : null}
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <MapPin size={16} color={theme.primary} style={{ flexShrink: 0 }} />
          <span style={{
            fontSize: '1.02rem', fontWeight: '700', color: theme.text,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {game.location || 'TBD'}
          </span>
        </div>

        {/* Date & Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <CalendarDays size={13} color={theme.textMuted} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.8rem', color: theme.textSecondary, fontWeight: 600 }}>
            {game.date}
          </span>
          <span style={{ color: theme.border }}>•</span>
          <span style={{ fontSize: '0.8rem', color: theme.textSecondary, fontWeight: 600 }}>
            {game.time || '--:--'}
          </span>
        </div>

        <InvitationBar
          inCount={inCount}
          outCount={outCount}
          invitedCount={invitedCount}
          maxPlayers={maxPlayers}
          t={t}
        />
      </div>
    </div>
  );
};

export default GameCard;
