#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

import cv2
import easyocr
import numpy as np


INPUT_ROOT = Path('/workspace/input').resolve()
REQUESTED_VARIANTS = [
    name.strip()
    for name in os.environ.get('OCR_VARIANTS', 'auto').split(',')
    if name.strip()
]
LOW_CONFIDENCE = float(os.environ.get('OCR_LOW_CONFIDENCE', '0.20'))


def composite(image, background):
    if image.ndim == 2:
        return cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
    if image.shape[2] == 3:
        return image

    color = image[:, :, :3].astype(np.float32)
    alpha = image[:, :, 3:4].astype(np.float32) / 255.0
    backdrop = np.full_like(color, background, dtype=np.float32)
    return np.clip(color * alpha + backdrop * (1.0 - alpha), 0, 255).astype(np.uint8)


def make_variant(image, name):
    if name == 'white':
        return composite(image, 255)
    if name == 'black':
        return composite(image, 0)
    if name == 'contrast':
        white = composite(image, 255)
        gray = cv2.cvtColor(white, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
        return cv2.cvtColor(clahe, cv2.COLOR_GRAY2BGR)
    raise ValueError(f'Unknown OCR variant: {name}')


def candidate_from_result(variant, result):
    useful = [item for item in result if str(item[1]).strip()]
    text = ' '.join(str(item[1]).strip() for item in useful)
    weights = [max(len(str(item[1]).strip()), 1) for item in useful]
    confidence = (
        sum(float(item[2]) * weight for item, weight in zip(useful, weights)) / sum(weights)
        if weights else 0.0
    )
    return {
        'variant': variant,
        'text': text,
        'confidence': confidence,
        'boxes': len(useful),
    }


def recognize(reader, image, variant):
    result = reader.readtext(
        make_variant(image, variant),
        decoder='greedy',
        detail=1,
        paragraph=False,
        min_size=5,
        contrast_ths=0.15,
        adjust_contrast=0.7,
        text_threshold=0.55,
        low_text=0.3,
        link_threshold=0.3,
        canvas_size=1280,
        mag_ratio=1.5,
        add_margin=0.08,
    )
    return candidate_from_result(variant, result)


def choose_candidate(candidates):
    usable = [candidate for candidate in candidates if candidate['text']]
    if not usable:
        return {'variant': None, 'text': '', 'confidence': 0.0, 'boxes': 0}

    occurrences = {}
    for candidate in usable:
        key = ''.join(candidate['text'].split()).casefold()
        occurrences[key] = occurrences.get(key, 0) + 1

    def score(candidate):
        key = ''.join(candidate['text'].split()).casefold()
        agreement_bonus = 0.12 * (occurrences[key] - 1)
        length_bonus = min(len(candidate['text']), 12) * 0.002
        return candidate['confidence'] + agreement_bonus + length_bonus

    return max(usable, key=score)


def safe_input_path(relative_path):
    candidate = (INPUT_ROOT / relative_path).resolve()
    if candidate != INPUT_ROOT and INPUT_ROOT not in candidate.parents:
        raise ValueError('Path is outside the mounted project')
    return candidate


def process(reader, request):
    relative_path = request['path']
    image_path = safe_input_path(relative_path)
    image = cv2.imread(str(image_path), cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError('Unable to read image')

    if REQUESTED_VARIANTS == ['auto']:
        candidates = [recognize(reader, image, 'white')]
        first = candidates[0]
        if not first['text'] or first['confidence'] < LOW_CONFIDENCE:
            candidates.append(recognize(reader, image, 'black'))
    else:
        candidates = [
            recognize(reader, image, variant)
            for variant in REQUESTED_VARIANTS
        ]

    best = choose_candidate(candidates)
    return {
        'id': request['id'],
        'path': relative_path,
        'text': best['text'],
        'confidence': best['confidence'],
        'variant': best['variant'],
        'candidates': candidates,
        'error': None,
    }


def main():
    reader = easyocr.Reader(
        ['ch_tra', 'en'],
        gpu=False,
        model_storage_directory='/workspace/models',
        download_enabled=False,
        verbose=False,
    )

    for line in sys.stdin:
        if not line.strip():
            continue
        request = json.loads(line)
        try:
            response = process(reader, request)
        except Exception as error:
            response = {
                'id': request.get('id'),
                'path': request.get('path'),
                'text': '',
                'confidence': 0.0,
                'variant': None,
                'candidates': [],
                'error': str(error),
            }
        print(json.dumps(response, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    main()
