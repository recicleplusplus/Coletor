export const htmlMap = `
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    crossorigin=""
  />
  <script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    crossorigin=""
  ></script>

  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
    }
    .leaflet-container {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    // Cria o mapa
    const map = L.map("map").setView([-22.004313, -47.896467], 2);

    // Camada de tiles do OpenStreetMap
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // Função para desenhar markers
    function renderMarkers(data) {
      if (!data) {
        return;
      }

      // Limpa todos os markers anteriores
      if (window.currentMarkers) {
        window.currentMarkers.forEach(m => map.removeLayer(m));
      }
      window.currentMarkers = [];

      // Marker do usuário (bolinha azul)
      if (data.userLocation) {
        const userMarker = L.circleMarker([
          data.userLocation.latitude,
          data.userLocation.longitude
        ], {
          color: '#2196F3',      // Borda azul
          fillColor: '#2196F3',  // Preenchimento azul
          fillOpacity: 1.0,      // Opacidade do preenchimento
          radius: 8,             // Tamanho da bolinha
          weight: 2              // Espessura da borda
        })
          .addTo(map)
          .bindPopup("Você está aqui");
        window.currentMarkers.push(userMarker);
        map.setView([data.userLocation.latitude, data.userLocation.longitude], 14);
      }

      // Markers dos recicláveis
      if (data.recyclables) {
        Object.entries(data.recyclables).forEach(([index, item]) => {
          if (item.status === "done") {
            return;
          }

          const marker = L.marker([
            item.address.latitude,
            item.address.longitude
          ])
            .addTo(map)
            .bindPopup(item.status === "pending" ? "Pendente" : "Em andamento");

          // Evento de clique -> manda para o React Native
          marker.on("click", () => {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({
                type: "marker_click",
                id: index,
                item: item
              })
            );
          });

          window.currentMarkers.push(marker);
        });
      }
    }

    // Renderiza os markers se já houver dados injetados
    if (window.dataFromApp)
      renderMarkers(window.dataFromApp);

    // Expõe função para atualizar via React Native
    window.renderMarkers = renderMarkers;
  </script>
</body>
</html>
`;
