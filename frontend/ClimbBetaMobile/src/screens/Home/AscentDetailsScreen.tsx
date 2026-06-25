import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AscentDetailsScreen() {
  return (
      <ScrollView style={styles.container}>
        {/* Featured Media */}
        <Image
            source={{ uri: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80' }}
            style={styles.heroImage}
        />

        <View style={styles.content}>
          <Text style={styles.routeTitle}>Steep Red <Text style={styles.grade}>(V4)</Text></Text>
          <Text style={styles.location}>Vertical Wall • Rúben Duarte</Text>

          <View style={styles.styleChip}>
            <Text style={styles.styleText}>✨ Style: Flash</Text>
          </View>

          <Text style={styles.sectionTitle}>Notes / Beta</Text>
          <Text style={styles.notes}>That hold at the finish slipped a bit, but I managed to hold on! The key is to place a high heel hook on the right from the very beginning. 💪</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Comments (2)</Text>
          <View style={styles.commentBox}>
            <Text style={styles.commentAuthor}>Gonçalo Matos:</Text>
            <Text style={styles.commentText}>Great heel hook technique! I'm going to try this project tomorrow.</Text>
          </View>
          <View style={styles.commentBox}>
            <Text style={styles.commentAuthor}>Ana Silva:</Text>
            <Text style={styles.commentText}>Machine! 🔥</Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput style={styles.input} placeholder="Add a comment..." />
            <TouchableOpacity style={styles.sendBtn}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  heroImage: { width: '100%', height: 400, resizeMode: 'cover' },
  content: { padding: 20 },
  routeTitle: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  grade: { color: '#2E7D32' },
  location: { fontSize: 14, color: '#777', marginTop: 5, marginBottom: 15 },
  styleChip: { backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 20 },
  styleText: { color: '#2E7D32', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  notes: { fontSize: 15, color: '#444', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
  commentBox: { marginBottom: 15 },
  commentAuthor: { fontWeight: 'bold', color: '#333', marginBottom: 2 },
  commentText: { color: '#555' },
  inputRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 20, marginRight: 10 },
  sendBtn: { backgroundColor: '#2E7D32', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});