import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FeedItem } from '../services/ascentService';

const { width } = Dimensions.get('window');

/** Visual descriptor per ascent type, used to render the card's type badge. */
const LOG_TYPE_BADGE: Record<string, { label: string; icon: any; bg: string; color: string }> = {
  INDOOR:      { label: 'Gym',        icon: 'barbell',    bg: '#E8F5E9', color: '#2E7D32' },
  FREELOG_GYM: { label: 'Gym · Free', icon: 'business',   bg: '#E3F2FD', color: '#1565C0' },
  OUTDOOR:     { label: 'Outdoor',    icon: 'trail-sign', bg: '#FBE9E7', color: '#BF360C' },
};

type Props = {
  post: FeedItem;
  navigation: any;
  /** Like state is owned by the parent screen (optimistic), so the same card works in Feed and Profile. */
  onToggleLike: (ascentId: number, wasLiked: boolean) => void;
};

/**
 * Instagram-style feed post card. Shared between the Feed and the Profile history so both
 * have identical look & behaviour.
 */
export default function FeedPostCard({ post, navigation, onToggleLike }: Props) {
  const isIndoor = post.logType === 'INDOOR' && post.ascent.boulderId != null;
  const openDetails = () => navigation.navigate('AscentDetails', { ascentId: post.ascent.id });
  const goToBoulder = () => {
    if (isIndoor) navigation.navigate('BoulderDetails', { boulderId: post.ascent.boulderId });
  };

  return (
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
            const Container: any = isIndoor ? TouchableOpacity : View;
            return (
                <Container
                    style={[styles.typeBadge, { backgroundColor: badge.bg }]}
                    onPress={isIndoor ? goToBoulder : undefined}
                >
                  <Ionicons name={badge.icon} size={13} color={badge.color} />
                  <Text style={[styles.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
                </Container>
            );
          })()}
        </View>

        {/* 2. Main Image */}
        <TouchableOpacity activeOpacity={0.9} onPress={openDetails}>
          <Image
              source={{ uri: post.postImageUrl ?? 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80' }}
              style={styles.postImage}
              resizeMode="cover"
          />
        </TouchableOpacity>

        {/* 3. Interaction Bar */}
        <View style={styles.actionRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => onToggleLike(post.ascent.id, post.likedByMe ?? false)}>
              <Ionicons name={post.likedByMe ? 'heart' : 'heart-outline'} size={28} color={post.likedByMe ? '#E0245E' : '#111'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={openDetails}>
              <Ionicons name="chatbubble-outline" size={26} color="#111" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. Details */}
        <View style={styles.postFooter}>
          <Text style={styles.likesText}>{post.likeCount ?? 0} {(post.likeCount ?? 0) === 1 ? 'like' : 'likes'}</Text>

          <View style={styles.detailsRow}>
            {(() => {
              const NameContainer: any = isIndoor ? TouchableOpacity : View;
              return (
                  <NameContainer style={styles.routeNameWrap} onPress={isIndoor ? goToBoulder : undefined}>
                    <Text style={styles.boulderName}>
                      Route {post.routeName ?? 'Logged'}
                      {post.routeGrade ? <Text style={styles.gradeText}> ({post.routeGrade})</Text> : ''}
                    </Text>
                    {isIndoor && <Ionicons name="chevron-forward" size={16} color="#2E7D32" />}
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
              <TouchableOpacity onPress={openDetails}>
                <Text style={styles.viewComments}>View {post.commentCount} comment{post.commentCount === 1 ? '' : 's'}</Text>
              </TouchableOpacity>
          )}
          <Text style={styles.dateText}>{new Date(post.ascent.date).toLocaleDateString('en-US')}</Text>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
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
  gradeText: { fontWeight: '700', color: '#2E7D32' },
  styleChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  styleText: { color: '#2E7D32', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  captionText: { fontSize: 14, color: '#111', lineHeight: 20 },
  captionUsername: { fontWeight: '600' },
  dateText: { fontSize: 12, color: '#888', marginTop: 8 },
  viewComments: { fontSize: 13, color: '#666', marginTop: 4 },
});
