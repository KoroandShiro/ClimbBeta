import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getFeed, FeedItem, likeAscent, unlikeAscent } from '../../services/ascentService';

const { width } = Dimensions.get('window');

/** Visual descriptor per ascent type, used to render the card's type badge. */
const LOG_TYPE_BADGE: Record<string, { label: string; icon: any; bg: string; color: string }> = {
  INDOOR:      { label: 'Gym',        icon: 'barbell',    bg: '#E8F5E9', color: '#2E7D32' },
  FREELOG_GYM: { label: 'Gym · Free', icon: 'business',   bg: '#E3F2FD', color: '#1565C0' },
  OUTDOOR:     { label: 'Outdoor',    icon: 'trail-sign', bg: '#FBE9E7', color: '#BF360C' },
};

/**
 * Social dashboard feed.
 *
 * A FlatList timeline of recent ascents from climbers the user follows. The full-screen loader
 * only shows on the FIRST load; refocus refreshes silently so the scroll position is preserved
 * when returning from a post's details. Supports native pull-to-refresh.
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

  // Refetch on focus, but SILENTLY after the first load -> the list isn't swapped for a loader,
  // so the FlatList stays mounted and keeps its scroll offset when coming back from details.
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

  /** Toggle otimista do like: atualiza o cartão na hora e depois sincroniza com o backend. */
  const handleToggleLike = async (ascentId: number, wasLiked: boolean) => {
    setFeed((prev) => prev.map((p) => p.ascent.id === ascentId
        ? { ...p, likedByMe: !wasLiked, likeCount: (p.likeCount ?? 0) + (wasLiked ? -1 : 1) }
        : p));
    try {
      if (wasLiked) await unlikeAscent(ascentId); else await likeAscent(ascentId);
    } catch {
      // Reverte se a chamada falhar
      setFeed((prev) => prev.map((p) => p.ascent.id === ascentId
          ? { ...p, likedByMe: wasLiked, likeCount: (p.likeCount ?? 0) + (wasLiked ? 1 : -1) }
          : p));
    }
  };

  /** Atalho para a via: só navega em cartões de ginásio parceiro (INDOOR com boulderId). */
  const goToBoulder = (post: FeedItem) => {
    if (post.logType === 'INDOOR' && post.ascent.boulderId != null) {
      navigation.navigate('BoulderDetails', { boulderId: post.ascent.boulderId });
    }
  };

  /** Renders a single feed post card. */
  const renderCard = ({ item: post }: { item: FeedItem }) => (
      <View style={styles.postCard}>

        {/* 1. Post Header */}
        <View style={styles.postHeader}>
          <Image
              source={{ uri: post.authorAvatarUrl ?? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
              style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{post.authorUsername}</Text>
            <Text style={styles.postLocation}>
              {post.logType === 'INDOOR'
                  ? (post.gymName ?? 'Partner Gym')
                  : post.logType === 'OUTDOOR'
                      ? 'Outdoor'
                      : (post.ascent.freelogGymName ?? 'Gym')}
            </Text>
          </View>
          {(() => {
            const badge = LOG_TYPE_BADGE[post.logType ?? 'FREELOG_GYM'] ?? LOG_TYPE_BADGE.FREELOG_GYM;
            const isIndoor = post.logType === 'INDOOR' && post.ascent.boulderId != null;
            const Container: any = isIndoor ? TouchableOpacity : View;
            return (
                <Container
                    style={[styles.typeBadge, { backgroundColor: badge.bg }]}
                    onPress={isIndoor ? () => goToBoulder(post) : undefined}
                >
                  <Ionicons name={badge.icon} size={13} color={badge.color} />
                  <Text style={[styles.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
                </Container>
            );
          })()}
        </View>

        {/* 2. Main Image */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AscentDetails', { ascentId: post.ascent.id })}>
          <Image
              source={{ uri: post.postImageUrl ?? 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80' }}
              style={styles.postImage}
              resizeMode="cover"
          />
        </TouchableOpacity>

        {/* 3. Interaction Bar */}
        <View style={styles.actionRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleLike(post.ascent.id, post.likedByMe ?? false)}>
              <Ionicons name={post.likedByMe ? 'heart' : 'heart-outline'} size={28} color={post.likedByMe ? '#E0245E' : '#111'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AscentDetails', { ascentId: post.ascent.id })}>
              <Ionicons name="chatbubble-outline" size={26} color="#111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Details */}
        <View style={styles.postFooter}>
          <Text style={styles.likesText}>{post.likeCount ?? 0} {(post.likeCount ?? 0) === 1 ? 'like' : 'likes'}</Text>

          <View style={styles.detailsRow}>
            {(() => {
              const isIndoor = post.logType === 'INDOOR' && post.ascent.boulderId != null;
              const NameContainer: any = isIndoor ? TouchableOpacity : View;
              return (
                  <NameContainer
                      style={styles.routeNameWrap}
                      onPress={isIndoor ? () => goToBoulder(post) : undefined}
                  >
                    <Text style={styles.boulderName}>
                      Route {post.routeName ?? 'Logged'}
                      {post.routeGrade ? <Text style={styles.gradeText}> ({post.routeGrade})</Text> : ''}
                    </Text>
                    {isIndoor && <Ionicons name="chevron-forward" size={16} color="#2563EB" />}
                  </NameContainer>
              );
            })()}
            {post.ascent.style && (
                <View style={styles.styleChip}>
                  <Text style={styles.styleText}>{post.ascent.style}</Text>
                </View>
            )}
          </View>

          {post.ascent.notes && (
              <Text style={styles.captionText}>
                <Text style={styles.captionUsername}>{post.authorUsername} </Text>
                {post.ascent.notes}
              </Text>
          )}

          {(post.commentCount ?? 0) > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('AscentDetails', { ascentId: post.ascent.id })}>
                <Text style={styles.viewComments}>View {post.commentCount} comment{post.commentCount === 1 ? '' : 's'}</Text>
              </TouchableOpacity>
          )}
          <Text style={styles.dateText}>{new Date(post.ascent.date).toLocaleDateString('en-US')}</Text>
        </View>
      </View>
  );

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
                renderItem={renderCard}
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
  postCard: { backgroundColor: '#fff', marginBottom: 15 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', marginRight: 10 },
  userInfo: { flex: 1, justifyContent: 'center' },
  userName: { fontSize: 14, fontWeight: '600', color: '#111' },
  postLocation: { fontSize: 12, color: '#666', marginTop: 1 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  postImage: { width: width, height: width, backgroundColor: '#fafafa' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  leftActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { marginRight: 16 },
  postFooter: { paddingHorizontal: 15, paddingBottom: 10 },
  likesText: { fontWeight: '600', fontSize: 14, color: '#111', marginBottom: 6 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  boulderName: { fontSize: 15, fontWeight: '700', color: '#111' },
  routeNameWrap: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 10 },
  gradeText: { fontWeight: '700', color: '#2563EB' },
  styleChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  styleText: { color: '#2E7D32', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  captionText: { fontSize: 14, color: '#111', lineHeight: 20 },
  captionUsername: { fontWeight: '600' },
  dateText: { fontSize: 12, color: '#888', marginTop: 8 },
  viewComments: { fontSize: 13, color: '#666', marginTop: 4 }
});
