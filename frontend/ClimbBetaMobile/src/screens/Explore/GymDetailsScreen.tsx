import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getActiveBoulders, type Boulder } from '../../services/gymService';

const FALLBACK_BOULDER_IMG = 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=400&q=80';

/**
 * Detailed viewport for a specific commercial facility.
 *
 * Lists active in-house routes, technical setting allocations, and tracks catalog volume
 * updates while providing shortcuts to log newly cleared accents.
 */
export default function GymDetailsScreen({ route, navigation }: any) {
  const gymId: number = route.params?.gymId;
  const gymName = route.params?.gymName || 'Unknown Gym';

  const [boulders, setBoulders] = useState<Boulder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * Requests active routes linked to the facility identifier.
   */
  const loadBoulders = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const data = await getActiveBoulders(gymId);
      setBoulders(data);
    } catch (error: any) {
      setErrorMsg(error?.message ?? 'Could not load boulders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!gymId) {
      setErrorMsg('Invalid gym.');
      setIsLoading(false);
      return;
    }
    loadBoulders();
  }, [gymId]);

  /**
   * Computes header text descriptions based on route metrics.
   */
  const subtitle = useMemo(() => {
    if (isLoading) return 'Loading catalog...';
    return `Route Catalog • ${boulders.length} Active Boulders`;
  }, [isLoading, boulders.length]);

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{gymName}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Active Boulders</Text>

          {isLoading && (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color="#2E7D32" />
                <Text style={styles.infoText}>Loading boulders...</Text>
              </View>
          )}

          {!isLoading && errorMsg && (
              <View style={styles.centerBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadBoulders}>
                  <Text style={styles.retryButtonText}>Try again</Text>
                </TouchableOpacity>
              </View>
          )}

          {!isLoading && !errorMsg && boulders.length === 0 && (
              <View style={styles.centerBox}>
                <Text style={styles.infoText}>No active boulders in this gym.</Text>
              </View>
          )}

          {!isLoading &&
              !errorMsg &&
              boulders.map((boulder) => (
                  <TouchableOpacity
                      key={boulder.id}
                      style={styles.boulderCard}
                      activeOpacity={0.7}
                      onPress={() => navigation.navigate('BoulderDetails', { boulderId: boulder.id })}
                  >
                    <Image
                        source={{ uri: boulder.imageUrl || FALLBACK_BOULDER_IMG }}
                        style={styles.boulderThumb}
                        resizeMode="cover"
                    />

                    <View style={styles.boulderInfo}>
                      <View style={styles.gradeRow}>
                        <Text style={styles.gradeText}>{boulder.grade}</Text>
                        <View style={[styles.colorDot, { backgroundColor: boulder.hexColor || '#9E9E9E' }]} />
                      </View>
                      <Text style={styles.detailsText}>
                        {boulder.color} • Setter: {boulder.setterName || 'N/A'}
                      </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.logButton}
                        onPress={() => {
                          navigation.navigate('LogAscent', {
                            boulderId: boulder.id,
                            boulderColor: boulder.color
                          });
                        }}
                    >
                      <Ionicons name="add-circle" size={20} color="#fff" />
                      <Text style={styles.logButtonText}>Log</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
              ))}
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
  content: { padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  centerBox: { paddingVertical: 28, alignItems: 'center' },
  infoText: { marginTop: 10, color: '#666', fontSize: 15 },
  errorText: { color: '#B00020', fontSize: 15, textAlign: 'center', marginBottom: 10 },
  retryButton: { backgroundColor: '#2E7D32', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  boulderCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  boulderThumb: { width: 56, height: 56, borderRadius: 10, marginRight: 15, backgroundColor: '#e0e0e0' },
  boulderInfo: { flex: 1 },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1, borderColor: '#ddd' },
  gradeText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  detailsText: { fontSize: 13, color: '#777', marginTop: 2 },
  logButton: { flexDirection: 'row', backgroundColor: '#2E7D32', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center', zIndex: 10 },
  logButtonText: { color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 13 },
});