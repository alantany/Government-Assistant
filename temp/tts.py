
import sys
import pyttsx3

def speak(text):
    engine = pyttsx3.init()
    # 设置中文语音
    voices = engine.getProperty('voices')
    for voice in voices:
        if 'chinese' in voice.languages[0].lower():
            engine.setProperty('voice', voice.id)
            break
    
    # 设置语速（默认是200）
    engine.setProperty('rate', 150)
    # 设置音量（0-1）
    engine.setProperty('volume', 1.0)
    
    try:
        engine.say(text)
        engine.runAndWait()
        return True
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        return False

if __name__ == '__main__':
    if len(sys.argv) > 1:
        text = sys.argv[1]
        speak(text)
