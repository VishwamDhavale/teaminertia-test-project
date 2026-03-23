const API_BASE = '/api';

let players = [];
let seats = [];
let currentRound = null;

const formAddPlayer = document.getElementById('formAddPlayer');
const formAssignSeat = document.getElementById('formAssignSeat');
const formPlaceBet = document.getElementById('formPlaceBet');
const btnStartRound = document.getElementById('btnStartRound');
const seatsContainer = document.getElementById('seatsContainer');
const selectPlayer = document.getElementById('selectPlayer');
const toastContainer = document.getElementById('toastContainer');

document.addEventListener('DOMContentLoaded', () => {
    refreshData();
});

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

async function fetchAPI(url, options = {}) {
    try {
        const res = await fetch(API_BASE + url, {
            ...options,
            headers: { 'Content-Type': 'application/json', ...options.headers }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'API Error');
        return data;
    } catch (err) {
        showToast(err.message, 'error');
        throw err;
    }
}

// --- Snapshot & Rollback Helpers ---
function takeSnapshot() {
    return {
        players: JSON.parse(JSON.stringify(players)),
        seats: JSON.parse(JSON.stringify(seats)),
        currentRound
    };
}

function restoreSnapshot(snap) {
    players = snap.players;
    seats = snap.seats;
    currentRound = snap.currentRound;
    updateSelects();
    renderSeats();
    renderHistoryFromServer();
    updateRoundDisplay();
}

function updateRoundDisplay() {
    const el = document.getElementById('currentRoundDisplay');
    if (currentRound) {
        el.innerText = `Current Round: #${currentRound}`;
        document.body.classList.add('round-active');
    } else {
        el.innerText = 'No Active Round';
        document.body.classList.remove('round-active');
    }
}

// --- Data Fetching ---
async function refreshData() {
    try {
        [players, seats] = await Promise.all([
            fetchAPI('/players'),
            fetchAPI('/seats')
        ]);
        updateSelects();
        renderSeats();
        renderHistoryFromServer();
    } catch(e) {}
}

function updateSelects() {
    const seatedPlayerIds = seats.filter(s => s.player).map(s => s.player.id);
    const unseatedPlayers = players.filter(p => !seatedPlayerIds.includes(p.id));
    
    const options = '<option value="">Select Player</option>' + 
        unseatedPlayers.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    selectPlayer.innerHTML = options;
    
    const selectSeat = document.getElementById('selectSeat');
    const availableSeats = seats.filter(s => !s.player);
    const seatOptions = '<option value="">Select Seat</option>' + 
        availableSeats.map(s => `<option value="${s.seat_number}">Seat ${s.seat_number}</option>`).join('');
    if(selectSeat) selectSeat.innerHTML = seatOptions;
}

function renderSeats() {
    seatsContainer.innerHTML = '';
    seats.forEach(seat => {
        const div = document.createElement('div');
        div.className = `seat ${seat.player ? 'occupied' : ''}`;
        
        let betUI = '';
        if (seat.player) {
            const safeName = seat.player.name.replace(/'/g, "\\'");
            betUI = `
                <button class="btn-open-bet" onclick="openBetDialog(${seat.player.id}, '${safeName}')">Bet</button>
            `;
        }

        div.innerHTML = `
            ${seat.player ? betUI : ''}
            <span class="seat-number">Seat ${seat.seat_number}</span>
            <span class="seat-name">${seat.player ? seat.player.name : 'Empty'}</span>
            ${seat.player ? `<button class="btn-remove-seat" onclick="removeSeat(${seat.seat_number})">Leave</button>` : ''}
        `;
        seatsContainer.appendChild(div);
    });
}

// --- History Rendering ---
async function renderHistoryFromServer() {
    try {
        const [historyRes, summaryRes] = await Promise.all([
            fetch(API_BASE + '/history').then(r => r.json()),
            fetch(API_BASE + '/history/summary').then(r => r.json())
        ]);

        if(historyRes.error) return;

        const { players: histPlayers, rows } = historyRes;
        if (!currentRound && rows && rows.length > 0) {
            currentRound = rows[rows.length - 1].round_id;
            updateRoundDisplay();
        }
        const { totals, round_count } = summaryRes;

        renderHistoryDOM(histPlayers, rows, totals, round_count);
        
    } catch(e) {}
}

function renderHistoryDOM(histPlayers, rows, totals, round_count) {
    const headers = `<th>Round</th><th>Time</th>` + histPlayers.map(p => `<th>${p}</th>`).join('');
    document.getElementById('historyHeaders').innerHTML = headers;

    let bodyHtml = '';
    rows.forEach(r => {
        const cells = histPlayers.map(p => {
            const amount = r.bets[p];
            return `<td>${amount ? '$'+amount.toLocaleString() : '-'}</td>`;
        }).join('');
        bodyHtml += `<tr><td>#${r.round_id}</td><td>${r.time}</td>${cells}</tr>`;
    });
    document.getElementById('historyBody').innerHTML = bodyHtml;

    const footCells = histPlayers.map(p => {
        const tot = totals[p] || 0;
        return `<td>$${tot.toLocaleString()}</td>`;
    }).join('');
    document.getElementById('historyFooter').innerHTML = `<tr><td colspan="2">TOTALS (${round_count} Rounds)</td>${footCells}</tr>`;
}

function clearHistoryDOM() {
    document.getElementById('historyHeaders').innerHTML = '<th>Round</th><th>Time</th>';
    document.getElementById('historyBody').innerHTML = '';
    document.getElementById('historyFooter').innerHTML = '';
}

// =============================================
// OPTIMISTIC UI — All user actions below
// =============================================

// --- Add Player ---
formAddPlayer.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('playerName');
    const name = nameInput.value.trim();
    if (!name) return;
    
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showToast(`Player ${name} already exists`, 'error');
        return;
    }

    // Optimistic: add with temp ID
    const tempId = -Date.now();
    players.push({ id: tempId, name });
    updateSelects();
    nameInput.value = '';
    showToast(`Player ${name} added!`);

    try {
        const created = await fetchAPI('/players', { method: 'POST', body: JSON.stringify({ name }) });
        // Replace temp ID with real ID
        const idx = players.findIndex(p => p.id === tempId);
        if (idx !== -1) players[idx] = created;
        updateSelects();
    } catch {
        // Rollback
        players = players.filter(p => p.id !== tempId);
        updateSelects();
    }
});

// --- Assign Seat ---
formAssignSeat.addEventListener('submit', async (e) => {
    e.preventDefault();
    const seatNumber = parseInt(document.getElementById('selectSeat').value);
    const playerId = parseInt(document.getElementById('selectPlayer').value);
    if (!seatNumber || !playerId) return;

    const player = players.find(p => p.id === playerId);
    if (!player) return;

    const snap = takeSnapshot();

    // Optimistic: update seat locally
    const seatIdx = seats.findIndex(s => s.seat_number === seatNumber);
    if (seatIdx !== -1) {
        seats[seatIdx].player = { id: player.id, name: player.name };
    }
    updateSelects();
    renderSeats();
    showToast(`Seat assigned successfully`);

    try {
        await fetchAPI(`/seats/${seatNumber}/assign`, { method: 'PATCH', body: JSON.stringify({ player_id: playerId }) });
    } catch {
        restoreSnapshot(snap);
    }
});

// --- Remove Seat ---
window.removeSeat = async (seatNumber) => {
    const snap = takeSnapshot();

    // Optimistic: clear seat locally
    const seatIdx = seats.findIndex(s => s.seat_number === seatNumber);
    if (seatIdx !== -1) {
        seats[seatIdx].player = null;
    }
    updateSelects();
    renderSeats();
    showToast(`Player removed from Seat ${seatNumber}`);

    try {
        await fetchAPI(`/seats/${seatNumber}/remove`, { method: 'PATCH' });
    } catch {
        restoreSnapshot(snap);
    }
};

// --- Start Round ---
btnStartRound.addEventListener('click', async () => {
    const seatedCount = seats.filter(s => s.player).length;
    if (seatedCount < 2) {
        showToast('At least 2 players must be seated to start a round!', 'error');
        return;
    }
    try {
        const round = await fetchAPI('/rounds', { method: 'POST' });
        currentRound = round.id;
        updateRoundDisplay();
        showToast(`Round #${round.id} Started!`, 'success');
    } catch {}
});

// --- Place Bet ---
window.placeBet = async (playerId, amount) => {
    if (!currentRound) {
        showToast('Please start a round first!', 'error');
        throw new Error('No active round');
    }
    await fetchAPI(`/rounds/${currentRound}/bets`, { method: 'POST', body: JSON.stringify({ player_id: playerId, amount }) });
    showToast(`Bet of $${amount.toLocaleString()} placed successfully!`);
    renderHistoryFromServer();
};

window.submitCustomBet = (playerId) => {
    const amount = parseInt(document.getElementById(`bet-custom-${playerId}`).value);
    if (!amount || amount <= 0) {
        showToast('Enter a valid bet amount', 'error');
        return;
    }
    placeBet(playerId, amount);
};

// --- Betting Dialog Logic ---
let currentBetPlayerId = null;

window.openBetDialog = (playerId, playerName) => {
    currentBetPlayerId = playerId;
    document.getElementById('betDialogTitle').innerText = `Place Bet for ${playerName}`;
    document.getElementById('betDialog').showModal();
};

window.closeBetDialog = () => {
    currentBetPlayerId = null;
    document.getElementById('dialogBetCustom').value = '';
    document.getElementById('betDialog').close();
};

window.placeDialogBet = async (amount) => {
    if (currentBetPlayerId) {
        const playerName = document.getElementById('betDialogTitle').innerText.replace('Place Bet for ', '');
        if (!confirm(`Are you sure you want to place a bet of $${amount.toLocaleString()} for ${playerName}?`)) {
            return;
        }
        // Close dialog immediately (optimistic)
        const pid = currentBetPlayerId;
        closeBetDialog();
        try {
            await placeBet(pid, amount);
        } catch (e) {}
    }
};

window.submitDialogCustomBet = async () => {
    const input = document.getElementById('dialogBetCustom');
    const cleanedValue = input.value.replace(/[^0-9]/g, '');
    const amount = parseInt(cleanedValue);
    if (!amount || amount <= 0) {
        showToast('Enter a valid bet amount', 'error');
        return;
    }
    if (currentBetPlayerId) {
        const playerName = document.getElementById('betDialogTitle').innerText.replace('Place Bet for ', '');
        if (!confirm(`Are you sure you want to place a bet of $${amount.toLocaleString()} for ${playerName}?`)) {
            return;
        }
        // Close dialog immediately (optimistic)
        const pid = currentBetPlayerId;
        closeBetDialog();
        try {
            await placeBet(pid, amount);
        } catch (e) {}
    }
};

// --- Clear Game State (BIGGEST optimistic win) ---
window.clearGameState = async () => {
    if (!confirm("Are you sure you want to completely clear the game state? This will delete all history, rounds, and seat assignments, but keep the players.")) {
        return;
    }

    const snap = takeSnapshot();

    // Optimistic: instantly clear everything in UI
    seats.forEach(s => s.player = null);
    currentRound = null;
    updateRoundDisplay();
    updateSelects();
    renderSeats();
    clearHistoryDOM();
    showToast('Game state cleared successfully!', 'success');

    try {
        await fetchAPI('/history', { method: 'DELETE' });
    } catch {
        // Rollback on failure
        restoreSnapshot(snap);
        showToast('Failed to clear game state — reverted', 'error');
    }
};
