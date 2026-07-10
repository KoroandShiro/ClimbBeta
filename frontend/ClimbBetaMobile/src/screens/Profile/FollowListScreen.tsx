/**
 * @file FollowListScreen.tsx
 * @description Ecrã que mostra a lista de seguidores / seguidos.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { getFollowers, getFollowing, followUser, unfollowUser, type UserSearchResult } from '../../services/socialService';

type Tab = 'followers' | 'following';

/**
 * Followers / Following list for a climber, with a two-segment toggle.
 *
 * Reuses the exact row + optimistic follow-toggle pattern from UserSearchScreen, so "follow back"
 * works the same everywhere. Receives { userId, initialTab } via navigation params.
 */
export default function FollowListScreen({ route }: any) {
    const userId: number = route.params?.userId;
    const [tab, setTab] = useState<Tab>(route.params?.initialTab === 'following' ? 'following' : 'followers');
    const [users, setUsers] = useState<UserSearchResult[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (which: Tab) => {
        try {
            setLoading(true);
            const data = which === 'followers' ? await getFollowers(userId) : await getFollowing(userId);
            setUsers(data);
        } catch {
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { load(tab); }, [tab, load]);

    /** Optimistic follow/unfollow toggle (same as UserSearchScreen). */
    const handleToggleFollow = async (targetId: number, currentlyFollowing: boolean) => {
        setUsers((prev) => prev.map((u) => u.id === targetId ? { ...u, isFollowing: !currentlyFollowing } : u));
        try {
            if (currentlyFollowing) await unfollowUser(targetId); else await followUser(targetId);
        } catch {
            setUsers((prev) => prev.map((u) => u.id === targetId ? { ...u, isFollowing: currentlyFollowing } : u));
        }
    };

    const renderUser = ({ item }: { item: UserSearchResult }) => (
        <View style={styles.userCard}>
            <View style={styles.avatarPlaceholder}>
                {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
                ) : (
                    <Text style={styles.avatarText}>{item.username.charAt(0).toUpperCase()}</Text>
                )}
            </View>
            <View style={styles.userInfo}>
                <Text style={styles.username}>@{item.username}</Text>
            </View>
            <TouchableOpacity
                style={[styles.followBtn, item.isFollowing && styles.followingBtn]}
                onPress={() => handleToggleFollow(item.id, item.isFollowing)}
            >
                <Text style={[styles.followText, item.isFollowing && styles.followingText]}>
                    {item.isFollowing ? 'Following' : 'Follow'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.toggle}>
                {(['followers', 'following'] as Tab[]).map((t) => (
                    <TouchableOpacity key={t} style={[styles.toggleBtn, tab === t && styles.toggleBtnActive]} onPress={() => setTab(t)}>
                        <Text style={[styles.toggleText, tab === t && styles.toggleTextActive]}>
                            {t === 'followers' ? 'Followers' : 'Following'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 30 }} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUser}
                    contentContainerStyle={{ padding: 15 }}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            {tab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
                        </Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    toggle: { flexDirection: 'row', backgroundColor: '#e8e8e8', borderRadius: 10, padding: 4, margin: 15 },
    toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    toggleBtnActive: { backgroundColor: '#2E7D32' },
    toggleText: { color: '#555', fontWeight: '600' },
    toggleTextActive: { color: '#fff' },
    userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    avatarPlaceholder: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ccc', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
    avatar: { width: 50, height: 50, borderRadius: 25 },
    avatarText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
    userInfo: { flex: 1 },
    username: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    followBtn: { backgroundColor: '#2E7D32', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    followingBtn: { backgroundColor: '#e0e0e0' },
    followText: { color: '#fff', fontWeight: 'bold' },
    followingText: { color: '#333' },
    emptyText: { textAlign: 'center', color: '#777', marginTop: 30 },
});
