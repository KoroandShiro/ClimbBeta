import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGyms, getActiveBoulders, createBoulder, updateGym, archiveBoulder, uploadMedia, type Gym, type Boulder } from '../services/gymService';
import { useAuth } from '../contexts/AuthContext';
import ActivationWallCard from '../components/ActivationWallCard';
import CreateGymModal from '../components/CreateGymModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const { logout: contextLogout, user, isLoading: authLoading } = useAuth();

    const [gyms, setGyms] = useState<Gym[]>([]);
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // --- GYM EDIT STATE ---
    const [isEditingGym, setIsEditingGym] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');
    const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // --- WALL / ROUTES STATE ---
    const [boulders, setBoulders] = useState<Boulder[]>([]);
    const [bouldersLoading, setBouldersLoading] = useState(false);
    const [bouldersError, setBouldersError] = useState<string | null>(null);
    const [newColorName, setNewColorName] = useState('Vermelho');
    const [newHexColor, setNewHexColor] = useState('#EF4444');
    const [newGrade, setNewGrade] = useState('V0');
    const [newSetterName, setNewSetterName] = useState('');
    const [newSetDate, setNewSetDate] = useState(new Date().toISOString().split('T')[0]);

    // File to upload for the new route photo
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [isAddingBoulder, setIsAddingBoulder] = useState(false); // Loading state for the route upload

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;              // ainda a resolver a sessão -> espera
        if (user) {
            loadGyms();                        // user pronto -> vai buscar os ginásios dele
        } else {
            setIsLoading(false);               // sem sessão -> o route guard trata do redirect
        }
    }, [authLoading, user]);

    const loadGyms = async () => {
        try {
            setIsLoading(true);
            const list = await getGyms();
            // Local filter: only show gyms owned by this user
            const myGyms = list.filter(gym => gym.ownerId === user?.id);
            setGyms(myGyms);
        } catch (error) {
            console.error("Error loading gyms", error);
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectGym = async (gym: Gym) => {
        setSelectedGym(gym);
        setEditName(gym.name);
        setEditAddress(gym.address || '');
        setEditCity(gym.city);
        setEditImageUrl(gym.coverImageUrl || '');
        setEditCoverFile(null);
        setIsEditingGym(false);

        // Clear the previous gym's wall and show a loader while this one's routes load.
        setBoulders([]);
        setBouldersError(null);
        setBouldersLoading(true);
        try {
            const activeBoulders = await getActiveBoulders(gym.id);
            setBoulders(activeBoulders);
        } catch (error: any) {
            setBouldersError(error?.message ?? 'Could not load the wall.');
        } finally {
            setBouldersLoading(false);
        }
    };

    const handleUpdateGym = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedGym) return;
        setIsUpdating(true);

        try {
            let finalImageUrl = editImageUrl;

            if (editCoverFile) {
                finalImageUrl = await uploadMedia(editCoverFile);
            }

            const updatedGym = await updateGym(selectedGym.id, {
                name: editName,
                address: editAddress,
                city: editCity,
                coverImageUrl: finalImageUrl
            });

            setSelectedGym(updatedGym);
            setGyms(gyms.map(g => g.id === updatedGym.id ? updatedGym : g));
            setEditImageUrl(finalImageUrl);
            setEditCoverFile(null);
            setIsEditingGym(false);
            alert('Gym updated successfully!');
        } catch (error: any) {
            alert('Error updating gym: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleAddBoulder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedGym) return;

        setIsAddingBoulder(true);

        try {
            let finalImageUrl: string | undefined = undefined;

            // Upload the route photo to MinIO if the owner picked one
            if (newImageFile) {
                finalImageUrl = await uploadMedia(newImageFile);
            }

            const newBoulder = await createBoulder(selectedGym.id, {
                color: newColorName,
                hexColor: newHexColor,
                grade: newGrade,
                setterName: newSetterName || null,
                setDate: newSetDate,
                imageUrl: finalImageUrl || null
            });

            setBoulders([newBoulder, ...boulders]);

            // Partial reset to make bulk creation easier
            setNewGrade('V0');
            setNewImageFile(null); // Clear the selected photo
            alert('Route added to the wall!');
        } catch (error: any) {
            alert('Error adding route: ' + error.message);
        } finally {
            setIsAddingBoulder(false);
        }
    };

    const handleArchive = async (boulderId: number) => {
        if (!window.confirm("Are you sure you want to archive this route? It will be removed from the active wall.")) return;

        try {
            await archiveBoulder(boulderId);
            setBoulders(boulders.filter(b => b.id !== boulderId));
        } catch (error: any) {
            alert("Error archiving route: " + error.message);
        }
    };

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
    };

    if (authLoading || isLoading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading your empire... 🏢</h2>;

    const vGrades = Array.from({ length: 18 }, (_, i) => `V${i}`);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                <h1>🏢 Management Portal</h1>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Log out
                </button>
            </div>

            {user?.status === 'PENDING' && <ActivationWallCard />}

            {user?.status === 'VERIFIED' && (
            <>
            {showCreateModal && (
                <CreateGymModal
                    onCreated={() => { loadGyms(); setShowCreateModal(false); }}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {!selectedGym ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0 }}>My Gyms</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{ padding: '10px 20px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + Add Gym
                        </button>
                    </div>
                    {gyms.length === 0 ? (
                        <p style={{ color: 'gray' }}>You have no gyms linked to this account. Add your first gym!</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                            {gyms.map(gym => (
                                <div key={gym.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        {gym.coverImageUrl ? (
                                            <img src={gym.coverImageUrl} alt="Cover" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                        ) : (
                                            <div style={{ width: '60px', height: '60px', backgroundColor: '#e5e7eb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '20px' }}>🏢</div>
                                        )}
                                        <div>
                                            <strong style={{ fontSize: '20px', display: 'block' }}>{gym.name}</strong>
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>📍 {gym.address || 'No address on file'} - {gym.city}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleSelectGym(gym)}
                                        style={{ padding: '10px 20px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Manage Gym ➔
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <button
                        onClick={() => setSelectedGym(null)}
                        style={{ marginBottom: '20px', padding: '8px 12px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer', color: '#374151' }}
                    >
                        ⬅ Back to list
                    </button>

                    {/* --- GYM HEADER --- */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>

                        {!isEditingGym ? (
                            <>
                                {selectedGym.coverImageUrl && (
                                    <img
                                        src={selectedGym.coverImageUrl}
                                        alt={`Cover of ${selectedGym.name}`}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '6px', marginBottom: '20px' }}
                                    />
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ fontSize: '28px', margin: '0 0 10px 0' }}>{selectedGym.name}</h2>
                                        <p style={{ color: '#4b5563', margin: '0 0 5px 0' }}><strong>Address:</strong> {selectedGym.address || 'Not set'}</p>
                                        <p style={{ color: '#4b5563', margin: '0' }}><strong>City:</strong> {selectedGym.city}</p>
                                    </div>
                                    <button onClick={() => setIsEditingGym(true)} style={{ padding: '8px 16px', backgroundColor: '#E8912D', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        ✏️ Edit details
                                    </button>
                                </div>
                            </>
                        ) : (
                            // EDIT MODE
                            <form onSubmit={handleUpdateGym} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <h3>Edit Gym Details</h3>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Gym Name</label>
                                    <input required value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Address</label>
                                    <input required value={editAddress} onChange={e => setEditAddress(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>City</label>
                                    <input required value={editCity} onChange={e => setEditCity(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }} />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Change Cover Image</label>
                                    {editImageUrl && !editCoverFile && (
                                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>You already have an image. Uploading will replace it.</p>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => {
                                            if (e.target.files && e.target.files.length > 0) {
                                                setEditCoverFile(e.target.files[0]);
                                            } else {
                                                setEditCoverFile(null);
                                            }
                                        }}
                                        style={{ width: '100%', padding: '8px', border: '1px dashed #d1d5db', borderRadius: '4px', boxSizing: 'border-box' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" disabled={isUpdating} style={{ padding: '10px 20px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '4px', cursor: isUpdating ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                                        {isUpdating ? 'Processing...' : '💾 Save'}
                                    </button>
                                    <button type="button" onClick={() => { setIsEditingGym(false); setEditCoverFile(null); }} style={{ padding: '10px 20px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* --- ADD ROUTE ZONE --- */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '25px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>➕ Add New Route to the Wall</h3>

                        <form onSubmit={handleAddBoulder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Base Color</label>
                                <select value={newColorName} onChange={e => setNewColorName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                                    <option value="Vermelho">Vermelho</option>
                                    <option value="Azul">Azul</option>
                                    <option value="Verde">Verde</option>
                                    <option value="Amarelo">Amarelo</option>
                                    <option value="Preto">Preto</option>
                                    <option value="Branco">Branco</option>
                                    <option value="Outra">Outra (Define na Hex)</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Hex Color (Tag)</label>
                                <input type="color" required value={newHexColor} onChange={e => setNewHexColor(e.target.value)} style={{ width: '100%', padding: '2px', border: '1px solid #d1d5db', borderRadius: '4px', height: '42px', cursor: 'pointer' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Difficulty Grade</label>
                                <select value={newGrade} onChange={e => setNewGrade(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                                    {vGrades.map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Set Date</label>
                                <input type="date" required value={newSetDate} onChange={e => setNewSetDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Setter Name</label>
                                <input type="text" placeholder="e.g. John Smith" value={newSetterName} onChange={e => setNewSetterName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                            </div>

                            {/* --- ROUTE PHOTO FILE INPUT --- */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Route Photo (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={e => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            setNewImageFile(e.target.files[0]);
                                        } else {
                                            setNewImageFile(null);
                                        }
                                    }}
                                    // Key tied to state so the input clears when the state resets
                                    key={newImageFile ? 'has-file' : 'empty'}
                                    style={{ width: '100%', padding: '8px', border: '1px dashed #d1d5db', borderRadius: '4px', backgroundColor: '#f9fafb', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button
                                    type="submit"
                                    disabled={isAddingBoulder}
                                    style={{ padding: '12px 24px', backgroundColor: '#2E7D32', color: 'white', border: 'none', borderRadius: '6px', cursor: isAddingBoulder ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '15px' }}
                                >
                                    {isAddingBoulder ? '⏳ Processing image...' : '✅ Publish Route'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- WALL LISTING WITH ARCHIVE --- */}
                    <h3 style={{ color: '#1f2937' }}>Current Wall ({boulders.length} active routes)</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {bouldersLoading && (
                            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Loading routes...</p>
                        )}
                        {!bouldersLoading && bouldersError && (
                            <p style={{ color: '#dc2626', textAlign: 'center', padding: '20px' }}>{bouldersError}</p>
                        )}
                        {!bouldersLoading && !bouldersError && boulders.map(boulder => (
                            <div key={boulder.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderLeft: `6px solid ${boulder.hexColor || '#ccc'}`, borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {boulder.imageUrl && (
                                        <img src={boulder.imageUrl} alt="Route" style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                                    )}
                                    <div>
                                        <strong style={{ fontSize: '18px', color: '#111827' }}>{boulder.grade}</strong>
                                        <span style={{ fontSize: '16px', color: '#4b5563', marginLeft: '8px' }}>Route {boulder.color}</span>
                                        <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                                            Setter: {boulder.setterName || 'N/A'} • Set on {new Date(boulder.setDate).toLocaleDateString('en-GB')}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleArchive(boulder.id)}
                                    style={{ padding: '8px 14px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Archive 🗑️
                                </button>
                            </div>
                        ))}
                        {!bouldersLoading && !bouldersError && boulders.length === 0 && (
                            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No routes on the wall. Add your first route above!</p>
                        )}
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
}
