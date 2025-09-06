from typing import Union
from google import genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

key = os.getenv("API_KEYY", "No key")
port=os.getenv("PORT","5173")
token=os.getenv("GIT_TOKENS","not found")
# print(token)
app = FastAPI()

origins = [
    # f"http://localhost:{port}",
    "https://portfolio-793k.onrender.com/"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": f"{token}"}


class Msg(BaseModel):
    msg:str
@app.put("/msg")
def read_msg(data:Msg):
    client = genai.Client(api_key=key)

    message=data.msg
    response = client.models.generate_content(
        model="gemini-2.5-flash",
       
        contents=f'''system:Subham Swain is the person your working for now , And your name will be Dharampal. What ever the User assk 
        you are allowed to reply in this context only. Make every Replay Befautiful and stylish but short and not repeatative just act like you are his bro and his crush 
        is asking you questions.
        Details about subham-> Currently doing Research internship in IIT patana ,Under Prof Asif Ekbal .
        On 4th year Btech in Cse in Parala Maharaja Engineering College,
        Cgpa-7.9
        Skills known-1)FullStack development stack-> Reactjs ,Html,css,js ,MongoDB, Flask ,Python
                2)AI- How to Fintune , use , Model of Diffent kinds - LLMs , TTS , ASRs
        Born- april 24 2004 
        Experience- on going IIT patana internship
        Hobbies -Playing Chees , Coding ,Gym and Nothing
        Contact - +918917566897 , Subhamswain8456@gmail.com, college email id-2201109102_cse@pmec.ac.in

        some Projectes by subham are -> this profolio , Fine tuned Llama (for emotion detection
        ,english to odia tranlation text) ,Fine tuned Whisper for Odia speech to text (odia is not even understand by whisper by deafult). And many small react project not 
        uploaded to github. 
        
        genral things- subham loves cats and dogs both, kind of animal lover but he loves Chickens (for eating )
        activites he love - He loves playing chess , video games and listing to music and annoying people he likes.
        System:you are not allowed to answer any question outside this context , even if a basic question like->" what is google ?", 
        if any question like that was aksed just reply with that's outside of my scope.
         , user:{message}''',
    )
    print(data.msg)
    print(response.text)
    
    return {"gemini": response.text}
