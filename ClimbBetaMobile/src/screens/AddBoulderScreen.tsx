import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const COLOR_OPTIONS = [
  { label: 'Yellow', value: 'yellow', hex: '#FDD835' },
  { label: 'Red',    value: 'red',    hex: '#E53935' },
  { label: 'Green',  value: 'green',  hex: '#43A047' },
];

const DIFFICULTY_OPTIONS = [
  { label: 'Easy',   value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard',   value: 'hard' },
];

type ColorOption = typeof COLOR_OPTIONS[number] | null;
type DifficultyOption = typeof DIFFICULTY_OPTIONS[number] | null;

export default function AddBoulderScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState<ColorOption>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyOption>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  const [colorOpen, setColorOpen] = useState(false);
  const [difficultyOpen, setDifficultyOpen] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Boulder name..."
        placeholderTextColor="#9E9E9E"
        value={name}
        onChangeText={setName}
      />

      {/* Color */}
      <Text style={styles.label}>Color</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setColorOpen(true)}>
        <View style={styles.dropdownContent}>
          {selectedColor ? (
            <>
              <View style={[styles.colorDot, { backgroundColor: selectedColor.hex }]} />
              <Text style={styles.dropdownText}>{selectedColor.label}</Text>
            </>
          ) : (
            <Text style={styles.dropdownPlaceholder}>Select a color...</Text>
          )}
        </View>
        <Ionicons name="chevron-down" size={18} color="#9E9E9E" />
      </TouchableOpacity>

      {/* Difficulty */}
      <Text style={styles.label}>Difficulty</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setDifficultyOpen(true)}>
        <View style={styles.dropdownContent}>
          <Text style={selectedDifficulty ? styles.dropdownText : styles.dropdownPlaceholder}>
            {selectedDifficulty ? selectedDifficulty.label : 'Select difficulty...'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#9E9E9E" />
      </TouchableOpacity>

      {/* Description */}
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.inputMultiline}
        placeholder="Brief description of the boulder..."
        placeholderTextColor="#9E9E9E"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Photos */}
      <Text style={styles.label}>Photos</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photoRow}
        style={styles.photoScroll}
      >
        {photos.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.photoSlot} />
        ))}
        <TouchableOpacity style={styles.photoAdd} onPress={pickImage}>
          <Text style={styles.picText}>PIC</Text>
          <Ionicons name="add" size={32} color="#9E9E9E" />
        </TouchableOpacity>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => {}}>
        <Text style={styles.addButtonText}>Add</Text>
      </TouchableOpacity>

      {/* Color Modal */}
      <Modal visible={colorOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setColorOpen(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Color</Text>
            <FlatList
              data={COLOR_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => { setSelectedColor(item); setColorOpen(false); }}
                >
                  <View style={[styles.colorDot, { backgroundColor: item.hex }]} />
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Difficulty Modal */}
      <Modal visible={difficultyOpen} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} onPress={() => setDifficultyOpen(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Difficulty</Text>
            <FlatList
              data={DIFFICULTY_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => { setSelectedDifficulty(item); setDifficultyOpen(false); }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
    marginBottom: 20,
  },
  inputMultiline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
    marginBottom: 20,
    minHeight: 90,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dropdownText: {
    fontSize: 15,
    color: '#212121',
  },
  dropdownPlaceholder: {
    fontSize: 15,
    color: '#9E9E9E',
  },
  colorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoScroll: {
    marginBottom: 20,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 4,
  },
  photoSlot: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  photoAdd: {
    width: 110,
    height: 110,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderStyle: 'dashed',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  picText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9E9E9E',
    letterSpacing: 1,
  },
  addButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    width: 260,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionText: {
    fontSize: 15,
    color: '#212121',
  },
});
