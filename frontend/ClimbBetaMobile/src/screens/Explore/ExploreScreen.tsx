import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getGyms, type Gym } from '../../services/gymService';

export default function ExploreScreen({ navigation }: any) {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadGyms = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const data = await getGyms();
        setGyms(data);
      } catch (error: any) {
        setErrorMsg(error?.message ?? 'Não foi possível carregar os ginásios.');
      } finally {
        setIsLoading(false);
      }
    };

    loadGyms();
  }, []);

  const filteredGyms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return gyms;

    return gyms.filter((gym) => {
      const name = gym.name.toLowerCase();
      const city = gym.city.toLowerCase();
      return name.includes(q) || city.includes(q);
    });
  }, [gyms, query]);

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar ginásios..."
                placeholderTextColor="#999"
                value={query}
                onChangeText={setQuery}
            />
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore Ginásios</Text>
            <Ionicons name="business" size={20} color="#2E7D32" />
          </View>

          <Text style={styles.sectionSubtitle}>
            Catálogo indoor disponível na plataforma.
          </Text>

          {isLoading && (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.infoText}>A carregar ginásios...</Text>
              </View>
          )}

          {!isLoading && errorMsg && (
              <View style={styles.centerBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity
                    style={styles.retryButton}
                    onPress={async () => {
                      try {
                        setIsLoading(true);
                        setErrorMsg(null);
                        const data = await getGyms();
                        setGyms(data);
                      } catch (error: any) {
                        setErrorMsg(error?.message ?? 'Não foi possível carregar os ginásios.');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                >
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
          )}

          {!isLoading && !errorMsg && filteredGyms.length === 0 && (
              <View style={styles.centerBox}>
                <Text style={styles.infoText}>Nenhum ginásio encontrado.</Text>
              </View>
          )}

          {!isLoading &&
              !errorMsg &&
              filteredGyms.map((gym) => (
                  <TouchableOpacity
                      key={gym.id}
                      activeOpacity={0.85}
                      style={styles.gymCard}
                      onPress={() =>
                          navigation.navigate('GymDetails', {
                            gymId: gym.id,
                            gymName: gym.name,
                          })
                      }
                  >
                    <ImageBackground
                        source={{
                          uri:
                              gym.coverImageUrl ||
                              'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=800&q=80',
                        }}
                        style={styles.cardImage}
                        imageStyle={{ borderRadius: 12 }}
                    >
                      <View style={styles.cardOverlay}>
                        <View>
                          <Text style={styles.gymName}>{gym.name}</Text>
                          <View style={styles.locationRow}>
                            <Ionicons name="location" size={14} color="#fff" />
                            <Text style={styles.gymLocation}>{gym.city}</Text>
                          </View>
                        </View>

                        <View style={styles.routesBadge}>
                          <Text style={styles.routesText}>Ver vias</Text>
                        </View>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  header: {
    backgroundColor: '#fff',
    padding: 15,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 45,
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  content: { padding: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  sectionSubtitle: { fontSize: 14, color: '#666', marginTop: 5, marginBottom: 20 },

  centerBox: { paddingVertical: 28, alignItems: 'center' },
  infoText: { marginTop: 10, color: '#666', fontSize: 15 },
  errorText: { color: '#B00020', fontSize: 15, textAlign: 'center', marginBottom: 10 },
  retryButton: { backgroundColor: '#2E7D32', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },

  gymCard: {
    height: 160,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardImage: { width: '100%', height: '100%', justifyContent: 'flex-end' },
  cardOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  gymName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  gymLocation: { color: '#ddd', fontSize: 14, marginLeft: 4 },

  routesBadge: { backgroundColor: '#2E7D32', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  routesText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
});
