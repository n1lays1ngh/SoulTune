import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API key from the .env file
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))


def generate_dna_profile(genre, dsp_metrics):
    """
    Injects raw audio math into a zero-shot prompt to generate a poetic DNA profile.
    """
    print("Initiating Gemini LLM translation...")

    # Using the fast model since we just need a quick text generation
    model = genai.GenerativeModel('gemini-2.5-flash')

    # The Zero-Shot Prompt Injection
    prompt = f"""
        You are a Synesthetic Poet whose gift is seeing the 'soul' of music. 
        I will give you the cold, mathematical physics of a song. Your job is to translate this math into a vivid, emotional, and atmospheric description of the song's essence.

        The Raw Physics:
        - Vibe/Genre: {genre}
        - Pulse (BPM): {dsp_metrics['bpm']}
        - Kinetic Energy (RMSE): {dsp_metrics['energy_rmse']}
        - Tonal Brightness (Centroid): {dsp_metrics['brightness_centroid']} Hz

        Strict Translation Rules:
        1. ZERO NUMBERS: You are strictly forbidden from writing any numbers, BPMs, or Hz values in your response. 
        2. TRANSLATE MATH TO FEELING: 
           - High BPM means frantic, rushing, or soaring. Low BPM means deliberate, creeping, or grounded.
           - High Energy (RMSE) means roaring, heavy, or all-consuming. Low Energy means fragile, whispered, or distant.
           - High Brightness means blinding, crystalline, or sharp. Low Brightness means subterranean, murky, or warm.
        3. THE OUTPUT: Write exactly 3 sentences describing the landscape, texture, and emotional weight of this song. Make it sound like a beautiful, ethereal aura reading.
        4. FORMAT: Pure text only. No markdown, no bolding, no asterisks.
        """

    try:
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"LLM Error: {e}")
        return "The genetic sequence was too complex to translate at this time."