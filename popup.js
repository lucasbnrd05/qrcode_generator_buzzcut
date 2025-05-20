document.addEventListener('DOMContentLoaded', function () {
  console.log("Popup DOM chargé.");

  const qrcodeContainer = document.getElementById('qrcode');
  const urlDisplay = document.getElementById('url-display');
  const fgColorInput = document.getElementById('fg-color');
  const bgColorInput = document.getElementById('bg-color');
  const qrSizeInput = document.getElementById('qr-size');
  const regenerateBtn = document.getElementById('regenerate-btn');
  const downloadBtn = document.getElementById('download-btn');

  if (!qrcodeContainer || !urlDisplay || !fgColorInput || !bgColorInput || !qrSizeInput || !regenerateBtn || !downloadBtn) {
    console.error("Erreur critique : Un ou plusieurs éléments du DOM n'ont pas été trouvés.");
    if (urlDisplay) urlDisplay.textContent = "Erreur d'initialisation.";
    return;
  }
  console.log("Tous les éléments DOM nécessaires sont trouvés.");

  let currentUrl = '';
  // qrCodeInstance n'est pas crucial si on lit toujours le DOM pour le dataUrl
  const defaultSettings = { fgColor: '#000000', bgColor: '#ffffff', size: 180 };
  let userSettings = { ...defaultSettings };

  loadSettingsAndUrl();

  function loadSettingsAndUrl() {
    console.log("Chargement des paramètres et de l'URL...");
    browser.storage.local.get(['qrSettings_fgColor', 'qrSettings_bgColor', 'qrSettings_size'])
      .then(result => {
        console.log("Paramètres du storage :", result);
        if (result.qrSettings_fgColor) userSettings.fgColor = result.qrSettings_fgColor;
        if (result.qrSettings_bgColor) userSettings.bgColor = result.qrSettings_bgColor;
        if (result.qrSettings_size) userSettings.size = parseInt(result.qrSettings_size, 10);

        fgColorInput.value = userSettings.fgColor;
        bgColorInput.value = userSettings.bgColor;
        qrSizeInput.value = userSettings.size;
        console.log("Inputs UI mis à jour :", userSettings);
        return browser.tabs.query({ active: true, currentWindow: true });
      })
      .then(tabs => {
        if (tabs && tabs[0] && tabs[0].url) {
          currentUrl = tabs[0].url;
          console.log("URL de l'onglet :", currentUrl);
          urlDisplay.textContent = currentUrl;
          if (isValidHttpUrl(currentUrl)) {
            generateQrCode();
          } else {
            displayQrError("URL non valide pour QR Code (doit être http, https, ou ftp).");
          }
        } else {
          console.warn("Impossible de récupérer l'URL de l'onglet.");
          urlDisplay.textContent = 'URL non récupérable.';
          displayQrError("Pas d'URL à afficher.");
        }
      })
      .catch(err => handleError(err, "Erreur pendant loadSettingsAndUrl"));
  }

  function isValidHttpUrl(string) {
    if (!string) return false;
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ftp:";
    } catch (_) {
      return false;
    }
  }

  function generateQrCode() {
    if (!currentUrl || !isValidHttpUrl(currentUrl)) {
      console.warn("Génération QR annulée : URL invalide/manquante.");
      return;
    }
    qrcodeContainer.innerHTML = '';
    console.log(`Génération QR pour : ${currentUrl} [Taille: ${userSettings.size}, FG: ${userSettings.fgColor}, BG: ${userSettings.bgColor}]`);
    try {
      new QRCode(qrcodeContainer, {
        text: currentUrl,
        width: userSettings.size,
        height: userSettings.size,
        colorDark: userSettings.fgColor,
        colorLight: userSettings.bgColor,
        correctLevel: QRCode.CorrectLevel.H
      });
      downloadBtn.disabled = false;
      console.log("QR Code généré.");
    } catch (e) {
      handleError(e, "Erreur lors de la création de QRCode via la librairie");
      displayQrError("Erreur de génération du QR code.");
    }
  }

  function displayQrError(message) {
    qrcodeContainer.innerHTML = `<p style="font-size:12px; text-align:center; padding:10px; color:red;">${message}</p>`;
    downloadBtn.disabled = true;
  }

  function saveSettings() {
    console.log("Sauvegarde des paramètres :", userSettings);
    browser.storage.local.set({
      qrSettings_fgColor: userSettings.fgColor,
      qrSettings_bgColor: userSettings.bgColor,
      qrSettings_size: userSettings.size
    }).catch(err => handleError(err, "Erreur de sauvegarde des paramètres"));
  }

  fgColorInput.addEventListener('input', () => {
    userSettings.fgColor = fgColorInput.value;
    generateQrCode();
    saveSettings();
  });
  bgColorInput.addEventListener('input', () => {
    userSettings.bgColor = bgColorInput.value;
    generateQrCode();
    saveSettings();
  });
  qrSizeInput.addEventListener('change', () => {
    const newSize = parseInt(qrSizeInput.value, 10);
    const minSize = parseInt(qrSizeInput.min, 10);
    const maxSize = parseInt(qrSizeInput.max, 10);
    if (!isNaN(newSize) && newSize >= minSize && newSize <= maxSize) {
      userSettings.size = newSize;
      generateQrCode();
      saveSettings();
    } else {
      console.warn(`Taille invalide : ${newSize}. Doit être entre ${minSize} et ${maxSize}.`);
      qrSizeInput.value = userSettings.size;
    }
  });
  regenerateBtn.addEventListener('click', () => {
    console.log("Bouton Rafraîchir cliqué.");
    userSettings.fgColor = fgColorInput.value;
    userSettings.bgColor = bgColorInput.value;
    userSettings.size = parseInt(qrSizeInput.value, 10);
    generateQrCode();
    saveSettings();
  });

  // --- FONCTION DE TÉLÉCHARGEMENT CORRIGÉE ---
  downloadBtn.addEventListener('click', () => {
    console.log("Bouton Télécharger cliqué.");

    const canvasEl = qrcodeContainer.querySelector('canvas');
    const imgEl = qrcodeContainer.querySelector('img');
    let dataUrl;

    if (canvasEl) {
        console.log("Lecture du QR code depuis <canvas>.");
        dataUrl = canvasEl.toDataURL('image/png');
    } else if (imgEl && imgEl.src && imgEl.src.startsWith('data:image')) {
        console.log("Lecture du QR code depuis <img>.");
        dataUrl = imgEl.src;
    } else {
        handleError(null, "Aucun contenu QR (canvas ou img) trouvé pour le téléchargement.");
        displayQrError("Erreur: QR non trouvé pour DL.");
        return;
    }

    if (!dataUrl) {
        handleError(null, "Data URL vide après lecture du QR code.");
        displayQrError("Erreur: Data URL vide.");
        return;
    }

    let hostname;
    try {
        if (isValidHttpUrl(currentUrl)) {
            hostname = new URL(currentUrl).hostname;
        } else {
            hostname = "qrcode_page";
        }
    } catch (e) {
        hostname = "qrcode_error_url";
        console.warn("Erreur d'analyse de currentUrl pour nom de fichier:", e);
    }
    const filename = `qrcode-${hostname.replace(/\./g, '_')}.png`;

    // Convertir dataUrl en Blob
    fetch(dataUrl)
      .then(res => {
        if (!res.ok) throw new Error(`Fetch (dataUrl) a échoué: ${res.status}`);
        return res.blob();
      })
      .then(originalBlob => {
        const typedBlob = new Blob([originalBlob], { type: 'image/png' });
        const blobUrl = URL.createObjectURL(typedBlob);
        console.log(`Blob URL créé: ${blobUrl} (Type: ${typedBlob.type}, Taille: ${typedBlob.size} octets)`);

        // Méthode principale : Téléchargement via un lien <a>
        try {
          console.log("Tentative de téléchargement via <a> (méthode principale)...");
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link); // Important pour Firefox dans certains cas
          link.click();
          document.body.removeChild(link);
          console.log("Lien <a> cliqué pour téléchargement. Vérifiez vos téléchargements.");
          // Laisser du temps à l'utilisateur pour interagir avec la boîte "Enregistrer sous"
          // avant de révoquer l'URL du blob.
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
            console.log("Blob URL révoquée (après tentative via <a>).");
          }, 15000); // 15 secondes
        } catch (linkError) {
          // Si la méthode <a> échoue (ce qui est rare pour une exception JS ici),
          // on tente d'ouvrir dans un nouvel onglet comme dernier recours.
          handleError(linkError, "Le téléchargement via <a> a échoué. Tentative d'ouverture dans un nouvel onglet.");
          browser.tabs.create({ url: blobUrl })
            .then(() => {
              console.log("Blob URL ouverte dans un nouvel onglet.");
              // Laisser plus de temps car l'utilisateur peut garder l'onglet ouvert.
              setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
                console.log("Blob URL révoquée (après ouverture onglet).");
              }, 60000); // 1 minute
            })
            .catch(tabError => {
              handleError(tabError, "Échec de l'ouverture du Blob URL dans un nouvel onglet.");
              URL.revokeObjectURL(blobUrl); // S'assurer de révoquer en cas d'échec ici aussi.
            });
        }
      })
      .catch(fetchOrBlobError => {
        handleError(fetchOrBlobError, "Erreur lors de la création du Blob à partir de dataUrl.");
      });
  });
  // --- FIN DE LA FONCTION DE TÉLÉCHARGEMENT CORRIGÉE ---

  function handleError(error, contextMessage = 'Une erreur est survenue') {
    console.error(`[ERREUR] ${contextMessage}:`, error ? (error.message || error) : 'Détail inconnu.');
    if (urlDisplay) {
      urlDisplay.textContent = `Erreur. (Voir console)`;
    }
  }
});