import React, { useState } from "react";
import './chatWidget.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots, faArrowDown, faArrowRight, faArrowLeft, faArrowUp } from "@fortawesome/free-solid-svg-icons";

const mockChats = [
  {
    id: 1,
    name: "William Johnson",
    job: "Web Tasarımcı",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    messages: [
      { text: "Merhaba! Yardımcı olabilir miyim?", sender: "mentor" },
      { text: "Evet, bir mentora ulaşmak istiyorum.", sender: "user" }
    ]
  },
  {
    id: 2,
    name: "Ayşe Yılmaz",
    job: "Mobil Geliştirici",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    messages: [
      { text: "Selam! Mobil geliştirme hakkında sorunuz var mı?", sender: "mentor" }
    ]
  }
];

export default function ChatWidget() {
  const [barOpen, setBarOpen] = useState(false);
  const [barClosing, setBarClosing] = useState(false); // <-- yeni state
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chats, setChats] = useState(mockChats);
  const [newMessages, setNewMessages] = useState({});
  const [chatClosing, setChatClosing] = useState(false); // yeni state

  // Barı aç/kapat fonksiyonu
  const handleBarToggle = () => {
    if (barOpen) {
      setBarClosing(true);
      setTimeout(() => {
        setBarOpen(false);
        setBarClosing(false);
      }, 200); // animasyon süresi ile aynı olmalı
    } else {
      setBarOpen(true);
    }
  };

  // Sohbet önizlemesine tıklayınca pencereyi aç
  const handleChatOpen = (chatId) => setSelectedChatId(chatId);

  // Sohbet penceresini kapat
  const handleChatClose = () => setSelectedChatId(null);

  // Mesaj gönder
  const handleSendMessage = (chatId) => {
    const msg = (newMessages[chatId] || "").trim();
    if (!msg) return;
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...chat.messages, { text: msg, sender: "user" }] }
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
    }, 200); // animasyon süresi ile aynı olmalı
  };

  return (
    <div className="chat-widget-container" style={{ right: 20, bottom: 20 }}>
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
                        <div className="chat-bar-job">{chat.job}</div>
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
                          <p className="chat-widget-mentor-job">{chat.job}</p>
                        </div>
                      </div>
                      {/* Kapatma butonu kaldırıldı */}
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
                            {msg.text}
                          </div>
                        </div>
                      ))}
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
