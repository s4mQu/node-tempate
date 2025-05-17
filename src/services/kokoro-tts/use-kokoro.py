from kokoro import KPipeline
from IPython.display import display, Audio
import soundfile as sf
import torch
import argparse
import sys
import os

def main():
    parser = argparse.ArgumentParser(description='Generate speech using Kokoro TTS')
    parser.add_argument('--text', type=str, help='Text to convert to speech')
    parser.add_argument('--voice', type=str, default='bf_emma', help='Voice to use for speech generation')
    args = parser.parse_args()

    if not args.text:
        print("Error: No text provided", file=sys.stderr)
        sys.exit(1)

    # Create output directory if it doesn't exist
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'audio', 'tts')
    os.makedirs(output_dir, exist_ok=True)   

    # Initialize pipeline
    pipeline = KPipeline(lang_code='a')  # American English

    try:
        # Generate speech
        generator = pipeline(
            args.text,
            voice=args.voice,
            speed=1,
            split_pattern=r'\n+'
        )

        # Process each generated audio segment
        for i, (gs, ps, audio) in enumerate(generator):
            output_path = os.path.join(output_dir, f'output_{i}.wav')
            sf.write(output_path, audio, 24000)
            print(f"Saved audio to: {output_path}")

    except Exception as e:
        print(f"Error generating speech: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()