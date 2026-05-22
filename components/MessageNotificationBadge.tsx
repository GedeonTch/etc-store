"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function MessageNotificationBadge() {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.email) return;

    const fetchUnreadMessages = async () => {
      try {
        const res = await fetch(`/api/messages?email=${encodeURIComponent(session.user.email!)}`);
        if (res.ok) {
          const messages = await res.json();
          const unread = messages.filter((m: any) => m.reponse && !m.reponseLue).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Erreur fetch messages:", err);
      }
    };

    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000); // Vérifier toutes les 30s

    return () => clearInterval(interval);
  }, [session?.user?.email]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
      {unreadCount}
    </span>
  );
}
