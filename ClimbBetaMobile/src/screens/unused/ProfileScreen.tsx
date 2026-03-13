import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

type Tab = 'Latest' | 'Reviews' | 'Added';
const TABS: Tab[] = ['Latest', 'Reviews', 'Added'];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('Latest');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  const pickCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) setCoverUri(result.assets[0].uri);
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  return (
    <ScrollView style={styles.scroll} stickyHeaderIndices={[1]}>

      {/* Cover + Avatar */}
      <View>
        {/* Cover photo */}
        <TouchableOpacity style={styles.cover} onPress={pickCover} activeOpacity={0.85}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} />
          ) : (
            <>
              <Ionicons name="image-outline" size={36} color="#BDBDBD" />
              <Text style={styles.coverHint}>Tap to add cover photo</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Avatar + name row */}
        <View style={styles.profileRow}>
          <View style={styles.avatarColumn}>
            <TouchableOpacity style={styles.avatarWrapper} onPress={pickAvatar} activeOpacity={0.85}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatar}>
                  <Ionicons name="person" size={28} color="#BDBDBD" />
                  <Text style={styles.avatarHint}>Tap to add{'\n'}profile photo</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.username}>Username</Text>
            <Text style={styles.handle}>@handle</Text>
          </View>
        </View>
      </View>

      {/* Sticky tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'Latest' && (
          <Text style={styles.placeholder}>Latest boulders will appear here.</Text>
        )}
        {activeTab === 'Reviews' && (
          <Text style={styles.placeholder}>Boulders with reviews will appear here.</Text>
        )}
        {activeTab === 'Added' && (
          <Text style={styles.placeholder}>Boulders added by you will appear here.</Text>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  cover: {
    height: 160,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  coverHint: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 6,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    marginTop: -36,
  },
  avatarColumn: {
    alignItems: 'center',
    marginRight: 12,
  },
  avatarHint: {
    fontSize: 9,
    color: '#BDBDBD',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 13,
    paddingHorizontal: 6,
  },
  avatarWrapper: {
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameBlock: {
    paddingBottom: 6,
  },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  handle: {
    fontSize: 13,
    color: '#9E9E9E',
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#2E7D32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9E9E9E',
  },
  tabTextActive: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  content: {
    padding: 20,
    minHeight: 300,
  },
  placeholder: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    marginTop: 40,
  },
});
