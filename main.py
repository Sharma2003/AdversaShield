from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tensorflow as tf
import numpy as np
from PIL import Image
import io

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://127.0.0.1:5500"]
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
