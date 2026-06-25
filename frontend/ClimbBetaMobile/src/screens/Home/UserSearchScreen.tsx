import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchUsers, followUser, unfollowUser, type UserSearchResult } from '../../services/socialService';

/**
 * Global application climber discovery portal.
 *
 * Provides an interface for profile lookups utilizing automated debounce mechanisms
 * to throttle back-end API querying overhead during continuous keyboard streams.
 */
export default function UserSearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<UserSearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    /**
     * Debounced lookup effect evaluating search query strings.
     * Fires requests only when the user halts input actions for more than 500ms
     * and guarantees a minimum character evaluation threshold.
     */
    useEffect(() => {
        const fetchUsers = async () => {
            if (searchQuery.trim().length < 2) {
                setUsers([]);
                return;
            }

            setLoading(true);
            try {
                const results = await searchUsers(searchQuery);
                setUsers(results);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        };

        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    /**
     * Toggles the connection status between the user and a target climber.
     * Performs an optimistic local state update to ensure interface responsiveness
     * and rolls back changes transparently if network errors trigger failure.
     *
     * @param {number} userId - The target profile identifier to establish connections with.
     * @param {boolean} currentlyFollowing - Current structural follow state.
     */
    const handleToggleFollow = async (userId: number, currentlyFollowing: boolean) => {
        // Optimistic mutation path
        setUsers(prevUsers =>
            prevUsers.map(u => u.id === userId ? { ...u, isFollowing: !currentlyFollowing } : u)
        );

        try {
            if (currentlyFollowing) {
                await unfollowUser(userId);
            } else {
                await followUser(userId);
            }
        } catch (error) {
            // Rollback strategy for request exceptions
            setUsers(prevUsers =>
                prevUsers.map(u => u.id === userId ? { ...u, isFollowing: currentlyFollowing } : u)
            );
        }
    };

    /**
     * List element dynamic viewport adapter mapping profile data cards.
     */
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
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search climbers..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                    autoFocus
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUser}
                    ListEmptyComponent={
                        searchQuery.length >= 2 ? (
                            <Text style={styles.emptyText}>No users found.</Text>
                        ) : null
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 15 },
    searchContainer: { flexDirection: 'row', backgroundColor: '#f0f0f0', borderRadius: 10, padding: 10, alignItems: 'center', marginBottom: 20 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, fontSize: 16 },
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
    emptyText: { textAlign: 'center', color: '#777', marginTop: 20 }
});