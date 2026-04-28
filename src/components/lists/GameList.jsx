import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { MapPin, CalendarDays, Users, UserX, Mail } from "lucide-react";
import useGroupStore from "../../store/groupStore";
import useAuthStore from "../../store/authStore";
import useGameStore from "../../store/gameStore";
import theme from "../../theme";
import useLanguageStore from '../../store/languageStore';
import fieldImage from "../../assets/field.png";

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

const STATUS_COLORS = {
  in:      { solid: '#5fb088', soft: '#d6ecdf', text: '#2f5f47', label: 'In' },      // muted sage
  out:     { solid: '#cf8b90', soft: '#efd6d9', text: '#7a3a3f', label: 'Out' },     // dusty rose
  pending: { solid: '#a0aab9', soft: '#dde1e9', text: '#4d5663', label: 'Pending' }, // soft slate
};

const InvitationBar = ({ inCount, outCount, invitedCount, maxPlayers, t }) => {
  const total = inCount + outCount + invitedCount;
  if (total === 0) return null;

  const segments = [
    { key: 'in', value: inCount, Icon: Users },
    { key: 'out', value: outCount, Icon: UserX },
    { key: 'pending', value: invitedCount, Icon: Mail },
  ].filter((s) => s.value > 0);

  return (
    <div style={{ marginBottom: '10px' }}>
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

const GameList = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { groups } = useGroupStore();
  const { upcomingGames, subscribeToUpcomingGames } = useGameStore();
  const { t } = useLanguageStore();

  useEffect(() => {
    if (user && groups && groups.length > 0) {
      console.log('[GameList] useEffect subscribing to upcoming, groups:', groups.map(g => g.id));
      const unsub = subscribeToUpcomingGames(groups);
      return unsub;
    }
  }, [user, groups, subscribeToUpcomingGames]);

  console.log('[GameList] render, upcomingGames:', upcomingGames.map(g => ({ id: g.id, groupId: g.groupId })));

  if (!upcomingGames.length) return null;

  return (
    <div>
      <p style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600', marginBottom: '2px', textAlign: 'center' }}>
        {t('upcomingGames')}
      </p>
      <p style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', marginBottom: '4px' }}>
        {t('tapGameToEnter')}
      </p>
      <Swiper
        modules={[Pagination]}
        spaceBetween={15}
        slidesPerView={1.2}
        centeredSlides={true}
        breakpoints={{
          640: { slidesPerView: 2, centeredSlides: true },
          1024: { slidesPerView: 3, centeredSlides: true },
        }}
        pagination={{ clickable: true }}
        style={{ paddingBottom: "30px" }}
      >
        {upcomingGames.map((game) => {
          const inCount = (game.playersIn || []).length;
          const outCount = (game.playersOut || []).length;
          const invitedCount = (game.playersInvited || []).length;
          const maxPlayers = game.maxPlayers || 0;
          const fillPercent = maxPlayers > 0 ? Math.min((inCount / maxPlayers) * 100, 100) : 0;
          const isFull = maxPlayers > 0 && inCount >= maxPlayers;
          const dayLabel = getDayLabel(game.date, t);
          const accentColor = isFull ? theme.success : theme.primary;

          return (
            <SwiperSlide key={game.id} style={{ height: 'auto' }}>
              <div
                onClick={() => navigate(`/pregame/${game.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{
                  backgroundColor: '#fff',
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35)), url(${fieldImage})`,
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
                      <span style={{
                        fontSize: '0.6rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                        color: theme.primary, background: theme.primaryLight,
                        padding: '3px 8px', borderRadius: '999px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%',
                      }}>
                        {game.groupName}
                      </span>
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
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default GameList;
