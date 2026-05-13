import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGyms, getActiveBoulders, createBoulder, updateGym, type Gym, type Boulder } from '../services/gymService';
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

    // --- ESTADOS DAS VIAS ---
    const [boulders, setBoulders] = useState<Boulder[]>([]);
    const [newColor, setNewColor] = useState('');
    const [newGrade, setNewGrade] = useState('V0');
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
            const dataHoje = new Date().toISOString().split('T')[0];
            const novoBoulder = await createBoulder(selectedGym.id, {
                color: newColor,
                hexColor: '#808080',
                grade: newGrade,
                setterName: 'Koro',
                setDate: dataHoje,
                imageUrl: null
            });

            setBoulders([novoBoulder, ...boulders]);
            setNewColor('');
            alert('Via adicionada à parede!');
        } catch (error: any) {
            alert('Erro ao adicionar via: ' + error.message);
        }
    };

    const handleLogout = () => {
        contextLogout();
        navigate('/login');
    };

    if (authLoading || isLoading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>A carregar o teu Império... 🏢</h2>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '10px' }}>
                <h1>🏢 Portal de Gestão</h1>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Sair da Conta
                </button>
            </div>

            {/* PAREDE DE BLOQUEIO: owner pendente de ativação */}
            {user?.status === 'PENDING' && <ActivationWallCard />}

            {/* DASHBOARD NORMAL: owner verificado */}
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

                    {/* --- CABEÇALHO DO GINÁSIO (MODO VISUALIZAÇÃO OU EDIÇÃO) --- */}
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '30px' }}>
                        {!isEditingGym ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h2 style={{ fontSize: '28px', margin: '0 0 10px 0' }}>{selectedGym.name}</h2>
                                    <p style={{ color: '#4b5563', margin: '0 0 5px 0' }}><strong>Morada:</strong> {selectedGym.address || 'Não definida'}</p>
                                    <p style={{ color: '#4b5563', margin: '0' }}><strong>Cidade:</strong> {selectedGym.city}</p>
                                    <p style={{ color: '#4b5563', margin: '0' }}><strong>Imagem:</strong> {selectedGym.coverImageUrl ? <a href={selectedGym.coverImageUrl} target="_blank" rel="noreferrer">Ver Imagem</a> : 'Não definida'}</p>
                                </div>
                                <button onClick={() => setIsEditingGym(true)} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    ✏️ Editar Dados
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateGym} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <h3>Editar Detalhes do Ginásio</h3>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Nome do Ginásio</label>
                                    <input required value={editName} onChange={e => setEditName(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Morada</label>
                                    <input value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Rua, Cidade, Código Postal..." style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Cidade</label>
                                    <input required value={editCity} onChange={e => setEditCity(e.target.value)} placeholder="Ex: Lisboa, Porto..." style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>URL da Imagem de Capa</label>
                                    <input value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} placeholder="https://exemplo.com/foto.jpg" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        💾 Guardar Alterações
                                    </button>
                                    <button type="button" onClick={() => setIsEditingGym(false)} style={{ padding: '10px 20px', backgroundColor: '#9ca3af', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* --- ZONA DA PAREDE --- */}
                    <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                        <h3>➕ Adicionar Nova Via</h3>
                        <form onSubmit={handleAddBoulder} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Cor (ex: Vermelho)</label>
                                <input required value={newColor} onChange={e => setNewColor(e.target.value)} style={{ width: '90%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Grau</label>
                                <select value={newGrade} onChange={e => setNewGrade(e.target.value)} style={{ width: '90%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                                    <option value="V0">V0 (Fácil)</option>
                                    <option value="V1">V1</option>
                                    <option value="V2">V2</option>
                                    <option value="V3">V3</option>
                                    <option value="V4">V4</option>
                                    <option value="V5">V5 (Difícil)</option>
                                </select>
                            </div>
                            <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', height: '35px' }}>
                                Guardar
                            </button>
                        </form>
                    </div>

                    <h3>Parede Atual ({boulders.length} vias ativas)</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {boulders.map(boulder => (
                            <div key={boulder.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div>
                                    <strong style={{ fontSize: '18px' }}>{boulder.grade}</strong> - Via {boulder.color}
                                </div>
                                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                                    Setter: {boulder.setterName || 'Desconhecido'}
                                </div>
                            </div>
                        ))}
                        {boulders.length === 0 && <p style={{ color: 'gray' }}>Não tens vias na parede. Adiciona uma em cima!</p>}
                    </div>
                </div>
            )}
            </>
            )}
        </div>
    );
}
