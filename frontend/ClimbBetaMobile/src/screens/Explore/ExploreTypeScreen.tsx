// src/screens/Explore/ExploreTypeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ExploreTypeScreen({ navigation }: any) {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Exploração</Text>
                <Text style={styles.subtitle}>Escolhe o que pretends explorar</Text>
            </View>

            <View style={styles.buttonsContainer}>
                {/* Botão Ginásios */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('GymList')}
                >
                    <ImageBackground
                        source={{ uri: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?auto=format&fit=crop&w=800&q=80' }}
                        style={styles.buttonBackground}
                        imageStyle={{ borderRadius: 16 }}
                    >
                        <View style={styles.buttonOverlay}>
                            <Ionicons name="business" size={48} color="#fff" />
                            <Text style={styles.buttonTitle}>Explore Ginásios</Text>
                            <Text style={styles.buttonSubtitle}>Catálogo indoor disponível</Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>

                {/* Botão Outdoor */}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('OutdoorList')}
                >
                    <ImageBackground
                        source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80' }}
                        style={styles.buttonBackground}
                        imageStyle={{ borderRadius: 16 }}
                    >
                        <View style={styles.buttonOverlay}>
                            <Ionicons name="leaf" size={48} color="#fff" />
                            <Text style={styles.buttonTitle}>Explore Outdoor</Text>
                            <Text style={styles.buttonSubtitle}>Rochas na natureza</Text>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        paddingTop: 30,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    buttonsContainer: {
        padding: 16,
        gap: 16,
    },
    button: {
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonBackground: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonOverlay: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    buttonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 12,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    buttonSubtitle: {
        fontSize: 12,
        color: '#ddd',
        marginTop: 4,
    },
});
