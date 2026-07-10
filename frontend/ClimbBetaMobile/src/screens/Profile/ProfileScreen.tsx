/**
 * @file ProfileScreen.tsx
 * @description Ecrã principal do perfil do utilizador.
 */
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, ClimberProfileWithUserDTO } from '../../services/profileService';
import { getClimberAscents, FeedItem, likeAscent, unlikeAscent } from '../../services/ascentService';
import FeedPostCard from '../../components/FeedPostCard';

/**
 * Climber profile: a FlatList whose header holds the avatar/bio, quick stats
 * (ascents, max indoor/outdoor grade) and connections, and whose body is the climber's
 * ascent history rendered with the very same FeedPostCard used by the Feed.
 */
export default function ProfileScreen({ navigation }: any) {
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ClimberProfileWithUserDTO | null>(null);
  const [ascents, setAscents] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
      useCallback(() => {
        let mounted = true;
        (async () => {
          try {
            setLoading(true);
            setError(null);
            const p = await getMyProfile();
            if (!mounted) return;
            setProfile(p);
            const a = await getClimberAscents(p.userId);
            if (mounted) setAscents(a ?? []);
          } catch (err: any) {
            if (mounted) setError(err?.message ?? 'Error loading profile.');
          } finally {
            if (mounted) setLoading(false);
          }
        })();
        return () => { mounted = false; };
      }, [])
  );

  /** Optimistic like toggle on the profile's own ascents (same pattern as the Feed). */
  const handleToggleLike = useCallback(async (ascentId: number, wasLiked: boolean) => {
    setAscents((prev) => prev.map((p) => p.ascent.id === ascentId
        ? { ...p, likedByMe: !wasLiked, likeCount: (p.likeCount ?? 0) + (wasLiked ? -1 : 1) }
        : p));
    try {
      if (wasLiked) await unlikeAscent(ascentId); else await likeAscent(ascentId);
    } catch {
      setAscents((prev) => prev.map((p) => p.ascent.id === ascentId
          ? { ...p, likedByMe: wasLiked, likeCount: (p.likeCount ?? 0) + (wasLiked ? 1 : -1) }
          : p));
    }
  }, []);

  if (loading && !profile) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#2E7D32" /></View>;
  }
  if (error && !profile) {
    return <View style={styles.loadingContainer}><Text style={styles.errorText}>{error}</Text></View>;
  }

  const bioExtras = [
    profile?.height != null ? `${profile.height} cm` : null,
    profile?.apeIndex != null ? `Ape ${profile.apeIndex.toFixed(2)}` : null,
  ].filter(Boolean).join('  ·  ');

  const Header = (
      <View>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image
              source={{ uri: profile?.avatarUrl ?? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
              style={styles.avatar}
          />
          <Text style={styles.username}>{profile?.username || 'Loading...'}</Text>
          <Text style={styles.userHandle}>@{profile?.username || 'user'}</Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          {bioExtras ? <Text style={styles.bioExtras}>{bioExtras}</Text> : null}
        </View>

        {/* Quick Stats: Ascents / Max Indoor / Max Outdoor */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.totalAscents ?? 0}</Text>
            <Text style={styles.statLabel}>Ascents</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.maxIndoorGrade ?? '—'}</Text>
            <Text style={styles.statLabel}>Max Indoor</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.maxOutdoorGrade ?? '—'}</Text>
            <Text style={styles.statLabel}>Max Outdoor</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('MyProjects')}>
            <Ionicons name="bookmark" size={26} color="#2E7D32" />
            <Text style={styles.actionTitle}>Saved Projects</Text>
            <Text style={styles.actionSub}>View your saves</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FollowList', { userId: profile?.userId, initialTab: 'followers' })}
          >
            <Ionicons name="people" size={26} color="#2E7D32" />
            <Text style={styles.actionCount}>{profile?.followersCount ?? 0}</Text>
            <Text style={styles.actionSub}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FollowList', { userId: profile?.userId, initialTab: 'following' })}
          >
            <Ionicons name="person-add" size={26} color="#2E7D32" />
            <Text style={styles.actionCount}>{profile?.followingCount ?? 0}</Text>
            <Text style={styles.actionSub}>Following</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#c62828" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.historyTitle}>Latest Ascents</Text>
      </View>
  );

  return (
      <FlatList
          style={styles.container}
          data={ascents}
          keyExtractor={(item) => String(item.ascent.id)}
          renderItem={({ item }) => (
              <FeedPostCard post={item} navigation={navigation} onToggleLike={handleToggleLike} />
          )}
          ListHeaderComponent={Header}
          ListEmptyComponent={<Text style={styles.emptyText}>You have no logged ascents yet.</Text>}
          ListFooterComponent={<View style={{ height: 30 }} />}
          showsVerticalScrollIndicator={false}
      />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF3EC' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF3EC' },
  errorText: { color: 'red', margin: 16 },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, backgroundColor: '#e0e0e0' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  userHandle: { fontSize: 16, color: '#777', marginBottom: 5 },
  bio: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  bioExtras: { fontSize: 13, color: '#999', marginTop: 6 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', marginTop: 2, paddingVertical: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 13, color: '#777', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#e0e0e0', height: '80%', alignSelf: 'center' },
  actionsContainer: { flexDirection: 'row', padding: 15, gap: 15 },
  actionCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  actionCount: { fontSize: 20, fontWeight: 'bold', color: '#2E7D32', marginTop: 8 },
  actionSub: { fontSize: 12, color: '#777', marginTop: 4 },
  editProfileButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 4, padding: 12, backgroundColor: '#2E7D32', borderRadius: 8 },
  editProfileButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginTop: 12, padding: 14, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ffcdd2', gap: 8 },
  logoutText: { color: '#c62828', fontWeight: 'bold', fontSize: 15 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginHorizontal: 20, marginTop: 20, marginBottom: 10 },
  emptyText: { color: '#777', textAlign: 'center', marginTop: 20 },
});
