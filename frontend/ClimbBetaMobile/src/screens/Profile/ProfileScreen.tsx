import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getMyAscents, Ascent } from '../../services/ascentService';
import { getMyProfile, Profile } from '../../services/profileService';

export default function ProfileScreen({ navigation }: any) {
  const { logout } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [ascents, setAscents] = useState<Ascent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
        console.error('Erro ao carregar perfil/logbook', err);
        if (!mounted) return;
        setError(err?.message ?? 'Erro ao carregar o perfil.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

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
        {/* Header do perfil */}
        <View style={styles.header}>
          <Image
              source={{
                uri:
                    profile?.avatarUrl ??
                    'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
              }}
              style={styles.avatar}
          />
          <Text style={styles.name}>
            {profile?.name ?? profile?.username ?? 'Escalador'}
          </Text>
          <Text style={styles.username}>
            @{profile?.username ?? 'username'}
          </Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{ascents.length}</Text>
            <Text style={styles.statLabel}>Ascensões</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.maxGrade ?? '—'}</Text>
            <Text style={styles.statLabel}>Grau Máx</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{profile?.apeIndex ?? '—'}</Text>
            <Text style={styles.statLabel}>Ape Index</Text>
          </View>
        </View>

        {/* Ações */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('MyProjects')}
          >
            <Ionicons name="bookmark" size={28} color="#2E7D32" />
            <Text style={styles.actionTitle}>Projetos Guardados</Text>
            <Text style={styles.actionSub}>Ver os teus saves</Text>
          </TouchableOpacity>

          <TouchableOpacity
              style={styles.actionCard}
              onPress={() => alert('Abriria a lista de amigos!')}
          >
            <Ionicons name="people" size={28} color="#1976D2" />
            <Text style={styles.actionTitle}>Os Meus Amigos</Text>
            <Text style={styles.actionSub}>A gerir</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#c62828" />
          <Text style={styles.logoutText}>Terminar Sessão</Text>
        </TouchableOpacity>

        {/* Logbook */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Últimas Ascensões</Text>

          {ascents.length === 0 ? (
              <Text style={styles.emptyText}>
                Ainda não tens subidas registadas.
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
                        {formatStyle(item.style)} • {item.attempts} tentativa(s)
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

function getAscentIcon(style?: string | null) {
  const normalized = (style ?? '').toLowerCase();
  if (normalized === 'flash') return 'flash' as const;
  return 'checkmark-done' as const;
}

function formatStyle(style?: string | null) {
  if (!style) return 'Subida';
  return style.charAt(0).toUpperCase() + style.slice(1).toLowerCase();
}

function formatDate(date: string) {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('pt-PT');
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: { color: 'red', margin: 16 },

  header: { alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  username: { fontSize: 16, color: '#777', marginBottom: 5 },
  bio: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 2,
    paddingVertical: 15,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: '#2E7D32' },
  statLabel: { fontSize: 13, color: '#777', marginTop: 4 },
  statDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    height: '80%',
    alignSelf: 'center',
  },

  actionsContainer: { flexDirection: 'row', padding: 15, gap: 15 },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  actionSub: { fontSize: 12, color: '#777', marginTop: 4 },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffcdd2',
    gap: 8,
  },
  logoutText: { color: '#c62828', fontWeight: 'bold', fontSize: 15 },

  historySection: { padding: 20 },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  historyText: { flex: 1 },
  historyRoute: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  historyGym: { fontSize: 13, color: '#777', marginTop: 2 },
  historyDate: { fontSize: 12, color: '#999', marginTop: 2 },
});
