import { useRef, useEffect, useCallback, useState } from 'react';
import { UserLocation } from '../models';
import WebView from 'react-native-webview';

interface UseWebViewMapProps {
  userLocation: UserLocation;
  recyclables: any;
}

interface Output {
  webviewRef: React.RefObject<WebView>;
  handleMapMessage: (event: any, onMarkerClick: (id: string, item: any) => void) => void;
  sendMarkersToMap: () => void;
  handleWebViewLoad: () => void;
}

export function useWebViewMap({ userLocation, recyclables }: UseWebViewMapProps): Output {
  const webviewRef = useRef<WebView>(null);
  const [webviewLoaded, setWebviewLoaded] = useState(false);

  const sendMarkersToMap = useCallback(() => {
    if (webviewRef.current && webviewLoaded && userLocation && recyclables) {
      const jsCode = `
        try {
          if (window.renderMarkers) {
            window.renderMarkers({
              userLocation: ${JSON.stringify(userLocation)},
              recyclables: ${JSON.stringify(recyclables)}
            });
          } else {
            setTimeout(() => {
              if (window.renderMarkers) {
                window.renderMarkers({
                  userLocation: ${JSON.stringify(userLocation)},
                  recyclables: ${JSON.stringify(recyclables)}
                });
              }
            }, 500);
          }
        } catch (error) {
          console.error('Erro ao renderizar marcadores:', error);
        }
      `;

      webviewRef.current.injectJavaScript(jsCode);
    }
  }, [userLocation, recyclables, webviewLoaded]);

  const handleMapMessage = useCallback((event: any, onMarkerClick: (id: string, item: any) => void) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === "marker_click") {
        onMarkerClick(message.id, message.item);
      }
    } catch (error) {
      console.error('Erro ao processar mensagem do mapa:', error);
    }
  }, []);

  // Envia marcadores quando WebView carrega e dados estão disponíveis
  useEffect(() => {
    if (webviewLoaded) {
      // Pequeno delay para garantir que o mapa foi inicializado
      const timer = setTimeout(() => {
        sendMarkersToMap();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [webviewLoaded, sendMarkersToMap]);

  const handleWebViewLoad = useCallback(() => {
    setWebviewLoaded(true);
  }, []);

  return {
    webviewRef,
    handleMapMessage,
    sendMarkersToMap,
    handleWebViewLoad,
  };
}