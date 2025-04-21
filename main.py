from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from art.estimators.classification import TensorFlowV2Classifier
from art.attacks.evasion import FastGradientMethod

app = FastAPI() 

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("Predict.h5")

class_names = ['airplane', 'automobile', 'bird', 'cat', 'deer', 
               'dog', 'frog', 'horse', 'ship', 'truck']

def preprocess_image(image_bytes) -> np.ndarray:
    image = Image.open(io.BytesIO(image_bytes)).resize((32, 32))
    image_array = np.array(image) / 255.0
    if image_array.shape[-1] == 4:
        image_array = image_array[..., :3]
    image_array = np.expand_dims(image_array, axis=0)
    return image_array

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = preprocess_image(contents)

        prediction = model.predict(image)
        predicted_class = class_names[np.argmax(prediction)]
        confidence = float(np.max(prediction))

        return JSONResponse(content={
            "predicted_class": predicted_class,
            "confidence": confidence
        })

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    

classifier = TensorFlowV2Classifier(
    model=model,
    nb_classes=10,
    input_shape=(32, 32, 3),
    loss_object=tf.keras.losses.CategoricalCrossentropy(),
    clip_values=(0, 1)
)

from io import BytesIO
import base64

@app.post("/attack")
async def attack(file: UploadFile = File(...)):
    try:
        # Read uploaded image
        contents = await file.read()
        image = preprocess_image(contents)

        # FGSM attack
        fgsm = FastGradientMethod(estimator=classifier, eps=0.1)
        adversarial = fgsm.generate(x=image)

        # Predict on adversarial image
        adv_prediction = model.predict(adversarial)
        predicted_class = class_names[np.argmax(adv_prediction)]
        confidence = float(np.max(adv_prediction))

        # Convert adversarial image to base64
        adversarial_image = (adversarial[0] * 255).astype(np.uint8)
        img_pil = Image.fromarray(adversarial_image)
        buffer = BytesIO()
        img_pil.save(buffer, format="PNG")
        base64_img = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return JSONResponse(content={
            "message": "FGSM Attack Successful",
            "predicted_class": predicted_class,
            "confidence": confidence,
            "attacked_image": base64_img
        })

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
