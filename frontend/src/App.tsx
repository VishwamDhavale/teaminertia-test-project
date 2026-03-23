import React, { useState, useEffect, useRef } from 'react';
import './index.css';

// Types
export interface Player { id: number; name: string; }
export interface SeatType { seat_number: number; player?: Player; }
export interface HistoryRow { round_id: number; time: string; bets: Record<string, number>; }
export interface ToastMessage { id: number; message: string; type: 'success' | 'error'; }

// API Helper
const API_BASE = '/api';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [seats, setSeats] = useState<SeatType[]>([]);
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [history, setHistory] = useState<{ players: string[], rows: HistoryRow[], totals: Record<string, number>, roundCount: number }>({ players: [], rows: [], totals: {}, roundCount: 0 });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [betDialog, setBetDialog] = useState<{ isOpen: boolean, playerId: number | null, playerName: string }>({ isOpen: false, playerId: null, playerName: '' });
  const [customBet, setCustomBet] = useState('');

  let toastIdCounter = useRef(0);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = toastIdCounter.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const fetchAPI = async (url: string, options: any = {}) => {
    try {
      const res = await fetch(API_BASE + url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'API Error');
      return data;
    } catch (err: any) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  const refreshData = async () => {
    try {
      const p = await fetchAPI('/players');
      const s = await fetchAPI('/seats');
      setPlayers(p);
      setSeats(s);

      const [historyRes, summaryRes] = await Promise.all([
        fetch(API_BASE + '/history').then(r => r.json()),
        fetch(API_BASE + '/history/summary').then(r => r.json())
      ]);

      if (!historyRes.error) {
        setHistory({
          players: historyRes.players,
          rows: historyRes.rows,
          totals: summaryRes.totals,
          roundCount: summaryRes.round_count
        });
        if (!currentRound && historyRes.rows.length > 0) {
          setCurrentRound(historyRes.rows[historyRes.rows.length - 1].round_id);
        }
      }
    } catch (e) {}
  };

  useEffect(() => { refreshData(); }, []);

  const handleStartRound = async () => {
    const seatedCount = seats.filter(s => s.player).length;
    if (seatedCount < 2) {
      showToast('At least 2 players must be seated to start a round!', 'error');
      return;
    }
    const round = await fetchAPI('/rounds', { method: 'POST' });
    setCurrentRound(round.id);
    showToast(`Round #${round.id} Started!`, 'success');
  };

  const handleClearState = async () => {
    if (!confirm("Are you sure you want to completely clear the game state? This will delete all history, rounds, and seat assignments, but keep the players.")) return;
    await fetchAPI('/history', { method: 'DELETE' });
    setCurrentRound(null);
    showToast('Game state cleared successfully!', 'success');
    refreshData();
  };

  const handleAddPlayer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showToast(`Player ${name} already exists`, 'error');
        return;
    }
    await fetchAPI('/players', { method: 'POST', body: JSON.stringify({ name }) });
    showToast(`Player ${name} added!`);
    (e.target as HTMLFormElement).reset();
    refreshData();
  };

  const handleAssignSeat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const seatId = formData.get('seatId');
    const playerId = formData.get('playerId');
    await fetchAPI(`/seats/${seatId}/assign`, { method: 'PATCH', body: JSON.stringify({ player_id: parseInt(playerId as string) }) });
    showToast(`Seat assigned successfully`);
    refreshData();
  };

  const removeSeat = async (seatNumber: number) => {
    await fetchAPI(`/seats/${seatNumber}/remove`, { method: 'PATCH' });
    showToast(`Player removed from Seat ${seatNumber}`);
    refreshData();
  };

  const placeBet = async (playerId: number, amount: number) => {
    if (!currentRound) {
        showToast('Please start a round first!', 'error');
        return;
    }
    await fetchAPI(`/rounds/${currentRound}/bets`, { method: 'POST', body: JSON.stringify({ player_id: playerId, amount }) });
    showToast(`Bet of $${amount} placed successfully!`);
    refreshData();
  };

  const openBetDialog = (playerId: number, playerName: string) => {
      setBetDialog({ isOpen: true, playerId, playerName });
  };

  const closeBetDialog = () => {
      setBetDialog({ isOpen: false, playerId: null, playerName: '' });
      setCustomBet('');
  };

  const handleDialogBet = async (amount: number) => {
      if (betDialog.playerId) {
          if (!confirm(`Are you sure you want to place a bet of $${amount.toLocaleString()} for ${betDialog.playerName}?`)) return;
          try {
              await placeBet(betDialog.playerId, amount);
              closeBetDialog();
          } catch (e) {}
      }
  };

  const handleCustomBetSubmit = () => {
      const cleanedValue = customBet.replace(/[^0-9]/g, '');
      const amount = parseInt(cleanedValue);
      if (!amount || amount <= 0) {
          showToast('Enter a valid bet amount', 'error');
          return;
      }
      handleDialogBet(amount);
  };

  // derived state for selects
  const seatedPlayerIds = seats.filter(s => s.player).map(s => s.player!.id);
  const unseatedPlayers = players.filter(p => !seatedPlayerIds.includes(p.id));
  const availableSeats = seats.filter(s => !s.player);

  useEffect(() => {
    if (currentRound) {
      document.body.classList.add('round-active');
    } else {
      document.body.classList.remove('round-active');
    }
  }, [currentRound]);

  return (
    <div className="app-container">
        <header className="glass-header">
            <h1 className="gradient-text">Casino Royale VIP</h1>
            <div className="round-controls">
                <span className="round-display">
                    {currentRound ? `Current Round: #${currentRound}` : 'No Active Round'}
                </span>
                <button className="btn-glow" onClick={handleStartRound}>Start New Round</button>
                <button className="btn-glow btn-danger" onClick={handleClearState}>Clear Game State</button>
            </div>
        </header>

        <main className="dashboard">
            <section className="table-section">
                <div className="casino-table">
                    <div className="seats-grid">
                        {seats.map(seat => (
                            <div key={seat.seat_number} className={`seat ${seat.player ? 'occupied' : ''}`}>
                                {seat.player && (
                                    <button className="btn-open-bet" onClick={() => openBetDialog(seat.player!.id, seat.player!.name)}>Bet</button>
                                )}
                                <span className="seat-number">Seat {seat.seat_number}</span>
                                <span className="seat-name">{seat.player ? seat.player.name : 'Empty'}</span>
                                {seat.player && (
                                    <button className="btn-remove-seat" onClick={() => removeSeat(seat.seat_number)}>Leave</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <aside className="controls-panel">
                <div className="card glass-card">
                    <h2>Players</h2>
                    <form onSubmit={handleAddPlayer}>
                        <input type="text" name="name" placeholder="Player Name" required />
                        <button type="submit" className="btn-secondary">Add Player</button>
                    </form>
                </div>

                <div className="card glass-card">
                    <h2>Seat Management</h2>
                    <form onSubmit={handleAssignSeat}>
                        <select name="seatId" required defaultValue="">
                            <option value="" disabled>Select Seat</option>
                            {availableSeats.map(s => <option key={s.seat_number} value={s.seat_number}>Seat {s.seat_number}</option>)}
                        </select>
                        <select name="playerId" required defaultValue="">
                            <option value="" disabled>Select Player</option>
                            {unseatedPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button type="submit" className="btn-primary">Assign Seat</button>
                    </form>
                </div>
            </aside>
        </main>

        <section className="history-section">
            <div className="card glass-card history-card">
                <h2>Game History</h2>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Round</th>
                                <th>Time</th>
                                {history.players.map(p => <th key={p}>{p}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {history.rows.map(r => (
                                <tr key={r.round_id}>
                                    <td>#{r.round_id}</td>
                                    <td>{r.time}</td>
                                    {history.players.map(p => (
                                        <td key={`${r.round_id}-${p}`}>{r.bets[p] ? '$' + r.bets[p].toLocaleString() : '-'}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan={2}>TOTALS ({history.roundCount} Rounds)</td>
                                {history.players.map(p => (
                                    <td key={`total-${p}`}>${(history.totals[p] || 0).toLocaleString()}</td>
                                ))}
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </section>

        {betDialog.isOpen && (
            <div style={{position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', zIndex: 100}}>
                <div className="glass-card bet-dialog">
                    <div className="dialog-header">
                        <h2>Place Bet for {betDialog.playerName}</h2>
                        <button className="btn-close" onClick={closeBetDialog}>&times;</button>
                    </div>
                    <div className="dialog-body">
                        <div className="bet-presets dialog-presets">
                            {[5000, 10000, 25000, 50000, 100000].map(amt => (
                                <button key={amt} onClick={() => handleDialogBet(amt)}>${amt >= 1000 ? (amt/1000)+'K' : amt}</button>
                            ))}
                        </div>
                        <div className="custom-bet-container">
                            <input 
                                type="text" 
                                inputMode="numeric" 
                                placeholder="Custom $" 
                                className="bet-input-small"
                                value={customBet}
                                onChange={e => setCustomBet(e.target.value)}
                            />
                            <button className="btn-bet-custom" onClick={handleCustomBetSubmit}>Bet</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast ${t.type}`}>{t.message}</div>
            ))}
        </div>
    </div>
  );
}
