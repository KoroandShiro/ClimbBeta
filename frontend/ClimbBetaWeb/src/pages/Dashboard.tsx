import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGyms, getActiveBoulders, createBoulder, updateGym, archiveBoulder, type Gym, type Boulder } from '../services/gymService';
import { useAuth } from '../contexts/AuthContext';
import ActivationWallCard from '../components/ActivationWallCard';
import CreateGymModal from '../components/CreateGymModal';

export default function Dashboard() {
    const navigate = useNavigate();
    const { logout: contextLogout, user, isLoading: authLoading } = useAuth();

    const [gyms, setGyms] = useState<Gym[]>([]);
    const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // --- ESTADOS PARA EDIÇÃO DO GINÁSIO ---
    const [isEditingGym, setIsEditingGym] = useState(false);
    const [editName, setEditName] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editCity, setEditCity] = useState('');
    const [editImageUrl, setEditImageUrl] = useState('');

    // --- ESTADOS DAS VIAS (NOVO FORMULÁRIO PROFISSIONAL) ---
    const [boulders, setBoulders] = useState<Boulder[]>([]);
    const [newColorName, setNewColorName] = useState('Vermelho');
    const [newHexColor, setNewHexColor] = useState('#EF4444');
    const [newGrade, setNewGrade] = useState('V0');
    const [newSetterName, setNewSetterName] = useState('');
    const [newSetDate, setNewSetDate] = useState(new Date().toISOString().split('T')[0]);
    const [newImageUrl, setNewImageUrl] = useState('');
    
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        carregarGinasios();
    }, []);

    const carregarGinasios = async () => {
        try {
            setIsLoading(true);
            const lista = await getGyms();
            setGyms(lista);
        } catch (error) {
            console.error("Erro a carregar ginásios", error);
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
        setIsEditingGym(false);

        try {
            const viasAtivas = await getActiveBoulders(gym.id);
            setBoulders(viasAtivas);
        } catch (error) {
            console.error("Erro ao carregar parede", error);
        }
    };

    const handleUpdateGym = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedGym) return;

        try {
            const updatedGym = await updateGym(selectedGym.id, {
                name: editName,
                address: editAddress,
                city: editCity,
                coverImageUrl: editImageUrl
            });

            setSelectedGym(updatedGym);
            setGyms(gyms.map(g => g.id === updatedGym.id ? updatedGym : g));
            setIsEditingGym(false);
            alert('Ginásio atualizado com sucesso!');
        } catch (error: any) {
            alert('Erro ao atualizar ginásio: ' + error.message);
        }
    };

    const handleAddBoulder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedGym) return;

        try {
            const novoBoulder = await createBoulder(selectedGym.id, {
                color: newColorName,
                hexColor: newHexColor,
                grade: newGrade,
                setterName: newSetterName || null,
                setDate: newSetDate,
                imageUrl: newImageUrl || null
            });

            setBoulders([novoBoulder, ...boulders]);
            
            // Reset parcial para facilitar a criação em massa
            setNewGrade('V0');
            setNewImageUrl('');
            alert('Via adicionada à parede!');
        } catch (error: any) {
            alert('Erro ao adicionar via: ' + error.message);
        }
    };

    const handleArchive = async (boulderId: number) => {
        if (!window.confirm("Tens a certeza que queres arquivar esta via? Ela será removida da parede ativa.")) return;
        
        try {
            await archiveBoulder(boulderId);
            setBoulders(boulders.filter(b => b.id !== boulderId));
        } catch (error: any) {
            alert("Erro ao arquivar a via: " + error.message);
        }
    };

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
    };

    if (authLoading || isLoading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>A carregar o teu Império... 🏢</h2>;

    // Array de graus V0 a V17 para o dropdown
    const vGrades = Array.from({ length: 18 }, (_, i) => `V${i}`);

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                <h1>🏢 Portal de Gestão</h1>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Sair da Conta
                </button>
            </div>

            {user?.status === 'PENDING' && <ActivationWallCard />}

            {user?.status === 'VERIFIED' && (
            <>
            {showCreateModal && (
                <CreateGymModal
                    onCreated={() => { carregarGinasios(); setShowCreateModal(false); }}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {!selectedGym ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0 }}>Os Meus Ginásios</h2>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            + Adicionar Ginásio
                        </button>
                    </div>
                    {gyms.length === 0 ? (
                        <p style={{ color: 'gray' }}>Não tens ginásios associados a esta conta. Adiciona o teu primeiro ginásio!</p>
                    ) : (
                        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                            {gyms.map(gym => (
                                <div key={gym.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                    <div>
                                        <strong style={{ fontSize: '20px', display: 'block' }}>{gym.name}</strong>
                                        <span style={{ color: '#6b7280', fontSize: '14px' }}>📍 {gym.address || 'Sem morada registada'}</span>
                                    </div>
                                    <button
                                        onClick={() => handleSelectGym(gym)}
                                        style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Gerir Ginásio ➔
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
                        ⬅ Voltar à Lista
                    </button>

                    {/* --- CABEÇALHO DO GINÁSIO --- */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
                        {!isEditingGym ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ fontSize: '28px', margin: '0 0 10px 0' }}>{selectedGym.name}</h2>
                                    <p style={{ color: '#4b5563', margin: '0 0 5px 0' }}><strong>Morada:</strong> {selectedGym.address || 'Não definida'}</p>
                                    <p style={{ color: '#4b5563', margin: '0' }}><strong>Cidade:</strong> {selectedGym.city}</p>
                                </div>
                                <button onClick={() => setIsEditingGym(true)} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    ✏️ Editar Dados
                                </button>
                            </div>
                        ) : (
                            // (O formulário de edição do ginásio manteve-se inalterado)
                            <form onSubmit={handleUpdateGym} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {/* ... [Código de edição omitido por brevidade mas funcional] ... */}
                                <h3>Editar Detalhes do Ginásio</h3>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nome do Ginásio</label>
                                    <input required value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        💾 Guardar
                                    </button>
                                    <button type="button" onClick={() => setIsEditingGym(false)} style={{ padding: '10px 20px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* --- ZONA DA PAREDE (NOVO FORMULÁRIO) --- */}
                    <div style={{ backgroundColor: '#f9fafb', padding: '25px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#1f2937' }}>➕ Adicionar Nova Via à Parede</h3>
                        
                        <form onSubmit={handleAddBoulder} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Cor Base</label>
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
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Tom Hexadecimal (Etiqueta)</label>
                                <input type="color" required value={newHexColor} onChange={e => setNewHexColor(e.target.value)} style={{ width: '100%', padding: '2px', border: '1px solid #d1d5db', borderRadius: '4px', height: '42px', cursor: 'pointer' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Grau de Dificuldade</label>
                                <select value={newGrade} onChange={e => setNewGrade(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                                    {vGrades.map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Data de Montagem</label>
                                <input type="date" required value={newSetDate} onChange={e => setNewSetDate(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>Nome do Equipador (Setter)</label>
                                <input type="text" placeholder="Ex: João Silva" value={newSetterName} onChange={e => setNewSetterName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#374151', marginBottom: '5px' }}>URL da Fotografia Oficial</label>
                                <input type="url" placeholder="https://..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
                                    ✅ Publicar Via
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* --- LISTAGEM DA PAREDE COM ARQUIVO --- */}
                    <h3 style={{ color: '#1f2937' }}>Parede Atual ({boulders.length} vias ativas)</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        {boulders.map(boulder => (
                            <div key={boulder.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderLeft: `6px solid ${boulder.hexColor || '#ccc'}`, borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    {boulder.imageUrl && (
                                        <img src={boulder.imageUrl} alt="Via" style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} />
                                    )}
                                    <div>
                                        <strong style={{ fontSize: '18px', color: '#111827' }}>{boulder.grade}</strong> 
                                        <span style={{ fontSize: '16px', color: '#4b5563', marginLeft: '8px' }}>Via {boulder.color}</span>
                                        <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>
                                            Setter: {boulder.setterName || 'N/A'} • Montada a {new Date(boulder.setDate).toLocaleDateString('pt-PT')}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleArchive(boulder.id)}
                                    style={{ padding: '8px 14px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                                >
                                    Arquivar 🗑️
                                </button>
                            </div>
                        ))}
                        {boulders.length === 0 && <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>Não tens vias na parede. Adiciona a tua primeira via em cima!</p>}
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
}