import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
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
 * Social dashboard feed component.
 *
 * Aggregates and renders a timeline of recent climbing ascents completed by the user's
 * network. Automatically hooks into native focus events to refresh feed details.
 */
export default function FeedScreen({ navigation }: any) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Focus-driven lifecycle handler. Fetches active social posts asynchronously
   * and tracks memory safety tags to discard late responses if the component unmounts.
   */
  useFocusEffect(
      useCallback(() => {
        let isActive = true;
        const loadFeed = async () => {
          try {
            setLoading(true);
            setError(null);
            const data = await getFeed();
            if (isActive) setFeed(data);
          } catch (err: any) {
            if (isActive) setError(err?.message ?? 'Error loading the community feed.');
          } finally {
            if (isActive) setLoading(false);
          }
        };
        loadFeed();
        return () => { isActive = false; };
      }, [])
  );

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

  return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Fixed Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ClimbBeta</Text>
          <TouchableOpacity onPress={() => navigation.navigate('UserSearch')}>
            <Ionicons name="search" size={26} color="#111" />
          </TouchableOpacity>
        </View>

        {/* Status Views */}
        {loading && <View style={styles.centerContainer}><ActivityIndicator size="large" color="#2E7D32" /></View>}
        {!loading && error && <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>}
        {!loading && !error && feed.length === 0 && (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Your feed is empty. Use the search bar to follow new climbers!</Text>
            </View>
        )}

        {/* Publications List */}
        {!loading && !error && feed.map((post) => (
            <View key={post.ascent.id} style={styles.postCard}>

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
                  return (
                      <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
                        <Ionicons name={badge.icon} size={13} color={badge.color} />
                        <Text style={[styles.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
                      </View>
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
                  <Text style={styles.boulderName}>
                    Route {post.routeName ?? 'Logged'}
                    {post.routeGrade ? <Text style={styles.gradeText}> ({post.routeGrade})</Text> : ''}
                  </Text>
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
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { padding: 40, alignItems: 'center', justifyContent: 'center', flex: 1 },
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
  saveButton: { marginLeft: 'auto' },
  postFooter: { paddingHorizontal: 15, paddingBottom: 10 },
  likesText: { fontWeight: '600', fontSize: 14, color: '#111', marginBottom: 6 },
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  boulderName: { fontSize: 15, fontWeight: '700', color: '#111', marginRight: 10 },
  gradeText: { fontWeight: '700', color: '#2563EB' },
  styleChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  styleText: { color: '#2E7D32', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  captionText: { fontSize: 14, color: '#111', lineHeight: 20 },
  captionUsername: { fontWeight: '600' },
  dateText: { fontSize: 12, color: '#888', marginTop: 8 },
  viewComments: { fontSize: 13, color: '#666', marginTop: 4 }
});