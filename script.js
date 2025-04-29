// Global tracker for current image
let currentImageFile = null;

// Show animated loader + message
function showLoader(container, message) {
  container.innerHTML = `
    <div class="loader"></div>
    <h2 style="color: orange; text-align: center;">${message}</h2>
  `;
}

// Bounce effect for "Defense Activated" heading
function triggerShieldBounce(infoContainer) {
  const shieldTitle = infoContainer.querySelector(".shield-title");
  if (shieldTitle) {
    shieldTitle.classList.remove("bounce");
    void shieldTitle.offsetWidth;
    shieldTitle.classList.add("bounce");
  }
}

const dropzone = document.getElementById('dropzone');

dropzone.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    currentImageFile = file; // ✅ Track original image

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    // Modal setup
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#1e1e2f';
    modal.style.color = 'white';
    modal.style.width = '60vw';
    modal.style.height = '60vh';
    modal.style.display = 'flex';
    modal.style.borderRadius = '20px';
    modal.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '9999';
    modal.style.overflow = 'hidden';

    const imgContainer = document.createElement('div');
    imgContainer.style.flex = '1';
    imgContainer.style.padding = '20px';
    imgContainer.style.display = 'flex';
    imgContainer.style.alignItems = 'center';
    imgContainer.style.justifyContent = 'center';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.borderRadius = '10px';
    imgContainer.appendChild(img);

    const infoContainer = document.createElement('div');
    infoContainer.style.flex = '1';
    infoContainer.style.padding = '30px';
    infoContainer.innerHTML = `
      <h2 style="margin-bottom: 20px;">✅ The image is successfully classified as <span style="color: #00ffaa">${data.predicted_class}</span></h2>
      <p style="font-size: 18px; margin-bottom: 20px;">Confidence: ${(data.confidence * 100).toFixed(2)}%</p>
    `;

    const continueBtn = document.createElement('button');
    continueBtn.textContent = "⚠️ Continue";
    continueBtn.style.marginRight = '10px';
    continueBtn.style.padding = '10px 15px';
    continueBtn.style.border = 'none';
    continueBtn.style.borderRadius = '8px';
    continueBtn.style.background = '#ffaa00';
    continueBtn.style.color = '#000';
    continueBtn.style.cursor = 'pointer';

    continueBtn.onclick = async () => {
      showLoader(infoContainer, "Applying FGSM attack...");
      imgContainer.innerHTML = '';

      const attackForm = new FormData();
      attackForm.append('file', currentImageFile);

      const attackResponse = await fetch('http://localhost:8000/attack', {
        method: 'POST',
        body: attackForm
      });

      // await new Promise(resolve => setTimeout(resolve, 15000)); // simulate loading
      const attackData = await attackResponse.json();

      const attackedImg = document.createElement('img');
      attackedImg.src = `data:image/png;base64,${attackData.attacked_image}`;
      attackedImg.style.maxWidth = '100%';
      attackedImg.style.maxHeight = '100%';
      attackedImg.style.borderRadius = '10px';
      imgContainer.appendChild(img);

      infoContainer.innerHTML = `
        <h2 style="color: red;">🚨 After FGSM Attack</h2>
        <p style="font-size: 20px;">The model now misclassified this image as:</p>
        <p style="font-size: 24px;"><strong style="color: #ff5555;">${attackData.predicted_class}</strong></p>
        <p style="font-size: 18px;">Confidence: ${(attackData.confidence * 100).toFixed(2)}%</p>
        <p style="color: green; font-size: 16px; font-weight: bold;">✅ ${attackData.message}</p>
      `;

      // Re-check button
      const recheckBtn = document.createElement('button');
      recheckBtn.textContent = "🔁 Re-Check";
      recheckBtn.style.marginTop = '20px';
      recheckBtn.style.marginRight = '10px';
      recheckBtn.style.padding = '10px 15px';
      recheckBtn.style.border = 'none';
      recheckBtn.style.borderRadius = '8px';
      recheckBtn.style.background = '#4caf50';
      recheckBtn.style.color = 'white';
      recheckBtn.style.cursor = 'pointer';

      recheckBtn.onclick = () => {
        const newInput = document.createElement('input');
        newInput.type = 'file';
        newInput.accept = 'image/*';

        newInput.onchange = async (event) => {
          const newFile = event.target.files[0];
          if (!newFile) return;

          currentImageFile = newFile;
          showLoader(infoContainer, "Applying FGSM attack...");
          imgContainer.innerHTML = '';

          const newForm = new FormData();
          newForm.append('file', newFile);

          const newResponse = await fetch('http://localhost:8000/attack', {
            method: 'POST',
            body: newForm
          });

          // await new Promise(resolve => setTimeout(resolve, 15000));
          const newData = await newResponse.json();

          const newImg = document.createElement('img');
          newImg.src = URL.createObjectURL(newFile);
          newImg.style.maxWidth = '100%';
          newImg.style.maxHeight = '100%';
          newImg.style.borderRadius = '10px';
          imgContainer.appendChild(newImg);

          infoContainer.innerHTML = `
            <h2 style="color: red;">🚨 After FGSM Attack</h2>
            <p style="font-size: 20px;">The model now misclassified this image as:</p>
            <p style="font-size: 24px;"><strong style="color: #ff5555;">${newData.predicted_class}</strong></p>
            <p style="font-size: 18px;">Confidence: ${(newData.confidence * 100).toFixed(2)}%</p>
            <p style="color: green; font-size: 16px; font-weight: bold;">✅ ${newData.message}</p>
          `;

          infoContainer.appendChild(recheckBtn);
          infoContainer.appendChild(defendBtn);
        };

        newInput.click();
      };

      // Defend Button
      const defendBtn = document.createElement('button');
      defendBtn.textContent = "🛡️ Defend";
      defendBtn.style.marginTop = '20px';
      defendBtn.style.padding = '10px 15px';
      defendBtn.style.border = 'none';
      defendBtn.style.borderRadius = '8px';
      defendBtn.style.background = '#007bff';
      defendBtn.style.color = 'white';
      defendBtn.style.cursor = 'pointer';

      defendBtn.onclick = async () => {
        showLoader(infoContainer, "Activating Hybrid Defense...");
        imgContainer.innerHTML = '';

        const defendForm = new FormData();
        defendForm.append('file', currentImageFile);

        const defendResponse = await fetch('http://localhost:8000/defense', {
          method: 'POST',
          body: defendForm
        });

        await new Promise(resolve => setTimeout(resolve, 15000));
        const defendData = await defendResponse.json();

        const defendedImg = document.createElement('img');
        defendedImg.src = URL.createObjectURL(currentImageFile);
        defendedImg.style.maxWidth = '100%';
        defendedImg.style.maxHeight = '100%';
        defendedImg.style.borderRadius = '10px';
        imgContainer.appendChild(defendedImg);

        infoContainer.innerHTML = `
          <h2 class="shield-title" style="color: #00ffaa;">🛡️ Defense Activated</h2>
          <p style="font-size: 20px;">Prediction after applying defense:</p>
          <p style="font-size: 24px;"><strong style="color: #00ffaa;">${defendData.predicted_class}</strong></p>
          <p style="font-size: 18px;">Confidence: ${(defendData.confidence * 100).toFixed(2)}%</p>
          <p style="color: lightgreen; font-size: 16px; font-weight: bold;">✅ ${defendData.message}</p>
        `;

        triggerShieldBounce(infoContainer);
        infoContainer.appendChild(defendBtn);
      };

      infoContainer.appendChild(recheckBtn);
      infoContainer.appendChild(defendBtn);
    };

    const closeBtn = document.createElement('button');
    closeBtn.textContent = "❌ Close";
    closeBtn.style.padding = '10px 15px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.background = '#ff3b3b';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.transition = 'all 0.3s ease';
    closeBtn.onmouseover = () => closeBtn.style.transform = 'scale(1.1)';
    closeBtn.onmouseout = () => closeBtn.style.transform = 'scale(1)';
    closeBtn.onclick = () => modal.remove();

    infoContainer.appendChild(continueBtn);
    infoContainer.appendChild(closeBtn);

    modal.appendChild(imgContainer);
    modal.appendChild(infoContainer);
    document.body.appendChild(modal);
  };

  input.click();
});

// Smooth scroll button
function scrollToNext() {
  document.getElementById("below").scrollIntoView({ behavior: "smooth" });
}