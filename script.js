const dropzone = document.getElementById('dropzone');

dropzone.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    // Create modal
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

    // Create image container
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

    // Create info container
    const infoContainer = document.createElement('div');
    infoContainer.style.flex = '1';
    infoContainer.style.padding = '30px';
    infoContainer.innerHTML = `
      <h2 style="margin-bottom: 20px;">✅ The image is successfully classified as <span style="color: #00ffaa">${data.predicted_class}</span></h2>
      <p style="font-size: 18px; margin-bottom: 20px;">Confidence: ${(data.confidence * 100).toFixed(2)}%</p>
    `;

    // Continue button (FGSM attack)
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
      infoContainer.innerHTML = `<h2 style="color: orange;">Applying FGSM attack...</h2>`;
    
      const attackForm = new FormData();
      attackForm.append('file', file); // "file" comes from earlier uploaded image
    
      const attackResponse = await fetch('http://127.0.0.1:8000/attack', {
        method: 'POST',
        body: attackForm
      });
    
      const attackData = await attackResponse.json();
    


      const attackedImg = document.createElement('img');
      attackedImg.src = `data:image/png;base64,${attackData.attacked_image}`;
      attackedImg.style.maxWidth = '100%';
      attackedImg.style.maxHeight = '100%';
      attackedImg.style.borderRadius = '10px';
    
      imgContainer.innerHTML = ''; 
      imgContainer.appendChild(img); 
      
      infoContainer.innerHTML = `
        <h2 style="color: red;">🚨 After FGSM Attack</h2>
        <p style="font-size: 20px; margin: 10px 0;">The model now misclassified this image as:</p>
        <p style="font-size: 24px;"><strong style="color: #ff5555;">${attackData.predicted_class}</strong></p>
        <p style="font-size: 18px;">Confidence: ${(attackData.confidence * 100).toFixed(2)}%</p>
        <p style="color: green; font-size: 16px; font-weight: bold;">✅ ${attackData.message}</p>
      `;
    };
    

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = "❌ Close";
    closeBtn.style.padding = '10px 15px';
    closeBtn.style.border = 'none';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.background = '#ff3b3b';
    closeBtn.style.color = 'white';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.transition = 'all 0.3s ease';
    closeBtn.onmouseover = () => {
      closeBtn.style.transform = 'scale(1.1)';
    };
    closeBtn.onmouseout = () => {
      closeBtn.style.transform = 'scale(1)';
    };
    closeBtn.onclick = () => modal.remove();

    infoContainer.appendChild(continueBtn);
    infoContainer.appendChild(closeBtn);

    modal.appendChild(imgContainer);
    modal.appendChild(infoContainer);

    document.body.appendChild(modal);
  };

  input.click();
});

// Scroll on arrow click
function scrollToNext() {
  document.getElementById("below").scrollIntoView({ behavior: "smooth" });
}
