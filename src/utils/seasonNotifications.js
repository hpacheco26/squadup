export function seasonMarkerKey(uid, groupId) {
    return `season:lastSeen:${uid}:${groupId}`;
}

export function unseenSeason(group, marker) {
    const current = group?.seasonNumber ?? 0;
    if (current <= 0) return null;
    return marker !== null && Number(marker) >= current ? null : current - 1;
}
