import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getMyAscents, Ascent } from '../../services/ascentService';
import { getMyProfile, ClimberProfileWithUserDTO } from '../../services/profileService';

/**
 * Core User Profile Dashboard.
 *
 * Aggregates and surfaces climber performance metrics, physical profile specs,
 * administrative access tools (logout, config entrypoints), and logs chronological data
 * segments recording the personal history timeline of logged ascents.
 */
export default function ProfileScreen({ navigation }: any) {
  const { logout } = useAuth();

  const [profile, setProfile] = useState<ClimberProfileWithUserDTO | null>(null);
  const [ascents, setAscents] = useState<Ascent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refreshes dashboard logs and user bio matrices in parallel blocks
   * whenever the view focused navigation frame updates.
   */
  useFocusEffect(
      React.useCallback(() => {
        let mounted = true;

        async function load() {
          setLoading(true);
          setError(null);

          try {
            const [profileData, ascentsData] = await Promise.all([
              getMyProfile(),
              getMyAscents(),
            ]);

            if (!mounted) return;

            setProfile(profileData);
            setAscents(ascentsData ?? []);
          } catch (err: any) {
            console.error('Error loading profile/logbook', err);
            if (!mounted) return;
            setError(err?.message ?? 'Error loading profile.');
          } finally {
            if (mounted) setLoading(false);
          }
        }

        load();

        return () => {
          mounted = false;
        };
      }, [])
  );

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
    );
  }

  if (error) {
    return (
        <ScrollView style={styles.container}>
          <Text style={styles.errorText}>{error}</Text>
        </ScrollView>
    );
  }

  return (
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          <Image
              source={{
                uri:
                    profile?.avatarUrl ??
                    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              }}
              style={styles.avatar}
          />

          <Text style={styles.username}>{profile?.username || 'Loading...'}</Text>
          <Text style={styles.userHandle}>@{profile?.username || 'user'}</Text>

          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{ascents.length}</Text>
            <Text style={styles.statLabel}>Ascents</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {profile?.height != null ? `${profile.height} cm` : '—'}
            </Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {profile?.apeIndex != null ? profile.apeIndex.toFixed(2) : '—'}
            </Text>
            <Text style={styles.statLabel}>Ape Index</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyProjects')}
          >
            <Ionicons name="bookmark" size={26} color="#2E7D32" />
            <Text style={styles.actionTitle}>Saved Projects</Text>
            <Text style={styles.actionSub}>View your saves</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FollowList', { userId: profile?.userId, initialTab: 'followers' })}
          >
            <Ionicons name="people" size={26} color="#1976D2" />
            <Text style={styles.actionCount}>{profile?.followersCount ?? 0}</Text>
            <Text style={styles.actionSub}>Followers</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('FollowList', { userId: profile?.userId, initialTab: 'following' })}
          >
            <Ionicons name="person-add" size={26} color="#1976D2" />
            <Text style={styles.actionCount}>{profile?.followingCount ?? 0}</Text>
            <Text style={styles.actionSub}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="create-outline" size={18} color="#fff" />
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#c62828" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        {/* Logbook History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Latest Ascents</Text>

          {ascents.length === 0 ? (
              <Text style={styles.emptyText}>
                You have no logged ascents yet.
              </Text>
          ) : (
              ascents.map((item) => (
                  <View key={item.id} style={styles.historyItem}>
                    <View style={styles.historyIcon}>
                      <Ionicons
                          name={getAscentIcon(item.style)}
                          size={20}
                          color="#fff"
                      />
                    </View>

                    <View style={styles.historyText}>
                      <Text style={styles.historyRoute}>
                        {item.boulderName ??
                            item.freelogGymName ??
                            `Boulder #${item.boulderId ?? item.outdoorRouteId ?? ''}`}
                        {item.freelogGrade ? ` (${item.freelogGrade})` : ''}
                      </Text>

                      <Text style={styles.historyGym}>
                        {formatStyle(item.style)} • {item.attempts} attempt(s)
                      </Text>

                      <Text style={styles.historyDate}>
                        {formatDate(item.date)}
                      </Text>
                    </View>
                  </View>
              ))
          )}
        </View>
      </ScrollView>
  );
}

/**
 * Resolves appropriate visual iconography tokens mapped against performance styles.
 *
 * @param {string|null} style - Sent performance categorization string identifier.
 * @returns {"flash" | "checkmark-done"} Explicit icon type key assigned to the layout.
 */
function getAscentIcon(style?: string | null) {
  const normalized = (style ?? '').toLowerCase();
  if (normalized === 'flash') return 'flash' as const;
  return 'checkmark-done' as const;
}

/**
 * Text case formatter normalization layer.
 *
 * @param {string|null} style - Technical performance style identifier.
 */
function formatStyle(style?: string | null) {
  if (!style) return 'Ascent';
  return style.charAt(0).toUpperCase() + style.slice(1).toLowerCase();
}

/**
 * Chronological timestamp formatter string compiler.
 * Converts raw datetime data payloads into localized en-US regional structures.
 *
 * @param {string} date - Incoming date format signature from data models.
 */
function formatDate(date: string) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('en-US');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  errorText: { color: 'red', margin: 16 },
  header: { alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10, backgroundColor: '#e0e0e0' },
  username: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  userHandle: { fontSize: 16, color: '#777', marginBottom: 5 },
  bio: { fontSize: 15, color: '#555', textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#fff', marginTop: 2, paddingVertical: 15 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 13, color: '#777', marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#e0e0e0', height: '80%', alignSelf: 'center' },
  actionsContainer: { flexDirection: 'row', padding: 15, gap: 15 },
  actionCard: { flex: 1, backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  actionTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginTop: 10, textAlign: 'center' },
  actionCount: { fontSize: 20, fontWeight: 'bold', color: '#1976D2', marginTop: 8 },
  actionSub: { fontSize: 12, color: '#777', marginTop: 4 },
  editProfileButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, padding: 12, backgroundColor: '#2E7D32', borderRadius: 8 },
  editProfileButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', margin: 16, padding: 14, backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#ffcdd2', gap: 8 },
  logoutText: { color: '#c62828', fontWeight: 'bold', fontSize: 15 },
  historySection: { padding: 20 },
  historyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  emptyText: { color: '#777', textAlign: 'center', marginTop: 10 },
  historyItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, alignItems: 'center' },
  historyIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2E7D32', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  historyText: { flex: 1 },
  historyRoute: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  historyGym: { fontSize: 13, color: '#777', marginTop: 2 },
  historyDate: { fontSize: 12, color: '#999', marginTop: 2 },
});