// Initialize PeerJS for WebRTC connection
const peer = new Peer();
let conn, playerSymbol; //Conn holds PeerJS connection and playerSymbol stores whether the player is "X" or "O" in the game
const status = document.getElementById("status");
let currentTurn = "X";

// Generate and display the player's Peer ID
peer.on("open", (id) => {
  document.getElementById("peerId").textContent = id;
});

// Function to host a game
function startGame() {
  playerSymbol = "X"; // Host always plays as X
  status.textContent = "Waiting for opponent to connect...";

  // Wait for an opponent to connect
  peer.on("connection", (connection) => {
    conn = connection;
    conn.on("data", handleMove); // Listen for opponent's moves
    status.textContent = "Opponent connected! Your turn.";
  });
}

// Function to join a game
function joinGame() {
  const peerId = document.getElementById("peerInput").value; // Get opponent's ID
  conn = peer.connect(peerId);

  conn.on("open", () => {
    playerSymbol = "O"; // Joining player is always O
    conn.on("data", handleMove); // Listen for moves from opponent
    status.textContent = "Connected! Waiting for opponent's move...";
  });
}

// Handle incoming move from opponent
function handleMove(data) {
  document.querySelectorAll(".cell")[data.index].textContent = data.symbol;
  document.querySelectorAll(".cell")[data.index].classList.add("taken");
  currentTurn = data.symbol === "X" ? "O" : "X";
  status.textContent =
    currentTurn === playerSymbol ? "Your turn!" : "Opponent's turn...";
}

// Function to make a move
function makeMove(index) {
  const cell = document.querySelectorAll(".cell")[index];

  // Check if a connection is established
  if (!conn) {
    return;
  }

  // Check if the cell is already taken
  if (cell.textContent) {
    return;
  }

  // Ensure it's the player's turn
  if (currentTurn !== playerSymbol) {
    return;
  }

  // Mark the cell with the player's symbol
  cell.textContent = playerSymbol;
  cell.classList.add("taken");
  currentTurn = playerSymbol === "X" ? "O" : "X";
  status.textContent = "Opponent's turn...";

  // Send move data to opponent
  conn.send({ index, symbol: playerSymbol });
}
