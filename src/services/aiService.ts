import OpenAI from 'openai';
import type { ExtractedPlace } from '../types/database.types';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.warn('OpenAI API Key가 설정되지 않았습니다. .env 파일을 확인해주세요.');
}

const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // 프로덕션에서는 백엔드에서 처리하는 것이 좋습니다
}) : null;

/**
 * 이미지를 리사이징하여 base64로 인코딩 (속도 최적화)
 */
async function encodeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 이미지 리사이징 (최대 1024px)
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        const maxSize = 1024;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context를 가져올 수 없습니다.'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // JPEG로 압축 (품질 85%)
        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve(base64);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * GPT-4 Vision을 사용하여 이미지에서 장소 이름 추출
 */
export async function extractPlacesFromImage(imageFile: File): Promise<ExtractedPlace[]> {
  if (!openai) {
    throw new Error('OpenAI API Key가 설정되지 않았습니다.');
  }

  try {
    // 이미지를 base64로 인코딩
    const base64Image = await encodeImageToBase64(imageFile);

    // GPT-4 Vision API 호출
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 또는 "gpt-4-vision-preview"
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `이 이미지는 인스타그램 장소 추천 게시물의 캡쳐입니다. 
              
이미지에서 모든 장소 이름과 위치를 찾아서 다음 JSON 형식으로 반환해주세요:

{
  "places": [
    {
      "name": "장소 이름 (정확하게)",
      "suggestedCategory": "카테고리 (카페/레스토랑/빈티지샵/베이커리/바/술집/문화/전시/관광지/쇼핑/기타 중 하나)",
      "suggestedLocation": "위치 (예: 성수동, 홍대, 강남역 등 - 이미지에서 추출 가능한 경우만)",
      "confidence": 0.0~1.0 (확신도)
    }
  ]
}

규칙:
1. 장소 이름만 추출하세요 (설명, 해시태그 제외)
2. 위치는 동네/역 이름으로 짧게 (예: "성수동", "홍대", "강남역")
3. 위치를 알 수 없으면 빈 문자열("")로 반환
4. 모든 장소를 빠짐없이 찾아주세요
5. 카테고리는 위의 목록 중에서만 선택하세요
6. 확신도는 0.0~1.0 사이의 숫자로 표현하세요
7. 순수 JSON만 반환하세요 (설명 없이)`
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3, // 낮은 온도로 일관성 있는 결과
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    // JSON 파싱
    let jsonContent = content.trim();
    
    // 코드 블록 제거 (```json ... ``` 형식)
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(jsonContent);
    
    if (!parsed.places || !Array.isArray(parsed.places)) {
      throw new Error('잘못된 응답 형식입니다.');
    }

    return parsed.places.map((place: any) => ({
      name: place.name,
      suggestedCategory: place.suggestedCategory,
      suggestedLocation: place.suggestedLocation || '',
      confidence: place.confidence,
      rawText: content
    }));

  } catch (error) {
    console.error('장소 추출 에러:', error);
    throw error;
  }
}

/**
 * 여러 이미지에서 장소 추출 (병렬 처리로 속도 향상)
 */
export async function extractPlacesFromImages(
  imageFiles: File[],
  onProgress?: (current: number, total: number, places: ExtractedPlace[]) => void
): Promise<ExtractedPlace[]> {
  const allPlaces: ExtractedPlace[] = [];

  // 병렬 처리 (최대 3개씩)
  const batchSize = 3;
  for (let i = 0; i < imageFiles.length; i += batchSize) {
    const batch = imageFiles.slice(i, i + batchSize);
    
    const results = await Promise.allSettled(
      batch.map(file => extractPlacesFromImage(file))
    );

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allPlaces.push(...result.value);
      } else {
        console.error(`${batch[index].name} 처리 중 에러:`, result.reason);
      }
    });

    // 진행상황 콜백
    if (onProgress) {
      const current = Math.min(i + batchSize, imageFiles.length);
      onProgress(current, imageFiles.length, [...allPlaces]);
    }
  }

  // 중복 제거 (이름이 같은 경우)
  const uniquePlaces = allPlaces.reduce((acc, current) => {
    const duplicate = acc.find(item => item.name === current.name);
    if (!duplicate) {
      acc.push(current);
    } else {
      // 중복이 있으면 더 높은 confidence를 가진 것을 유지
      if (current.confidence > duplicate.confidence) {
        const index = acc.indexOf(duplicate);
        acc[index] = current;
      }
    }
    return acc;
  }, [] as ExtractedPlace[]);

  return uniquePlaces;
}
