'use client';

import {useEffect, useState} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import {useAuth} from './AuthProvider';
import {useModal} from '@/components/modal/ModalContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// 로그인된 사용자만 접근 가능한 경로
const protectedPaths = [
  // 추가 보호 경로들...
  '/sale',
  '/purchase',
  '/my-gallery',
];

// 미인증 사용자만 접근 가능한 경로
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/market',
  // 추가 공개 경로들...
];

export default function RouteGuard({children}) {
  const {user, loading} = useAuth(); // 로그인 상태를 가져오는 훅 // loading: 사용자 인증 확인 중인지
  const router = useRouter();
  const pathname = usePathname(); // 현재 경로
  const [isLoading, setIsLoading] = useState(true); //경로 접근 허용 판단 중인지
  const {openModal} = useModal();

  useEffect(() => {
    if (loading) return; // 아직 로딩 중이면 아무것도 하지 않음
    // pathname을 경로와 쿼리 부분으로 분리
    const path = pathname.split('?')[0];

    // 정확한 경로 매칭 또는 하위 경로 매칭
    const isProtectedRoute = protectedPaths.some(
      route =>
        path === route || (path.startsWith(route + '/') && route !== '/'),
    );

    // 정확한 경로 매칭 또는 하위 경로 매칭 (단, '/'는 정확히 일치할 때만)
    const isPublicRoute = publicPaths.some(
      route =>
        path === route || (path.startsWith(route + '/') && route !== '/'),
    );

    // 사용자의 인증 상태에 따른 리다이렉트 처리
    if (isProtectedRoute && !user) {
      openModal({
        type: 'alert',
        key: 'login-required',
        title: '로그인이 필요합니다.',
        description:
          '로그인 하시겠습니까?\n다양한 서비스를 편리하게 이용하실 수 있습니다.',
        button: {
          label: '확인',
          onClick: () => router.push('/auth/login'),
        },
      });
      setIsLoading(false);
      return;
    } else if (isPublicRoute && user) {
      if (path === '/auth/login' || path === '/auth/signup' || path === '/') {
        router.push('/market');
      } else {
        setIsLoading(false); // 로그인된 상태에서 공개 경로 접근 허용 시 로딩 종료
      }
    } else {
      setIsLoading(false); // 보호/공개 경로 외 기타 접근 허용
    }
  }, [user, loading, pathname, router]);

  // 리다이렉트 중이거나 인증 확인 중일 때는 컨텐츠를 표시하지 않음
  if (loading || isLoading) {
    return <LoadingSpinner />;
  }

  return children;
}
