import {tokenFetch} from '@/lib/fetchClient';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// 마이갤러리 카드 목록 조회
export const fetchMyGalleryCards = async ({
  filterType = '',
  filterValue = '',
  keyword = '',
  page = 1,
  take = 12,
}) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      take: take.toString(),
    });

    if (filterType) queryParams.append('filterType', filterType);
    if (filterValue) queryParams.append('filterValue', filterValue);
    if (keyword) queryParams.append('keyword', keyword);

    const url = `/api/mypage/idle-cards?${queryParams.toString()}`;
    const data = await tokenFetch(url, {cache: 'no-store'});
    return data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      '마이갤러리 카드 조회 중 오류가 발생했습니다.';
    throw new Error(message);
  }
};

// 포토카드 생성
export async function createPhotoCard(data) {
  try {
    return await tokenFetch('/api/mypage/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      '포토카드를 생성하는 중 오류가 발생했습니다.';
    throw new Error(message);
  }
}

// 이미지 업로드
export async function uploadImage(file) {
  const token = localStorage.getItem('accessToken');
  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        result.message || '이미지 업로드 중 오류가 발생했습니다.',
      );
    }

    // imageUrl은 Supabase Storage의 전체 public URL이므로 그대로 반환한다.
    const {imageUrl} = result;
    return imageUrl;
  } catch (error) {
    const message =
      error.message || '이미지 업로드 중 알 수 없는 오류가 발생했습니다.';
    throw new Error(message);
  }
}

// 포토카드 생성 가능 횟수 조회
export async function fetchCardCreationQuota() {
  try {
    return await tokenFetch('/api/mypage/creation-quota');
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      '생성 가능 횟수 조회 중 오류가 발생했습니다.';
    throw new Error(message);
  }
}
