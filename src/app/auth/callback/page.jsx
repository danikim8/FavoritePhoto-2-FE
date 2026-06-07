'use client';

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useModal} from '@/components/modal/ModalContext';
import {useAuth} from '@/providers/AuthProvider';

export default function OAuthCallback() {
  const router = useRouter();
  const {openModal, closeModal} = useModal();
  const {getUser} = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const linked = params.get('linked') === 'true';

    if (!token) {
      router.push('/auth/login');
      return;
    }

    localStorage.setItem('accessToken', token);

    if (linked) {
      // 기존 이메일 계정에 구글 로그인이 처음 연결된 경우 안내.
      // getUser()를 호출하면 user가 세팅되면서 포인트뽑기 모달이 자동으로 열리므로,
      // 알림을 먼저 띄우고 "확인" 이후에 getUser()를 실행해 모달이 겹치지 않게 한다.
      openModal({
        type: 'alert',
        title: '구글 계정 연결됨',
        description:
          '기존 이메일 계정에 구글 로그인이 연결되었습니다.\n이제 이메일/비밀번호와 구글 둘 다 사용할 수 있어요.',
        button: {
          label: '확인',
          onClick: () => {
            closeModal();
            getUser().then(() => router.replace('/market'));
          },
        },
      });
    } else {
      getUser().then(() => router.replace('/market')); // URL에서 ?token=... 제거
    }
  }, []);

  return null;
}
