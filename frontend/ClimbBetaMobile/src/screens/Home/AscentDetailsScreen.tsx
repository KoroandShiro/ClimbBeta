/**
 * @file AscentDetailsScreen.tsx
 * @description Ecrã de detalhe de uma subida (ascent/beta).
 */
import React, { useCallback, useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput,
    ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import {
    FeedItem, CommentItem, getAscentDetail, getComments, addComment, likeAscent, unlikeAscent,
} from '../../services/ascentService';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=800&q=80';
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

const LOG_TYPE_LABEL: Record<string, string> = {
    INDOOR: '🏢 Gym', FREELOG_GYM: '🏢 Gym · Free', OUTDOOR: '⛰️ Outdoor',
};

/**
 * Real ascent detail screen: fetches the enriched ascent + its comments by id,
 * supports liking and posting a comment. Replaces the previous static mock.
 */
export default function AscentDetailsScreen({ route }: any) {
    const ascentId: number = route.params?.ascentId;
    const headerHeight = useHeaderHeight();

    const [detail, setDetail] = useState<FeedItem | null>(null);
    const [comments, setComments] = useState<CommentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newComment, setNewComment] = useState('');
    const [posting, setPosting] = useState(false);

    useFocusEffect(
        useCallback(() => {
            let active = true;
            (async () => {
                try {
                    setLoading(true);
                    setError(null);
                    const [d, c] = await Promise.all([getAscentDetail(ascentId), getComments(ascentId)]);
                    if (active) { setDetail(d); setComments(c); }
                } catch (e: any) {
                    if (active) setError(e?.message ?? 'Could not load this ascent.');
                } finally {
                    if (active) setLoading(false);
                }
            })();
            return () => { active = false; };
        }, [ascentId])
    );

    async function toggleLike() {
        if (!detail) return;
        const wasLiked = detail.likedByMe ?? false;
        setDetail({ ...detail, likedByMe: !wasLiked, likeCount: (detail.likeCount ?? 0) + (wasLiked ? -1 : 1) });
        try {
            if (wasLiked) await unlikeAscent(ascentId); else await likeAscent(ascentId);
        } catch {
            setDetail((d) => d ? { ...d, likedByMe: wasLiked, likeCount: (d.likeCount ?? 0) + (wasLiked ? 1 : -1) } : d);
        }
    }

    async function submitComment() {
        const text = newComment.trim();
        if (!text || posting) return;
        try {
            setPosting(true);
            const created = await addComment(ascentId, text);
            setComments((prev) => [...prev, created]);
            setNewComment('');
            setDetail((d) => d ? { ...d, commentCount: (d.commentCount ?? 0) + 1 } : d);
        } catch (e: any) {
            Alert.alert('Could not comment', e?.message ?? 'Please try again.');
        } finally {
            setPosting(false);
        }
    }

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color="#2E7D32" /></View>;
    }
    if (error || !detail) {
        return <View style={styles.center}><Text style={styles.errorText}>{error ?? 'Ascent not found.'}</Text></View>;
    }

    const a = detail.ascent;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={headerHeight}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 12 }} keyboardShouldPersistTaps="handled">
                <Image source={{ uri: detail.postImageUrl ?? FALLBACK_IMG }} style={styles.heroImage} />

                <View style={styles.content}>
                    <View style={styles.authorRow}>
                        <Image source={{ uri: detail.authorAvatarUrl ?? DEFAULT_AVATAR }} style={styles.avatar} />
                        <Text style={styles.author}>{detail.authorUsername}</Text>
                        <Text style={styles.typeLabel}>{LOG_TYPE_LABEL[detail.logType ?? 'FREELOG_GYM']}</Text>
                    </View>

                    <Text style={styles.routeTitle}>
                        {detail.routeName ?? 'Logged'}
                        {detail.routeGrade ? <Text style={styles.grade}>  ({detail.routeGrade})</Text> : null}
                    </Text>
                    <Text style={styles.location}>
                        {detail.logType === 'INDOOR' ? (detail.gymName ?? 'Partner Gym')
                            : detail.logType === 'OUTDOOR' ? 'Outdoor'
                            : (a.freelogGymName ?? 'Gym')}
                    </Text>

                    {a.style ? (
                        <View style={styles.styleChip}><Text style={styles.styleText}>✨ {a.style}</Text></View>
                    ) : null}

                    {/* Like bar */}
                    <View style={styles.likeRow}>
                        <TouchableOpacity style={styles.likeBtn} onPress={toggleLike}>
                            <Ionicons name={detail.likedByMe ? 'heart' : 'heart-outline'} size={26} color={detail.likedByMe ? '#E0245E' : '#111'} />
                            <Text style={styles.likeText}>{detail.likeCount ?? 0}</Text>
                        </TouchableOpacity>
                    </View>

                    {a.notes ? (
                        <>
                            <Text style={styles.sectionTitle}>Notes / Beta</Text>
                            <Text style={styles.notes}>{a.notes}</Text>
                        </>
                    ) : null}

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
                    {comments.length === 0 && <Text style={styles.noComments}>Be the first to comment.</Text>}
                    {comments.map((c) => (
                        <View key={c.id} style={styles.commentBox}>
                            <Image source={{ uri: c.authorAvatarUrl ?? DEFAULT_AVATAR }} style={styles.commentAvatar} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.commentAuthor}>{c.authorUsername}</Text>
                                <Text style={styles.commentText}>{c.text}</Text>
                            </View>
                        </View>
                    ))}

                </View>
            </ScrollView>

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={submitComment} disabled={posting}>
                    {posting ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={20} color="#fff" />}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
    errorText: { color: '#c62828', textAlign: 'center' },
    heroImage: { width: '100%', height: 360, resizeMode: 'cover', backgroundColor: '#eee' },
    content: { padding: 20 },
    authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', marginRight: 10 },
    author: { fontSize: 15, fontWeight: '700', color: '#111', flex: 1 },
    typeLabel: { fontSize: 12, color: '#555', fontWeight: '600' },
    routeTitle: { fontSize: 24, fontWeight: 'bold', color: '#222' },
    grade: { color: '#2E7D32' },
    location: { fontSize: 14, color: '#777', marginTop: 4, marginBottom: 12 },
    styleChip: { backgroundColor: '#E8F5E9', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginBottom: 8 },
    styleText: { color: '#2E7D32', fontWeight: 'bold' },
    likeRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
    likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    likeText: { fontSize: 16, fontWeight: '600', color: '#111' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
    notes: { fontSize: 15, color: '#444', lineHeight: 22 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    noComments: { color: '#999', fontStyle: 'italic', marginBottom: 10 },
    commentBox: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-start' },
    commentAvatar: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#e0e0e0', marginRight: 10 },
    commentAuthor: { fontWeight: 'bold', color: '#333', marginBottom: 2 },
    commentText: { color: '#555' },
    inputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
    input: { flex: 1, backgroundColor: '#f0f0f0', padding: 12, borderRadius: 20, marginRight: 10 },
    sendBtn: { backgroundColor: '#2E7D32', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
