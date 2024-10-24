import React, { useRef, useEffect } from 'react';
import tigre from "./tigre.png";
import styles from './LoginScreen.module.css'; // Usando CSS Modules
import sound from './sound.mp3'; // Verifique o caminho do som

function LoginScreen({ onLogin, tokenName }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // Verifica se o áudio foi carregado corretamente
    const audio = audioRef.current;
    if (audio) {
      audio.oncanplaythrough = () => {
        console.log('O som foi carregado e está pronto para ser tocado.');
      };
      audio.onerror = (error) => {
        console.error('Erro ao carregar o som:', error);
      };
    }
  }, []);

  const handleLogin = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 1; // Garante que o volume está no máximo
      audio.play().then(() => {
        console.log('Som tocado com sucesso.');
        onLogin();
      }).catch((error) => {
        console.error('Erro ao tentar tocar o som:', error);
        // Mesmo que haja erro no som, ainda faz o login
        onLogin();
      });
    } else {
      console.log('Referência de áudio não encontrada.');
      onLogin();
    }
  };

  return (
    <div className={styles.loginScreen}>
      <div className={styles.loginWindow}>
        <div className={styles.titleBar}>
          <div className={styles.titleBarText}>Windows 98 - Login</div>
        </div>
        <div className={styles.windowBody}>
          <div className={styles.loginAvatar}>
            <img src={tigre} alt="User Avatar" />
          </div>
          <div className={styles.fieldRowStacked}>
            <div>Usuário:</div>
            <div>{tokenName}</div>
          </div>
          <button className={styles.loginBtn} onClick={handleLogin}>Login</button>
        </div>
      </div>

      {/* Elemento de áudio para tocar o som do login */}
      <audio ref={audioRef} src={sound} preload="auto" />
    </div>
  );
}

export default LoginScreen;
