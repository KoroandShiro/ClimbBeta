import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
 import { useNavigate, Link } from 'react-router-dom';
import { getGyms, getActiveBoulders, createBoulder, type Gym, type Boulder } from '../services/gymService';
import { logout } from '../services/authService';

export default function Dashboard() {
    const navigate = useNavigate();
    
    // Estados para guardar os dados da API
    const [gym, setGym] = useState<Gym | null>(null);
    const [boulders, setBoulders] = useState<Boulder[]>([]);
    
    // Estados para o formulário
    const [newColor, setNewColor] = useState('');
    const [newGrade, setNewGrade] = useState('V0');
    const [isLoading, setIsLoading] = useState(true);

    // O useEffect corre mal a página abre (equivalente a "OnLoad")
    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            // 1. Vai buscar todos os ginásios
            const gyms = await getGyms();
            if (gyms.length > 0) {
                const meuGinasio = gyms[0]; // Assumimos que o primeiro é o nosso
                setGym(meuGinasio);
                
                // 2. Vai buscar as vias desse ginásio
                const viasAtivas = await getActiveBoulders(meuGinasio.id);
                setBoulders(viasAtivas);
            }
        } catch (error) {
            console.error("Erro a carregar dados", error);
            // Se der erro (ex: token expirou), manda para o login
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddBoulder = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!gym) return;

        try {
            const dataHoje = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            const novoBoulder = await createBoulder(gym.id, {
                color: newColor,
                hexColor: '#808080', // Default por agora
                grade: newGrade,
                setterName: 'Koro',
                setDate: dataHoje,
                imageUrl: null
            });

            // Adiciona o novo boulder à lista sem ter de recarregar a página toda!
            setBoulders([novoBoulder, ...boulders]);
            setNewColor(''); // Limpa o formulário
            
            alert('Via adicionada à parede!');
        } catch (error: any) {
            alert('Erro ao adicionar via: ' + error.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (isLoading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>A carregar parede... 🧗‍♂️</h2>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            {/* CABEÇALHO */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>{gym ? gym.name : 'O Meu Ginásio'}</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link to="/outdoor" style={{ padding: '8px 12px', background: '#06b6d4', color: 'white', borderRadius: 4, textDecoration: 'none' }}>
                        Outdoor
                    </Link>
                <button onClick={handleLogout} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    Sair
                </button>
                </div>
            </div>

            {/* FORMULÁRIO DE NOVA VIA */}
            <div style={{ backgroundColor: '#f3f4f6', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h3>➕ Adicionar Nova Via</h3>
                <form onSubmit={handleAddBoulder} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Cor (ex: Vermelho)</label>
                        <input required value={newColor} onChange={e => setNewColor(e.target.value)} style={{ width: '90%', padding: '8px' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>Grau</label>
                        <select value={newGrade} onChange={e => setNewGrade(e.target.value)} style={{ width: '90%', padding: '8px' }}>
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

            {/* LISTA DE VIAS */}
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
    );
}