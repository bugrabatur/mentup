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
  const [unreadCounts, setUnreadCounts] = useState({}); // Okunmamış mesaj sayısını tutan state
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef(null);
  const messageRefs = useRef([]); // Her mesaj için ref
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
    // Sohbetten çıkarken okunduya çek
    if (selectedChatId !== null) {
      const markAsRead = async () => {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5001/message/chatroom/${selectedChatId}/mark-read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const res = await fetch("http://localhost:5001/message/unread-counts", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUnreadCounts(data.unreadCounts || {});
        window.dispatchEvent(new Event("refreshUnreadCount"));
      };
      markAsRead();
    }
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
      // data örneği: [{id, name, photo, messages: [{text, sender, created_at}, ...]}, ...]
      setChats(data.chats || []);
    };
    fetchChats();
  }, []);

  // Okunmamış mesajları çek
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:5001/message/unread-counts", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUnreadCounts(data.unreadCounts || {});
    };
    fetchUnreadCounts();
  }, [chats]); // chats değişince tekrar çek

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

  useEffect(() => {
    const openHandler = () => {
      if (!barOpen) handleBarToggle();
    };
    window.addEventListener("openChatWidget", openHandler);
    return () => window.removeEventListener("openChatWidget", openHandler);
  }, [barOpen]);

  // Mesajlarda tarih başlığı ekleme fonksiyonu
  const renderMessagesWithDateLabels = (messages, unreadCount) => {
    let lastDate = null;
    const days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // İlk okunmamış mesajın indexini bul
    let firstUnreadIndex = -1;
    if (unreadCount > 0) {
      // Son unreadCount kadar mesaj okunmamış demektir (backend öyle döndü varsayımıyla)
      firstUnreadIndex = messages.length - unreadCount;
    }

    // Her mesaj için ref oluştur
    messageRefs.current = messages.map((_, i) => messageRefs.current[i] || React.createRef());

    return messages.map((msg, index) => {
      const msgDate = msg.created_at ? new Date(msg.created_at) : null;
      const msgDay = msgDate ? msgDate.toISOString().slice(0, 10) : null;
      const todayDay = today.toISOString().slice(0, 10);
      const yesterdayDay = yesterday.toISOString().slice(0, 10);

      let dateLabel = null;
      if (msgDay && lastDate !== msgDay) {
        if (msgDay === todayDay) {
          dateLabel = "Bugün";
        } else if (msgDay === yesterdayDay) {
          dateLabel = "Dün";
        } else {
          dateLabel =
            msgDate.toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            }) +
            " " +
            days[msgDate.getDay()];
        }
      }
      lastDate = msgDay;

      return (
        <React.Fragment key={index}>
          {dateLabel && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="chat-widget-date-label">
                {dateLabel}
              </div>
            </div>
          )}
          {/* Okunmamış mesaj etiketi */}
          {index === firstUnreadIndex && unreadCount > 0 && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div className="chat-widget-unread-label">
                {unreadCount} okunmamış mesaj
              </div>
            </div>
          )}
          <div
            ref={messageRefs.current[index]}
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
        </React.Fragment>
      );
    });
  };

  useEffect(() => {
    if (selectedChatId !== null) {
      const markAsRead = async () => {
        const token = localStorage.getItem("token");
        await fetch(`http://localhost:5001/message/chatroom/${selectedChatId}/mark-read`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const res = await fetch("http://localhost:5001/message/unread-counts", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setUnreadCounts(data.unreadCounts || {});
        window.dispatchEvent(new Event("refreshUnreadCount"));
      };
      markAsRead();
    }
  }, [selectedChatId]);

  useEffect(() => {
    if (!selectedChatId) return;
    const unread = unreadCounts[selectedChatId] || 0;
    if (unread > 0 && messageRefs.current.length > 0) {
      // İlk okunmamış mesaja scroll
      const idx = messageRefs.current.length - unread;
      messageRefs.current[idx]?.current?.scrollIntoView({ behavior: "auto", block: "center" });
    } else if (messagesEndRef.current) {
      // Okunmamış yoksa en sona scroll
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [selectedChatId, chats, unreadCounts]);

  const handleScroll = (e) => {
    const el = e.target;
    // Konsola yaz
    // console.log("scroll", el.scrollTop, el.scrollHeight, el.clientHeight);
    if (el.scrollHeight - el.scrollTop - el.clientHeight > 100) {
      setShowScrollDown(true);
    } else {
      setShowScrollDown(false);
    }
  };

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
                      {unreadCounts[chat.id] > 0 && (
                        <div className="chat-bar-unread-badge">
                          {unreadCounts[chat.id]}
                        </div>
                      )}
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
                    <div className="chat-widget-body" onScroll={handleScroll}>
                      {renderMessagesWithDateLabels(chat.messages, unreadCounts[chat.id])}
                      <div ref={messagesEndRef} />
                      {showScrollDown && (
                        <button
                          className="chat-widget-scroll-down-btn"
                          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                        >
                          <FontAwesomeIcon icon={faArrowDown} />
                        </button>
                      )}
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
