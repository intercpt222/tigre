import React, { useState, useEffect } from 'react';
import Chat from './Chat';
import LoginScreen from './LoginScreen';
import './App.css';
import axios from 'axios'; // Para fazer requisições HTTP

function App() {
  const [windowPositions, setWindowPositions] = useState({
    caWindow: { top: 700, left: 600 },
    socialWindow: { top: 200, left: 1290 }
  });
  const [draggingWindow, setDraggingWindow] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado para verificar se está logado
  const [purchaseData, setPurchaseData] = useState({
    tokenName: '',
    twitterLink: '',
    telegramLink: '',
    walletAddress: '',
    tokenCA: '',
    link: '',
  });

  // Função para buscar dados da API
  useEffect(() => {
    const fetchPurchaseData = async () => {
      try {
        const response = await axios.get('https://apitoreturnca.onrender.com/api/purchaseData');
        setPurchaseData(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
      }
    };

    fetchPurchaseData();
  }, []);

  const handleMouseDown = (e, windowName) => {
    setDraggingWindow(windowName);
    setDragStart({ x: e.clientX - windowPositions[windowName].left, y: e.clientY - windowPositions[windowName].top });
  };

  const clampPosition = (left, top, windowWidth, windowHeight) => {
    const maxLeft = window.innerWidth - windowWidth;
    const maxTop = window.innerHeight - windowHeight;
    const clampedLeft = Math.max(0, Math.min(left, maxLeft));
    const clampedTop = Math.max(0, Math.min(top, maxTop));
    return { left: clampedLeft, top: clampedTop };
  };

  const handleMouseMove = (e) => {
    if (draggingWindow) {
      const windowElement = document.querySelector(`.${draggingWindow}`);
      const windowWidth = windowElement.offsetWidth;
      const windowHeight = windowElement.offsetHeight;
      const newLeft = e.clientX - dragStart.x;
      const newTop = e.clientY - dragStart.y;
      const { left, top } = clampPosition(newLeft, newTop, windowWidth, windowHeight);

      setWindowPositions((prevPositions) => ({
        ...prevPositions,
        [draggingWindow]: { left, top }
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingWindow(null);
  };

  // Função de login (simples para demonstração)
  const handleLogin = () => {
    setIsLoggedIn(true); // Define como logado após o clique
  };

  if (!isLoggedIn) {
    // Renderiza a tela de login se não estiver logado, passando o tokenName como nome do usuário
    return <LoginScreen onLogin={handleLogin} tokenName={purchaseData.tokenName || "MeuToken"} />;
  }

  return (
    <div className="App" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <div
        className="crt"
        style={{
          color: 'rgba(255,255,255, 0.2)',
          fontFamily: 'monospace',
          fontSize: '18px',
          padding: '0',
          margin: '0',
          position: 'relative',
        }}
      >
        <Chat />

        <div
          className="chat-box window area caWindow"
          style={{ top: windowPositions.caWindow.top, left: windowPositions.caWindow.left, position: 'absolute' }}
          onMouseDown={(e) => handleMouseDown(e, 'caWindow')}
        >
          <div className="title-bar">
            <div className="title-bar-text">✨ Token CA ✨</div>
            <div className="title-bar-controls">
              <button aria-label="Maximizar">?</button>
              <button aria-label="Fechar">X</button>
            </div>
          </div>
          <div className="window-body chat-messages">
            <div className="messages ca">CA: {purchaseData.tokenCA}</div>
          </div>
        </div>

        <div
          className="chat-box window arearedes socialWindow"
          style={{ top: windowPositions.socialWindow.top, left: windowPositions.socialWindow.left, position: 'absolute' }}
          onMouseDown={(e) => handleMouseDown(e, 'socialWindow')}
        >
          <div className="title-bar">
            <div className="title-bar-text">✨ Social Media ✨</div>
            <div className="title-bar-controls">
              <button aria-label="Maximizar">?</button>
              <button aria-label="Fechar">X</button>
            </div>
          </div>
          <div className="window-body chat-messages">
            <div className="messages caa">
              <a target="_blank" href={purchaseData.twitterLink} rel="noreferrer">
                <button>Twitter</button>
              </a>
              <a target="_blank" href={purchaseData.telegramLink} rel="noreferrer">
                <button>Telegram</button>
              </a>
              <a target="_blank" href={purchaseData.link} rel="noreferrer">
                <button>Pump.fun</button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
