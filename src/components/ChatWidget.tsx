"use client";

import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    // CSS n8n
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css';
    document.head.appendChild(link);

    // Couleurs Woutty
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --chat--color--primary: #D4A017;
        --chat--color--primary-shade-50: #B88A14;
        --chat--color--primary--shade-100: #9E7611;
        --chat--color--secondary: #D4A017;
        --chat--color-secondary-shade-50: #B88A14;
        --chat--color-dark: #111827;
        --chat--header--background: #111827;
        --chat--header--color: #ffffff;
        --chat--toggle--background: #D4A017;
        --chat--toggle--hover--background: #B88A14;
        --chat--toggle--active--background: #9E7611;
        --chat--toggle--color: #ffffff;
        --chat--message--user--background: #D4A017;
        --chat--message--user--color: #ffffff;
        --chat--message--bot--background: #F9FAFB;
        --chat--message--bot--color: #111827;
        --chat--button--background--primary: #D4A017;
        --chat--button--background--primary--hover: #B88A14;
        --chat--input--send--button--color: #D4A017;
        --chat--input--send--button--color-hover: #B88A14;
        --chat--input--background: #ffffff;
        --chat--input--text-color: #111827;
        --chat--input--container--background: #ffffff;
        --chat--window--width: 380px;
        --chat--window--height: 600px;
      }
      .chat-inputs textarea,
      .chat-inputs input,
      .n8n-chat textarea,
      .n8n-chat input {
        color: #111827 !important;
        background: #ffffff !important;
        -webkit-text-fill-color: #111827 !important;
      }
      }
    `;
    document.head.appendChild(style);

    // Script module (même approche que le fichier HTML fourni)
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { createChat } from "https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js";
      createChat({
        webhookUrl: "https://boostertalent.app.n8n.cloud/webhook/b4d75f16-f24e-4ca0-97a6-49502970c201/chat",
        mode: "window",
        loadPreviousSession: true,
        showWelcomeScreen: false,
        initialMessages: [
          "Bonjour 👋",
          "Je suis l'assistant de Woutty, que puis-je faire pour vous ?"
        ],
        i18n: {
          en: {
            title: "Salut !",
            subtitle: "Posez votre question, je suis là pour vous aider.",
            footer: "",
            getStarted: "Nouvelle conversation",
            inputPlaceholder: "Ecrivez votre message..."
          }
        }
      });
    `;
    document.body.appendChild(script);
  }, []);

  return null;
}
