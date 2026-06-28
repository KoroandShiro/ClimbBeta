import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getFeed, FeedItem, likeAscent, unlikeAscent } from '../../services/ascentService';
import FeedPostCard from '../../components/FeedPostCard';

/**
 * Social dashboard feed.
 *
 * A FlatList timeline of recent ascents from climbers the user follows. The full-screen loader
 * only shows on the FIRST load; refocus refreshes silently so the scroll position is preserved
 * when returning from a post's details. Supports native pull-to-refresh. Each row is a shared
 * FeedPostCard (also used by the Profile history).
 */
export default function FeedScreen({ navigation }: any) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoaded = useRef(false);

  /** Fetches the feed. `silent` skips the full-screen loader (used on refocus/pull-to-refresh). */
  const loadFeed = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const data = await getFeed();
      setFeed(data);
    } catch (err: any) {
      setError(err?.message ?? 'Error loading the community feed.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Refetch on focus, SILENTLY after the first load -> the list isn't swapped for a loader,
  // so the FlatList keeps its scroll offset when coming back from details.
  useFocusEffect(
      useCallback(() => {
        loadFeed(hasLoaded.current);
        hasLoaded.current = true;
      }, [loadFeed])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed(true);
    setRefreshing(false);
  }, [loadFeed]);

  /** Toggle otimista do like, atualizado no array local; o cartão lê o estado por props. */
  const handleToggleLike = useCallback(async (ascentId: number, wasLiked: boolean) => {
    setFeed((prev) => prev.map((p) => p.ascent.id === ascentId
        ? { ...p, likedByMe: !wasLiked, likeCount: (p.likeCount ?? 0) + (wasLiked ? -1 : 1) }
        : p));
    try {
      if (wasLiked) await unlikeAscent(ascentId); else await likeAscent(ascentId);
    } catch {
      setFeed((prev) => prev.map((p) => p.ascent.id === ascentId
          ? { ...p, likedByMe: wasLiked, likeCount: (p.likeCount ?? 0) + (wasLiked ? 1 : -1) }
          : p));
    }
  }, []);

  return (
      <View style={styles.container}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ClimbBeta</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UserSearch')}>
            <Ionicons name="search" size={26} color="#111" />
          </TouchableOpacity>
        </View>

        {loading && feed.length === 0 ? (
            <View style={styles.centerContainer}><ActivityIndicator size="large" color="#2E7D32" /></View>
        ) : error && feed.length === 0 ? (
            <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>
        ) : (
            <FlatList
                data={feed}
                keyExtractor={(item) => String(item.ascent.id)}
                renderItem={({ item }) => (
                    <FeedPostCard post={item} navigation={navigation} onToggleLike={handleToggleLike} />
                )}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2E7D32" colors={['#2E7D32']} />
                }
                ListEmptyComponent={
                  <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>Your feed is empty. Use the search bar to follow new climbers!</Text>
                  </View>
                }
                contentContainerStyle={feed.length === 0 ? styles.emptyListContent : undefined}
                ListFooterComponent={<View style={{ height: 40 }} />}
            />
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { padding: 40, alignItems: 'center', justifyContent: 'center', flex: 1 },
  emptyListContent: { flexGrow: 1, justifyContent: 'center' },
  errorText: { color: '#c62828', textAlign: 'center' },
  emptyText: { color: '#666', textAlign: 'center', fontSize: 16, lineHeight: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#dbdbdb' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111', fontStyle: 'italic' },
});
