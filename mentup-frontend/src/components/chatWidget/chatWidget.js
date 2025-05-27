import React, { useState, useEffect, useRef } from "react";
import './chatWidget.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown, faArrowRight, faArrowLeft, faArrowUp } from "@fortawesome/free-solid-svg-icons";


export default function ChatWidget() {
  const [barOpen, setBarOpen] = useState(false);
  const [barClosing, setBarClosing] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chats, setChats] = useState([]);
  const [newMessages, setNewMessages] = useState({});
  const [chatClosing, setChatClosing] = useState(false);

  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null);

  // Otomatik scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, selectedChatId, chatClosing]);

  // Barı aç/kapat fonksiyonu
  const handleBarToggle = () => {
    if (barOpen) {
      setBarClosing(true);
      setTimeout(() => {
        setBarOpen(false);
        setBarClosing(false);
      }, 200);
    } else {
      setBarOpen(true);
    }
  };

  // Sohbet önizlemesine tıklayınca pencereyi aç
  const handleChatOpen = (chatId) => setSelectedChatId(chatId);

  // Sohbet penceresini kapat
  const handleChatClose = () => setSelectedChatId(null);

  // Mesaj gönder
  const handleSendMessage = async (chatId) => {
    const msg = (newMessages[chatId] || "").trim();
    if (!msg) return;

    // API'ye gönder
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5001/message/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        chatroom_id: chatId,
        content: msg
      }),
    });
    const data = await res.json();

    // Localde göster (created_at backend'den geliyorsa ekle)
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  text: msg,
                  sender: "user",
                  created_at: data.data?.created_at || new Date().toISOString()
                }
              ]
            }
          : chat
      )
    );
    setNewMessages((prev) => ({ ...prev, [chatId]: "" }));
  };

  // Mesaj input değişikliği
  const handleInputChange = (chatId, value) => {
    setNewMessages((prev) => ({ ...prev, [chatId]: value }));
  };

  // Sohbetten geri dön (animasyonlı)
  const handleBackToList = () => {
    setChatClosing(true);
    setTimeout(() => {
      setSelectedChatId(null);
      setChatClosing(false);
    }, 200);
  };

  useEffect(() => {
    const handleOpenChatRoom = (e) => {
      const { chatroom, mentor } = e.detail;
      if (!chatroom || !chatroom.id) return; // <-- Güvenli kontrol

      if (!mentor || !mentor.id) {
        setChats((prev) => {
          if (prev.some(c => c.id === chatroom.id)) return prev;
          return [
            ...prev,
            {
              id: chatroom.id,
              name: "Mentor",
              photo: "",
              messages: []
            }
          ];
        });
        return;
      }
      setBarOpen(true);
      setBarClosing(false);
      setSelectedChatId(chatroom.id);

      setChats((prev) => {
        if (prev.some(c => c.id === chatroom.id)) return prev;
        return [
          ...prev,
          {
            id: chatroom.id,
            name: mentor.name || "Mentor",
            photo: mentor.photo || "",
            messages: []
          }
        ];
      });
    };
    window.addEventListener("openChatRoom", handleOpenChatRoom);
    return () => window.removeEventListener("openChatRoom", handleOpenChatRoom);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:5001/chatroom/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      // data örneği: [{id, name, photo, messages: [{text, sender}, ...]}, ...]
      setChats(data.chats || []);
    };
    fetchChats();
  }, []);

  // Dışarı tıklanınca pencereyi kapat
  useEffect(() => {
    if (!(barOpen || barClosing)) return;

    const handleClickOutside = (event) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target)) {
        setBarOpen(false);
        setBarClosing(false);
        setSelectedChatId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [barOpen, barClosing]);

  return (
    <div
      className="chat-widget-container"
      style={{ right: 20, bottom: 20 }}
      ref={widgetRef}
    >
      <div className="chat-bar-root">
        {!barOpen && !barClosing && (
          <div className="chat-bar-root-header" onClick={handleBarToggle}>
            <span
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginLeft: 4,
                color: "#fff",
              }}
            >
              Sohbetler
            </span>
            <button
              className="chat-bar-root-close-btn"
            >
              <FontAwesomeIcon
                icon={faArrowUp}
                style={{ fontSize: 13 }}
              />
            </button>
          </div>
        )}
        {(barOpen || barClosing) && (
          <div className={`chat-bar-window${barClosing ? " closing" : ""}`}>
            {/* Sohbetler listesi */}
            {selectedChatId === null && (
              <>
                <div
                  className="chat-bar-header"
                  onClick={handleBarToggle}
                  style={{ cursor: "pointer" }}
                >
                  <span>Sohbetler</span>
                  <button className="chat-bar-close-btn">
                    <FontAwesomeIcon
                      icon={faArrowDown}
                      style={{ fontSize: 14 }}
                    />
                  </button>
                </div>
                <div className="chat-bar-list">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="chat-bar-preview"
                      onClick={() => setSelectedChatId(chat.id)}
                    >
                      <img
                        src={chat.photo}
                        alt={chat.name}
                        className="chat-bar-avatar"
                      />
                      <div className="chat-bar-info">
                        <div className="chat-bar-name">{chat.name}</div>
                        <div className="chat-bar-lastmsg">
                          {chat.messages.length > 0
                            ? chat.messages[chat.messages.length - 1].text
                            : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                  {chats.length === 0 && (
                    <div style={{ color: "#fff", padding: 16 }}>
                      Hiç sohbet yok.
                    </div>
                  )}
                </div>
              </>
            )}
            {/* Seçili sohbet */}
            {selectedChatId !== null &&
              (() => {
                const chat = chats.find((c) => c.id === selectedChatId);
                if (!chat) return null;
                return (
                  <div
                    className={`chat-widget-chat${
                      chatClosing ? " closing" : ""
                    }`}
                  >
                    <div className="chat-widget-header">
                      {/* Sola bakan ok butonu */}
                      <button
                        className="chat-widget-back-button"
                        onClick={handleBackToList}
                        style={{ marginRight: 8 }}
                      >
                        <FontAwesomeIcon icon={faArrowLeft} />
                      </button>
                      <div className="chat-widget-mentor-info">
                        <img
                          src={chat.photo}
                          alt={chat.name}
                          className="chat-widget-mentor-image"
                        />
                        <div>
                          <h3 className="chat-widget-mentor-name">
                            {chat.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                    <div className="chat-widget-body">
                      {chat.messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`chat-widget-message ${
                            msg.sender === "user"
                              ? "chat-widget-user-message"
                              : "chat-widget-mentor-message"
                          }`}
                        >
                          <div
                            className={`chat-widget-message-bubble ${
                              msg.sender === "user"
                                ? "chat-widget-user-bg"
                                : "chat-widget-mentor-bg"
                            }`}
                          >
                            <span>{msg.text}</span>
                            <span className="chat-widget-message-time">
                              {msg.created_at
                                ? new Date(msg.created_at).toLocaleTimeString("tr-TR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  })
                                : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-widget-input-container">
                      <input
                        className="chat-widget-input"
                        value={newMessages[selectedChatId] || ""}
                        onChange={(e) =>
                          handleInputChange(selectedChatId, e.target.value)
                        }
                        placeholder="Mesajınızı yazın..."
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleSendMessage(selectedChatId)
                        }
                      />
                      <button
                        className="chat-widget-send-button"
                        onClick={() => handleSendMessage(selectedChatId)}
                      >
                        <FontAwesomeIcon icon={faArrowRight} />
                      </button>
                    </div>
                  </div>
                );
              })()}
          </div>
        )}
      </div>
    </div>
  );
}
