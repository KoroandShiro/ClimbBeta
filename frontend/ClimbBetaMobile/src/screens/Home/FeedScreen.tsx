import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getFeed, FeedItem } from '../../services/ascentService';

const { width } = Dimensions.get('window');

export default function FeedScreen({ navigation }: any) {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          if (isActive) setError(err?.message ?? 'Erro ao carregar o feed da comunidade.');
        } finally {
          if (isActive) setLoading(false);
        }
      };
      loadFeed();
      return () => { isActive = false; };
    }, [])
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho Fixo */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ClimbBeta</Text>
        <TouchableOpacity onPress={() => navigation.navigate('UserSearch')}>
          <Ionicons name="search" size={26} color="#111" />
        </TouchableOpacity>
      </View>

      {/* Estados */}
      {loading && <View style={styles.centerContainer}><ActivityIndicator size="large" color="#2E7D32" /></View>}
      {!loading && error && <View style={styles.centerContainer}><Text style={styles.errorText}>{error}</Text></View>}
      {!loading && !error && feed.length === 0 && (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>O teu feed está vazio. Usa a pesquisa para seguires novos escaladores!</Text>
        </View>
      )}

      {/* Lista de Publicações */}
      {!loading && !error && feed.map((post) => (
        <View key={post.ascent.id} style={styles.postCard}>
          
          {/* 1. Cabeçalho do Post (SEM os 3 pontinhos) */}
          <View style={styles.postHeader}>
            <Image 
              source={{ uri: post.authorAvatarUrl ?? 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
              style={styles.avatar} 
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{post.authorUsername}</Text>
              <Text style={styles.postLocation}>
                {post.ascent.gymName ?? post.ascent.freelogGymName ?? 'Outdoor'}
              </Text>
            </View>
          </View>

          {/* 2. Imagem Principal */}
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('AscentDetails', { ascentId: post.ascent.id })}>
            <Image 
              source={{ uri: post.postImageUrl ?? 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80' }} 
              style={styles.postImage} 
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* 3. Barra de Interações (Apenas Like, Comment e Save planeados na API) */}
          <View style={styles.actionRow}>
            <View style={styles.leftActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="heart-outline" size={28} color="#111" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={26} color="#111" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton}>
              <Ionicons name="bookmark-outline" size={26} color="#111" />
            </TouchableOpacity>
          </View>

          {/* 4. Detalhes (COM o Grau e Nome reias) */}
          <View style={styles.postFooter}>
            <Text style={styles.likesText}>0 gostos</Text>
            
            <View style={styles.detailsRow}>
              <Text style={styles.boulderName}>
                Via {post.routeName ?? 'Registada'}
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

            <Text style={styles.dateText}>{new Date(post.ascent.date).toLocaleDateString('pt-PT')}</Text>
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
  
  postImage: { width: width, height: width, backgroundColor: '#fafafa' },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10 },
  leftActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { marginRight: 16 },
  saveButton: { marginLeft: 'auto' },
  
  postFooter: { paddingHorizontal: 15, paddingBottom: 10 },
  likesText: { fontWeight: '600', fontSize: 14, color: '#111', marginBottom: 6 },
  
  detailsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  boulderName: { fontSize: 15, fontWeight: '700', color: '#111', marginRight: 10 },
  gradeText: { fontWeight: '700', color: '#2563EB' }, // Azul mais forte para o grau destacar
  styleChip: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  styleText: { color: '#2E7D32', fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  
  captionText: { fontSize: 14, color: '#111', lineHeight: 20 },
  captionUsername: { fontWeight: '600' },
  
  dateText: { fontSize: 12, color: '#888', marginTop: 8 }
});