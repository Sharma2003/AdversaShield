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

    // Left side: Image preview
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

    // Right side: Prediction and actions
    const infoContainer = document.createElement('div');
    infoContainer.style.flex = '1';
    infoContainer.style.padding = '30px';
    infoContainer.innerHTML = `
      <h2 style="margin-bottom: 20px;">The image is successfully classified as <span style="color: #00ffaa">${data.predicted_class}</span></h2>
      <p style="font-size: 18px; margin-bottom: 20px;">Confidence: ${(data.confidence * 100).toFixed(2)}%</p>
    `;

    // Classify another image button
    const reuploadBtn = document.createElement('button');
    reuploadBtn.textContent = "🔁 Classify another image";
    reuploadBtn.style.marginRight = '10px';
    reuploadBtn.style.padding = '10px 15px';
    reuploadBtn.style.border = 'none';
    reuploadBtn.style.borderRadius = '8px';
    reuploadBtn.style.background = '#007bff';
    reuploadBtn.style.color = 'white';
    reuploadBtn.style.cursor = 'pointer';
    reuploadBtn.onclick = () => {
      modal.remove();
      dropzone.click();
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

    // Add buttons to info section
    infoContainer.appendChild(reuploadBtn);
    infoContainer.appendChild(closeBtn);

    // Append both sides to modal
    modal.appendChild(imgContainer);
    modal.appendChild(infoContainer);

    // Append modal to body
    document.body.appendChild(modal);
  };

  input.click();
});

// Scroll on arrow click
function scrollToNext() {
  document.getElementById("below").scrollIntoView({ behavior: "smooth" });
}
