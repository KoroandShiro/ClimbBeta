import { useState } from 'react';
import { createGym, uploadMedia } from '../services/gymService';
import { useAuth } from '../contexts/AuthContext';

interface Props {
    onCreated: () => void;
    onClose: () => void;
}

export default function CreateGymModal({ onCreated, onClose }: Props) {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        setError('');
        setIsLoading(true);

        try {
            let finalImageUrl: string | undefined = undefined;

            // Upload the cover photo to MinIO first, if the owner picked one
            if (coverFile) {
                finalImageUrl = await uploadMedia(coverFile);
            }

            await createGym({
                ownerId: user.id,
                name,
                address,
                city,
                coverImageUrl: finalImageUrl,
            });

            onCreated();
        } catch (err: any) {
            setError(err.message || 'Could not create the gym. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,30,20,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
            <div style={{ backgroundColor: 'var(--cb-surface)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: 'var(--cb-shadow)', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', color: 'var(--cb-text)' }}>Add gym</h2>
                    <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', color: 'var(--cb-text-muted)', lineHeight: 1 }}>×</button>
                </div>

                {error && <div className="cb-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="cb-field" style={{ marginBottom: 0 }}>
                        <label className="cb-label">Name</label>
                        <input className="cb-input" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Climbing Factory Lisbon" />
                    </div>
                    <div className="cb-field" style={{ marginBottom: 0 }}>
                        <label className="cb-label">Address</label>
                        <input className="cb-input" required value={address} onChange={e => setAddress(e.target.value)} placeholder="Street, number…" />
                    </div>
                    <div className="cb-field" style={{ marginBottom: 0 }}>
                        <label className="cb-label">City</label>
                        <input className="cb-input" required value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Lisbon, Porto…" />
                    </div>
                    <div className="cb-field" style={{ marginBottom: 0 }}>
                        <label className="cb-label">Cover image <span style={{ fontWeight: 400, color: 'var(--cb-text-muted)' }}>(optional)</span></label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setCoverFile(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null)}
                            style={{ width: '100%', padding: '8px', border: '1px dashed var(--cb-border-strong)', borderRadius: 'var(--cb-radius-sm)', boxSizing: 'border-box', backgroundColor: '#F7FAF6' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                        <button type="submit" disabled={isLoading} style={{ flex: 1, height: '44px', backgroundColor: 'var(--cb-primary)', color: 'white', border: 'none', borderRadius: 'var(--cb-radius-sm)', fontWeight: 600, fontSize: '15px', cursor: isLoading ? 'not-allowed' : 'pointer' }}>
                            {isLoading ? 'Saving…' : 'Create gym'}
                        </button>
                        <button type="button" onClick={onClose} style={{ flex: 1, height: '44px', backgroundColor: 'var(--cb-surface)', color: 'var(--cb-text)', border: '1px solid var(--cb-border-strong)', borderRadius: 'var(--cb-radius-sm)', fontWeight: 600, fontSize: '15px', cursor: 'pointer' }}>
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
