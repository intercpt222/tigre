import React, { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaImage } from 'react-icons/fa';
import io from 'socket.io-client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase'; // Certifique-se de que este arquivo está corretamente configurado
import './Chat.css';
import { IoReloadOutline } from 'react-icons/io5';
import '98.css';
import axios from 'axios'; // Adicionei axios para fazer a requisição à API

const socket = io('https://chat-wp5o.onrender.com', {
  transports: ['websocket'],
});

const Chat = () => {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);
  const [isJoined, setIsJoined] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ top: 200, left: 600 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tokenName, setTokenName] = useState(''); // Adicionado para armazenar o tokenName
  const messagesEndRef = useRef(null);

  // Função para buscar o tokenName da API
  useEffect(() => {
    const fetchTokenName = async () => {
      try {
        const response = await axios.get('https://apitoreturnca.onrender.com/api/purchaseData');
        setTokenName(response.data.tokenName); // Atualiza o tokenName com o valor da API
      } catch (error) {
        console.error('Erro ao buscar o tokenName da API:', error);
      }
    };

    fetchTokenName();
  }, []); // Executa uma vez ao montar o componente

  const joinChat = (storedNickname) => {
    const nick = storedNickname || nickname;
    if (nick) {
      socket.emit('join', nick);
      setIsJoined(true);
      setNickname(nick);
      localStorage.setItem('nickname', nick);

      socket.on('previousMessages', (previousMessages) => {
        setMessages(previousMessages);
      });

      socket.on('message', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on('userList', (userList) => {
        setUserCount(userList.length);
      });
    }
  };

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname) {
      joinChat(storedNickname);
    }

    return () => {
      socket.off('previousMessages');
      socket.off('message');
      socket.off('userList');
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const uploadImageToFirebase = async (imageFile) => {
    try {
      const uniqueName = `${Date.now()}-${imageFile.name}`;
      const imageRef = ref(storage, `images/${uniqueName}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      return imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao enviar a imagem. Por favor, tente novamente.');
      return null;
    }
  };

  const sendMessage = async () => {
    let imageUrl = null;

    if (image) {
      setLoading(true);
      imageUrl = await uploadImageToFirebase(image);
      setLoading(false);
      if (!imageUrl) {
        return;
      }
    }

    if (message.trim() || imageUrl) {
      const newMessage = {
        text: message.trim(),
        image: imageUrl,
        sender: nickname,
        timestamp: new Date(),
      };
      socket.emit('message', newMessage);
      setMessage('');
      setImage(null);
      setImagePreview(null);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Funções de arraste da janela de chat
  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - position.left, y: e.clientY - position.top });
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const newLeft = e.clientX - dragStart.x;
      const newTop = e.clientY - dragStart.y;
      const maxLeft = window.innerWidth - 400; // Substitua com a largura da janela de chat
      const maxTop = window.innerHeight - 300; // Substitua com a altura da janela de chat

      const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));
      const clampedTop = Math.max(0, Math.min(newTop, maxTop));

      setPosition({ left: clampedLeft, top: clampedTop });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  return (
    <div
      className="chat-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {!isJoined ? (
        <div className="join-container window">
          <div className="title-bar">
            <div className="title-bar-text">Login</div>
          </div>
          <div className="window-body">
            <h2>Set your nickname</h2>
            <input
              type="text"
              placeholder="Set your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
            <button className="entrar" onClick={() => joinChat()}>
              Login
            </button>
          </div>
        </div>
      ) : (
        <div
          className="chat-box window"
          style={{ top: position.top, left: position.left, position: 'absolute' }}
        >
          <div
            className="title-bar"
            onMouseDown={handleMouseDown}
          >
            <div className="title-bar-text">✨ {tokenName} ✨</div> {/* TokenName atualizado da API */}
            <div className="title-bar-controls">
              <button aria-label="Maximizar">?</button>
              <button aria-label="Fechar">X</button>
            </div>
          </div>
          <div className="window-body chat-messages">
            <div className="messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.sender === nickname ? 'my-message' : ''
                  }`}
                >
                  <div className="message-content">
                    {msg.sender !== nickname && (
                      <div className="message-nickname">{msg.sender}</div>
                    )}
                    {msg.image && (
                      <img src={msg.image} alt="img" className="message-image" />
                    )}
                    {msg.text && <div className="message-text">{msg.text}</div>}
                  </div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="status-bar env">
            <label htmlFor="image-upload" className="image-upload-label">
              <FaImage size={16} />
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />

            {imagePreview && (
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="message-image-preview"
                />
              </div>
            )}

            <input
              type="text"
              placeholder="Write a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />

            <button onClick={sendMessage} disabled={loading}>
              {loading ? (
                <IoReloadOutline className="load" size={16} />
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
