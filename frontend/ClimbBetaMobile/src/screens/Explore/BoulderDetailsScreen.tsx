import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { getBoulderById, getLeaderboard, saveProject, unsaveProject, checkSaveStatus, LeaderboardEntry, Boulder } from '../../services/gymService';

export default function BoulderDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  const boulderId = route.params?.boulderId;

  const [boulder, setBoulder] = useState<Boulder | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false); // Button status (Problem 3)

  useFocusEffect(
      useCallback(() => {
        if (!boulderId) return;

        let isActive = true;
        const loadData = async () => {
          try {
            setLoading(true);

            // 1. Load Route and Leaderboard (If this fails, we show an error)
            const [boulderData, leaderboardData] = await Promise.all([
              getBoulderById(boulderId),
              getLeaderboard(boulderId)
            ]);

            if (isActive) {
              setBoulder(boulderData);
              setLeaderboard(leaderboardData);
            }

            // 2. Load the save button status separately.
            // This way, if the route doesn't exist (404), it won't crash the whole page.
            try {
              const status = await checkSaveStatus(boulderId);
              if (isActive) setIsSaved(status.isSaved);
            } catch (statusError) {
              console.warn("Project verification route failed", statusError);
            }

          } catch (error) {
            console.error("Error loading details:", error);
            if (isActive) Alert.alert("Error", "Could not load the route details.");
          } finally {
            if (isActive) setLoading(false);
          }
        };

        loadData();
        return () => { isActive = false; };
      }, [boulderId])
  );

  const handleToggleSave = async () => {
    if (!boulderId) return;
    try {
      setSaving(true);
      if (isSaved) {
        await unsaveProject(boulderId);
        setIsSaved(false);
      } else {
        await saveProject(boulderId);
        setIsSaved(true);
        Alert.alert("Success!", "Project saved to your list.");
      }
    } catch (error: any) {
      Alert.alert("Warning", error.message || "Could not update the project.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
        </View>
    );
  }

  if (!boulder) {
    return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Route not found.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
            <Text style={{ color: '#2563eb', fontWeight: 'bold' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
    );
  }

  return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Top Image */}
        <View style={styles.imageContainer}>
          <Image
              source={{ uri: boulder.imageUrl || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80' }}
              style={styles.heroImage}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Main Info */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Route {boulder.color}</Text>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{boulder.grade}</Text>
            </View>
          </View>
          <Text style={styles.setterText}>Setter: {boulder.setterName || 'Unknown'}</Text>

          {/* Action Bar (Dynamic Button) */}
          <View style={styles.actionRow}>
            <TouchableOpacity
                style={[styles.actionBtnOutline, isSaved && styles.actionBtnSaved]}
                onPress={handleToggleSave}
                disabled={saving}
            >
              <Ionicons name={saving ? "hourglass-outline" : (isSaved ? "bookmark" : "bookmark-outline")} size={20} color={isSaved ? "#555" : "#2563eb"} />
              <Text style={[styles.actionBtnOutlineText, isSaved && styles.actionTextSaved]}>
                {saving ? "Processing..." : (isSaved ? "Remove Project" : "Save Project")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.actionBtnSolid}
                onPress={() => navigation.navigate('LogAscent', { gymId: boulder.gymId, boulderId: boulder.id })}
            >
              <Ionicons name="checkmark-done" size={20} color="#fff" />
              <Text style={styles.actionBtnSolidText}>Log Beta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>Leaderboard 🏆</Text>

          {leaderboard.length === 0 ? (
              <Text style={styles.emptyText}>Be the first to send this route!</Text>
          ) : (
              leaderboard.map((entry, index) => (
                  <View key={index} style={styles.leaderboardCard}>
                    <Text style={styles.rankText}>{index + 1}st</Text>
                    <Image
                        source={{ uri: entry.avatarUrl || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                        style={styles.avatar}
                    />
                    <View style={styles.climberInfo}>
                      <Text style={styles.climberName}>{entry.username}</Text>
                      <Text style={styles.climberStyle}>{entry.style} • {entry.attempts} {entry.attempts === 1 ? 'attempt' : 'attempts'}</Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(entry.date).toLocaleDateString('en-US')}</Text>
                  </View>
              ))
          )}
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#dc2626', fontWeight: 'bold' },
  imageContainer: { position: 'relative' },
  heroImage: { width: '100%', height: 280, backgroundColor: '#d1d5db' },
  backButton: { position: 'absolute', top: 50, left: 15, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
  infoSection: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  gradeBadge: { backgroundColor: '#2563eb', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  gradeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  setterText: { color: '#6b7280', fontSize: 14, marginBottom: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  actionBtnOutline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: '#2563eb', borderRadius: 8, gap: 8 },
  actionBtnOutlineText: { color: '#2563eb', fontWeight: '600' },
  actionBtnSaved: { borderColor: '#d1d5db', backgroundColor: '#f3f4f6' },
  actionTextSaved: { color: '#555' },
  actionBtnSolid: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, backgroundColor: '#10b981', borderRadius: 8, gap: 8 },
  actionBtnSolidText: { color: '#fff', fontWeight: '600' },
  leaderboardSection: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 15 },
  emptyText: { color: '#6b7280', fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  leaderboardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  rankText: { fontSize: 18, fontWeight: 'bold', color: '#f59e0b', width: 35 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 15, backgroundColor: '#f3f4f6' },
  climberInfo: { flex: 1 },
  climberName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  climberStyle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  dateText: { fontSize: 12, color: '#9ca3af' },
});